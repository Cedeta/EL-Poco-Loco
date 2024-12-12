class MovableObject {
  x = 5;
  y = 180;
  height = 265;
  width = 165;
  img;

  loadImage(path) {
    this.img = new Image();
    this.img.src = path;
  }

  moveRight() {
    console.log("moving right");
  }

  moveLeft() {}
}
