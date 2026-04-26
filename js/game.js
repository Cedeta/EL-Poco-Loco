let canvas;
let world;
let keyboard = new Keyboard();
window.soundEnabled = true;


function init() {
  canvas = document.getElementById("canvas");
}

function startGame() {
  const overlay = document.getElementById("start-overlay");
  if (world) return; 

  const container = document.getElementById("game-container");
  const isTouch = window.matchMedia?.("(pointer: coarse)")?.matches;
  if (isTouch && container && !document.fullscreenElement) {
    container.requestFullscreen?.().catch(() => {});
  }

  world = new World(canvas, keyboard);

  setTimeout(() => {
    if (overlay) overlay.style.display = "none";
  }, 50);

  const a = world.character.idle_sound;
  a.currentTime = 0;
  a.play()
    .then(() => {
      a.pause();
      a.currentTime = 0;
    })
    .catch(() => {});
}

function showGameOver() {
  const overlay = document.getElementById("gameover-overlay");
  if (overlay) overlay.style.display = "flex";
  if (world) world.gameOver = true;
}

function backToMenu() {
  const gameover = document.getElementById("gameover-overlay");
  const start = document.getElementById("start-overlay");
  if (gameover) gameover.style.display = "none";
  if (start) start.style.display = "flex";
  hidePauseOverlay();
  pausedUI = false;
  world = null; 
}

function restartGame() {
  const gameover = document.getElementById("gameover-overlay");
  const start = document.getElementById("start-overlay");
  if (gameover) gameover.style.display = "none";
  if (start) start.style.display = "none";

  world = new World(canvas, keyboard);
}

function showWin() {
  const win = document.getElementById("win-overlay");
  const gameover = document.getElementById("gameover-overlay");
  if (gameover) gameover.style.display = "none";
  if (win) win.style.display = "flex";
  if (world) {
    world.gameOver = true;

    if (world.bossMusic) {
      world.bossMusic.pause();
      world.bossMusic.currentTime = 0;
    }

    const c = world.character;
    if (c) {
      c.walking_sound.pause();
      c.walking_sound.currentTime = 0;
      c.jump_sound.pause();
      c.jump_sound.currentTime = 0;
      c.idle_sound.pause();
      c.idle_sound.currentTime = 0;
      c.hit_sound.pause();
      c.hit_sound.currentTime = 0;
      c.die_sound.pause();
      c.die_sound.currentTime = 0;
    }

    world.level.enemies.forEach((enemy) => {
      if (enemy && enemy.enter_sound) {
        enemy.enter_sound.pause();
        enemy.enter_sound.currentTime = 0;
      }
    });
  }
}

function backToMenuFromWin() {
  const win = document.getElementById("win-overlay");
  const start = document.getElementById("start-overlay");
  if (win) win.style.display = "none";
  if (start) start.style.display = "flex";
  world = null;
}

function restartGameFromWin() {
  const win = document.getElementById("win-overlay");
  const start = document.getElementById("start-overlay");
  if (win) win.style.display = "none";
  if (start) start.style.display = "none";
  world = new World(canvas, keyboard);
}

function toggleSound() {
  window.soundEnabled = !window.soundEnabled;
  const icon = document.getElementById("sound-toggle");
  if (icon) {
    icon.src = window.soundEnabled
      ? "./assets/img/icons/volume.png"
      : "./assets/img/icons/volume-mute.png";
  }
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

let pausedUI = false;

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
