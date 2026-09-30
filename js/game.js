let canvas;
let world;
let keyboard = new Keyboard();
let pausedUI = false;
let activeIntervals = [];
let animationFrameId = 0;
const SOUND_STORAGE_KEY = "soundEnabled";
window.soundEnabled = true;

/**
 * Merkt sich ein Intervall, damit es beim Spielende gestoppt werden kann.
 * @param {Function} callback - Ablauf, der wiederholt wird.
 * @param {number} delay - Abstand in Millisekunden.
 * @returns {number} ID des Intervalls.
 */
function trackInterval(callback, delay) {
  const id = setInterval(callback, delay);
  activeIntervals.push(id);
  return id;
}

/**
 * Merkt sich den nächsten Zeichen-Frame.
 * @param {number} id - ID von requestAnimationFrame.
 * @returns {void}
 */
function rememberFrame(id) {
  animationFrameId = id;
}

/**
 * Stoppt Bewegungsintervalle und den Zeichen-Loop nach Win oder Lose.
 * @returns {void}
 */
function stopAllLoops() {
  activeIntervals.forEach((id) => clearInterval(id));
  activeIntervals = [];
  cancelAnimationFrame(animationFrameId);
  animationFrameId = 0;
}

/**
 * Beendet die Welt: keine Bewegung, keine Kollision, keine Gameplay-Sounds.
 * @returns {void}
 */
function endWorld() {
  if (!world) return;
  world.gameOver = true;
  world.character?.stopSounds();
  stopEnemyEnterSounds();
  stopWorldAudio();
  stopAllLoops();
}

/**
 * Lädt Canvas und den zuletzt gespeicherten Sound-Status.
 * @returns {void}
 */
function init() {
  canvas = document.getElementById("canvas");
  loadSoundSetting();
  applySoundIcon();
}

/**
 * Stellt den Mute-Status aus localStorage wieder her.
 * @returns {void}
 */
function loadSoundSetting() {
  const stored = localStorage.getItem(SOUND_STORAGE_KEY);
  if (stored === "true" || stored === "false") {
    window.soundEnabled = stored === "true";
  }
}

/**
 * Merkt sich den Mute-Status für den nächsten Seitenaufruf.
 * @returns {void}
 */
function saveSoundSetting() {
  localStorage.setItem(SOUND_STORAGE_KEY, String(window.soundEnabled));
}

/**
 * Zeigt am vorhandenen Button, ob der Sound an oder aus ist.
 * @returns {void}
 */
function applySoundIcon() {
  const icon = document.getElementById("sound-toggle");
  if (!icon) return;
  icon.src = soundIconPath();
}

/**
 * Liefert das Icon passend zum aktuellen Sound-Status.
 * @returns {string} Pfad zur Icon-Datei.
 */
function soundIconPath() {
  if (window.soundEnabled) return "./assets/img/icons/volume.png";
  return "./assets/img/icons/volume-mute.png";
}

/**
 * Startet einen Clip nur, solange der Sound nicht stumm ist.
 * @param {HTMLAudioElement|null|undefined} audio - Clip, der starten soll.
 * @param {boolean} [rewind=true] - Bei false läuft ein schon spielender Clip weiter.
 * @returns {void}
 */
function playSound(audio, rewind = true) {
  if (!audio || window.soundEnabled === false) return;
  if (rewind) audio.currentTime = 0;
  audio.play().catch(() => {});
}

/**
 * Stoppt einen Clip und setzt ihn zurück, damit er nicht weiterläuft.
 * @param {HTMLAudioElement|null|undefined} audio - Clip, der stoppen soll.
 * @returns {void}
 */
function stopSound(audio) {
  if (!audio) return;
  audio.pause();
  audio.currentTime = 0;
}

/**
 * Stoppt laufende Spielsounds, damit Mute sofort wirkt.
 * @returns {void}
 */
function stopActiveSounds() {
  if (!world) return;
  world.character?.stopSounds();
  stopEnemyEnterSounds();
  stopSound(world.bossMusic);
  stopSound(world.backgroundMusic);
  stopSound(world.winSound);
  stopSound(world.loseSound);
  stopSound(world.breakSound);
}

/**
 * Stoppt laufende Gegner-Clips, damit Mute sofort wirkt.
 * @returns {void}
 */
function stopEnemyEnterSounds() {
  const enemies = world?.level?.enemies || [];
  enemies.forEach((enemy) => stopEnemyClips(enemy));
}

/**
 * Stoppt Boss-Eintritt sowie Hühner-Schritte und Todes-Sound.
 * @param {object} enemy - Gegner mit optionalen Audio-Clips.
 * @returns {void}
 */
function stopEnemyClips(enemy) {
  stopSound(enemy.enter_sound);
  stopSound(enemy.walking_sound);
  stopSound(enemy.death_sound);
}

