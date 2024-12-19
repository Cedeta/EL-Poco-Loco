let canvas;
let world;
let keyboard = new Keyboard();

function init() {
  canvas = document.getElementById("canvas");
  world = new World(canvas, keyboard);

  console.log("my character is", world.character);
}

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
  // nach oben (springen?)
  if (event.key === "ArrowUp") {
    keyboard.UP = true;
  }
  // nach oben (springen?)
  if (event.key === "Space") {
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
  // nach oben (springen?)
  if (event.key === "ArrowUp") {
    keyboard.UP = false;
  }
  // nach oben (springen?)
  if (event.key === "Space") {
    keyboard.SPACE = false;
  }

  console.log(event);
});
