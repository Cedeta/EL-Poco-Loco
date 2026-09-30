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
 */
function trackInterval(callback, delay) {
  const id = setInterval(callback, delay);
  activeIntervals.push(id);
  return id;
}

/**
 * Merkt sich den nächsten Zeichen-Frame.
 */
function rememberFrame(id) {
  animationFrameId = id;
}

/**
 * Stoppt Bewegungsintervalle und den Zeichen-Loop nach Win oder Lose.
 */
function stopAllLoops() {
  activeIntervals.forEach((id) => clearInterval(id));
  activeIntervals = [];
  cancelAnimationFrame(animationFrameId);
  animationFrameId = 0;
}

/**
 * Beendet die Welt: keine Bewegung, keine Kollision, keine Gameplay-Sounds.
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
 */
function init() {
  canvas = document.getElementById("canvas");
  loadSoundSetting();
  applySoundIcon();
}

/**
 * Stellt den Mute-Status aus localStorage wieder her.
 */
function loadSoundSetting() {
  const stored = localStorage.getItem(SOUND_STORAGE_KEY);
  if (stored === "true" || stored === "false") {
    window.soundEnabled = stored === "true";
  }
}

/**
 * Merkt sich den Mute-Status für den nächsten Seitenaufruf.
 */
function saveSoundSetting() {
  localStorage.setItem(SOUND_STORAGE_KEY, String(window.soundEnabled));
}

/**
 * Zeigt am vorhandenen Button, ob der Sound an oder aus ist.
 */
function applySoundIcon() {
  const icon = document.getElementById("sound-toggle");
  if (!icon) return;
  icon.src = soundIconPath();
}

/**
 * Liefert das Icon passend zum aktuellen Sound-Status.
 */
function soundIconPath() {
  if (window.soundEnabled) return "./assets/img/icons/volume.png";
  return "./assets/img/icons/volume-mute.png";
}

/**
 * Startet einen Clip nur, solange der Sound nicht stumm ist.
 */
function playSound(audio, rewind = true) {
  if (!audio || window.soundEnabled === false) return;
  if (rewind) audio.currentTime = 0;
  audio.play().catch(() => {});
}

/**
 * Stoppt einen Clip und setzt ihn zurück, damit er nicht weiterläuft.
 */
function stopSound(audio) {
  if (!audio) return;
  audio.pause();
  audio.currentTime = 0;
}

/**
 * Stoppt laufende Spielsounds, damit Mute sofort wirkt.
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
 */
function stopEnemyEnterSounds() {
  const enemies = world?.level?.enemies || [];
  enemies.forEach((enemy) => stopEnemyClips(enemy));
}

/**
 * Stoppt Boss-Eintritt sowie Hühner-Schritte und Todes-Sound.
 */
function stopEnemyClips(enemy) {
  stopSound(enemy.enter_sound);
  stopSound(enemy.walking_sound);
  stopSound(enemy.death_sound);
}

/**
 * Entsperrt die Audio-Ausgabe ohne hörbaren Schnarchton.
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
 */
function releaseUnlock(audio, previousVolume) {
  stopSound(audio);
  audio.volume = previousVolume;
}

/**
 * Startet eine neue Welt und blendet den Startbildschirm aus.
 */
function startGame() {
  const overlay = document.getElementById("start-overlay");
  if (world) return;
  document.body.classList.add("game-started");
  requestTouchFullscreen();
  world = new World(canvas, keyboard);
  hideStartOverlay(overlay);
  unlockAudioOutput();
}

/**
 * Öffnet auf Touch-Geräten den Vollbildmodus des Spielfelds.
 */
function requestTouchFullscreen() {
  const container = document.getElementById("game-container");
  const isTouch = window.matchMedia?.("(pointer: coarse)")?.matches;
  if (isTouch && container && !document.fullscreenElement) {
    container.requestFullscreen?.().catch(() => {});
  }
}

/**
 * Blendet den Startbildschirm kurz nach dem Start aus.
 */
function hideStartOverlay(overlay) {
  setTimeout(() => {
    if (overlay) overlay.style.display = "none";
  }, 50);
}

/**
 * Stoppt die Musik der laufenden Welt, bevor sie ersetzt oder verlassen wird.
 */