/**
 * Entsperrt die Audio-Ausgabe ohne hörbaren Schnarchton.
 * @returns {void}
 */
function unlockAudioOutput() {
  const audio = world?.character?.idle_sound;
  if (!audio || window.soundEnabled === false) return;
  const previousVolume = audio.volume;
  audio.volume = 0;
  audio.play().then(() => releaseUnlock(audio, previousVolume)).catch(() => {
    audio.volume = previousVolume;
  });
}

/**
 * Setzt den entsperrten Clip zurück und stellt die Lautstärke her.
 * @param {HTMLAudioElement} audio - Kurz entsperrter Clip.
 * @param {number} previousVolume - Lautstärke vor dem Entsperren.
 * @returns {void}
 */
function releaseUnlock(audio, previousVolume) {
  stopSound(audio);
  audio.volume = previousVolume;
}

function startGame() {
  const overlay = document.getElementById("start-overlay");
  if (world) return; 

  document.body.classList.add("game-started");

  const container = document.getElementById("game-container");
  const isTouch = window.matchMedia?.("(pointer: coarse)")?.matches;
  if (isTouch && container && !document.fullscreenElement) {
    container.requestFullscreen?.().catch(() => {});
  }

  world = new World(canvas, keyboard);

  setTimeout(() => {
    if (overlay) overlay.style.display = "none";
  }, 50);

  unlockAudioOutput();
}

/**
 * Stoppt die Musik der laufenden Welt, bevor sie ersetzt oder verlassen wird.
 * @returns {void}
 */
function stopWorldAudio() {
  if (!world) return;
  stopSound(world.backgroundMusic);
  stopSound(world.bossMusic);
}

function showGameOver() {
  const overlay = document.getElementById("gameover-overlay");
  if (overlay) overlay.style.display = "flex";
  playLoseOnce();
  endWorld();
}

/**
 * Spielt den Niederlagen-Sound einmal. Der Welt-Stopp schneidet ihn nicht ab.
 * @returns {void}
 */
function playLoseOnce() {
  if (!world || world.loseSoundPlayed) return;
  world.loseSoundPlayed = true;
  playSound(world.loseSound);
}

function backToMenu() {
  const gameover = document.getElementById("gameover-overlay");
  const start = document.getElementById("start-overlay");
  if (gameover) gameover.style.display = "none";
  if (start) start.style.display = "flex";
  hidePauseOverlay();
  pausedUI = false;
  document.body.classList.remove("game-started");
  stopSound(world?.loseSound);
  stopWorldAudio();
  stopAllLoops();
  world = null;
}

function restartGame() {
  const gameover = document.getElementById("gameover-overlay");
  const start = document.getElementById("start-overlay");
  if (gameover) gameover.style.display = "none";
  if (start) start.style.display = "none";

  stopSound(world?.loseSound);
  stopWorldAudio();
  stopAllLoops();
  world = new World(canvas, keyboard);
}

function showWin() {
  const win = document.getElementById("win-overlay");
  const gameover = document.getElementById("gameover-overlay");
  if (gameover) gameover.style.display = "none";
  if (win) win.style.display = "flex";
  endWorld();
}

function backToMenuFromWin() {
  const win = document.getElementById("win-overlay");
  const start = document.getElementById("start-overlay");
  if (win) win.style.display = "none";
  if (start) start.style.display = "flex";
  document.body.classList.remove("game-started");
  stopWorldAudio();
  stopAllLoops();
  world = null;
}

function restartGameFromWin() {
  const win = document.getElementById("win-overlay");
  const start = document.getElementById("start-overlay");
  if (win) win.style.display = "none";
  if (start) start.style.display = "none";
  stopWorldAudio();
  stopAllLoops();
  world = new World(canvas, keyboard);
}

/**
 * Schaltet den bestehenden Sound-Status um und speichert ihn.
 * Beim Stummschalten werden laufende Clips sofort gestoppt.
 * @returns {void}
 */
function toggleSound() {
  window.soundEnabled = !window.soundEnabled;
  saveSoundSetting();
  applySoundIcon();
  if (!window.soundEnabled) stopActiveSounds();
  else resumeGameMusic();
}

/**
 * Setzt Hintergrund- und Boss-Musik nach dem Einschalten fort.
 * @returns {void}
 */
function resumeGameMusic() {
  world?.resumeBackgroundMusic();
  world?.resumeBossMusic();
}

function toggleFullscreen() {
  const container = document.getElementById("game-container");
  if (!container) return;

  if (document.fullscreenElement) {
    document.exitFullscreen?.().catch?.(() => {});
  } else {
    container.requestFullscreen?.().catch(() => {});
  }
}
window.toggleFullscreen = toggleFullscreen;

