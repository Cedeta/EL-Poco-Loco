let canvas;
let world;
let keyboard = new Keyboard();
window.soundEnabled = true;


function init() {
  canvas = document.getElementById("canvas");
}

function startGame() {
  const overlay = document.getElementById("start-overlay");
  if (world) return; // doppelt starten verhindern
  world = new World(canvas, keyboard);
  if (overlay) overlay.style.display = "none";
  // Audio-Entsperrung fürs Snoring (einmalig per User-Click)
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
  world = null; // damit Start wieder ein neues World starten darf
}
function restartGame() {
  const gameover = document.getElementById("gameover-overlay");
  const start = document.getElementById("start-overlay");
  if (gameover) gameover.style.display = "none";
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
window.toggleSound = toggleSound;

window.startGame = startGame;
window.showGameOver = showGameOver;
window.backToMenu = backToMenu;
window.restartGame = restartGame;

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
  //  Bottle werfen
  if (event.code === "Space") {
    keyboard.SPACE = false;
  }

  console.log(event);
});