function stopWorldAudio() {
  if (!world) return;
  stopSound(world.backgroundMusic);
  stopSound(world.bossMusic);
}

/**
 * Zeigt Game Over und spielt den Niederlagen-Sound einmal.
 */
function showGameOver() {
  const overlay = document.getElementById("gameover-overlay");
  if (overlay) overlay.style.display = "flex";
  playLoseOnce();
  endWorld();
}

/**
 * Spielt den Niederlagen-Sound einmal. Der Welt-Stopp schneidet ihn nicht ab.
 */
function playLoseOnce() {
  if (!world || world.loseSoundPlayed) return;
  world.loseSoundPlayed = true;
  playSound(world.loseSound);
}

/**
 * Kehrt vom Game Over zum Startbildschirm zurück und stoppt die Welt.
 */
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

/**
 * Startet nach einer Niederlage eine neue Welt.
 */
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

/**
 * Zeigt den Sieg-Bildschirm und stoppt die Welt.
 */
function showWin() {
  const win = document.getElementById("win-overlay");
  const gameover = document.getElementById("gameover-overlay");
  if (gameover) gameover.style.display = "none";
  if (win) win.style.display = "flex";
  endWorld();
}

/**
 * Kehrt vom Sieg zum Startbildschirm zurück.
 */
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

/**
 * Startet nach einem Sieg eine neue Welt.
 */
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
 */
function resumeGameMusic() {
  world?.resumeBackgroundMusic();
  world?.resumeBossMusic();
}

/**
 * Schaltet den Vollbildmodus des Spielfelds um.
 */
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

/**
 * Verlässt den Vollbildmodus, wenn ein Touch-Gerät hochkant steht.
 */
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


/**
 * Zeigt das Pause-Fenster.
 */
function showPauseOverlay() {
  const o = document.getElementById("pause-overlay");
  if (o) o.style.display = "flex";
}

/**
 * Blendet das Pause-Fenster aus.
 */
function hidePauseOverlay() {
  const o = document.getElementById("pause-overlay");
  if (o) o.style.display = "none";
}

/**
 * Pausiert oder setzt das Spiel fort und zeigt das passende Fenster.
 */
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

/**
 * Setzt das Spiel fort, wenn es pausiert ist.
 */
function resumeGame() {
  if (pausedUI) togglePauseUI();
}
window.resumeGame = resumeGame;

/**
 * Öffnet die Steuerungshilfe.
 */
function openHowto() {
  const o = document.getElementById("howto-overlay");
  if (o) o.style.display = "flex";
}

/**
 * Schließt die Steuerungshilfe.
 */
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

/**
 * Bindet die mobilen Tasten an die vorhandene Tastatur.
 */
function initTouchControls() {
  bindHold("dpad-left", "LEFT");
  bindHold("dpad-right", "RIGHT");
  bindTap("btn-throw", "SPACE", 250);
  bindTap("btn-jump", "UP", 150);
}

/**
 * Hält eine Taste, solange der Finger auf dem Button liegt.
 */
function bindHold(id, key) {
  const button = document.getElementById(id);
  if (!button) return;
  button.addEventListener("pointerdown", (event) => pressHold(button, event, key));
  button.addEventListener("pointerup", (event) => releaseHold(event, key));
  button.addEventListener("pointercancel", (event) => releaseHold(event, key));
  button.addEventListener("pointerleave", (event) => releaseHold(event, key));
}

/**
 * Setzt die Taste und hält den Finger auf dem Button fest.
 */
function pressHold(button, event, key) {
  event.preventDefault();
  button.setPointerCapture?.(event.pointerId);
  keyboard[key] = true;
}

/**
 * Lässt die gehaltene Taste wieder los.
 */
function releaseHold(event, key) {
  event.preventDefault();
  keyboard[key] = false;
}

/**
 * Tippt eine Taste für eine kurze, feste Zeit.
 */
function bindTap(id, key, duration) {
  const button = document.getElementById(id);
  if (!button) return;
  button.addEventListener("pointerdown", (event) => tapKey(event, key, duration));
}

/**
 * Setzt die Taste kurz und lässt sie danach wieder los.
 */
function tapKey(event, key, duration) {
  event.preventDefault();
  keyboard[key] = true;
  setTimeout(() => {
    keyboard[key] = false;
  }, duration);
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
});