function exitFullscreenOnPortrait() {
  const isTouch = window.matchMedia?.("(pointer: coarse)")?.matches;
  if (!isTouch) return;
  const isPortrait = window.innerHeight > window.innerWidth;
  if (isPortrait && document.fullscreenElement) {
    document.exitFullscreen?.().catch?.(() => {});
  }
}
window.addEventListener("orientationchange", exitFullscreenOnPortrait);
window.addEventListener("resize", exitFullscreenOnPortrait);


function showPauseOverlay() {
  const o = document.getElementById("pause-overlay");
  if (o) o.style.display = "flex";
}

function hidePauseOverlay() {
  const o = document.getElementById("pause-overlay");
  if (o) o.style.display = "none";
}

function togglePauseUI() {
  if (!world) return;
  if (world.gameOver) return;

  pausedUI = !pausedUI;
  if (world && typeof world.togglePause === "function") {
    world.togglePause();
  }
  if (pausedUI) showPauseOverlay();
  else hidePauseOverlay();
}

window.togglePauseUI = togglePauseUI;

function resumeGame() {
  if (pausedUI) togglePauseUI();
}
window.resumeGame = resumeGame;

function openHowto() {
  const o = document.getElementById("howto-overlay");
  if (o) o.style.display = "flex";
}

function closeHowto() {
  const o = document.getElementById("howto-overlay");
  if (o) o.style.display = "none";
}

window.openHowto = openHowto;
window.closeHowto = closeHowto;

window.toggleSound = toggleSound;

window.startGame = startGame;
window.showGameOver = showGameOver;
window.backToMenu = backToMenu;
window.restartGame = restartGame;

window.showWin = showWin;
window.backToMenuFromWin = backToMenuFromWin;
window.restartGameFromWin = restartGameFromWin;

function initTouchControls() {
  const left = document.getElementById("dpad-left");
  const right = document.getElementById("dpad-right");
  const throwBtn = document.getElementById("btn-throw");
  const jumpBtn = document.getElementById("btn-jump");

  if (left) {
    left.addEventListener("pointerdown", (e) => {
      e.preventDefault();
      left.setPointerCapture?.(e.pointerId);
      keyboard.LEFT = true;
    });
    left.addEventListener("pointerup", (e) => {
      e.preventDefault();
      keyboard.LEFT = false;
    });
    left.addEventListener("pointercancel", (e) => {
      e.preventDefault();
      keyboard.LEFT = false;
    });
    left.addEventListener("pointerleave", (e) => {
      e.preventDefault();
      keyboard.LEFT = false;
    });
  }
  if (right) {
    right.addEventListener("pointerdown", (e) => {
      e.preventDefault();
      right.setPointerCapture?.(e.pointerId);
      keyboard.RIGHT = true;
    });
    right.addEventListener("pointerup", (e) => {
      e.preventDefault();
      keyboard.RIGHT = false;
    });
    right.addEventListener("pointercancel", (e) => {
      e.preventDefault();
      keyboard.RIGHT = false;
    });
    right.addEventListener("pointerleave", (e) => {
      e.preventDefault();
      keyboard.RIGHT = false;
    });
  }
  if (throwBtn) {
    throwBtn.addEventListener("pointerdown", (e) => {
      e.preventDefault();
      keyboard.SPACE = true;
      setTimeout(() => (keyboard.SPACE = false), 250);
    });
  }
  if (jumpBtn) {
    jumpBtn.addEventListener("pointerdown", (e) => {
      e.preventDefault();
      keyboard.UP = true;
      setTimeout(() => (keyboard.UP = false), 150);
    });
  }
}
window.addEventListener("load", initTouchControls);

// Welche Taste wurde gedrückt
window.addEventListener("keydown", (event) => {
  // nach Rechts gehen
  if (event.key === "ArrowRight") {
    keyboard.RIGHT = true;
  }

  // nach links gehen
  if (event.key === "ArrowLeft") {
    keyboard.LEFT = true;
  }

  // nach oben (springen)
  if (event.key === "ArrowUp") {
    keyboard.UP = true;
  }

  //  Bottle werfen
  if (event.code === "Space") {
    keyboard.SPACE = true;
  }

  // Pause
  if ((event.key === "p" || event.key === "P") && !event.repeat) {
    togglePauseUI();
  }

  console.log(event);
});



// sobald die Taste wieder losgelassen wird
window.addEventListener("keyup", (event) => {
  // nach Rechts gehen
  if (event.key === "ArrowRight") {
    keyboard.RIGHT = false;
  }

  // nach links gehen
  if (event.key === "ArrowLeft") {
    keyboard.LEFT = false;
  }

  // nach oben springen
  if (event.key === "ArrowUp") {
    keyboard.UP = false;
  }

  console.log(event);
});
