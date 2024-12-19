class MovableObject {
  x = 5;
  y = 193;
  height = 230;
  width = 130;
  img;
  imageCache = {};
  currentImage = 0;
  speed = 0.15;
  otherDirection = false;

  loadImage(path) {
    this.img = new Image();
    this.img.src = path;
  }

  loadImages(arr) {
    arr.forEach((path) => {
      let img = new Image();
      img.src = path;
      this.imageCache[path] = img;
    });
  }

  moveRight() {
    console.log("moving right");
  }

  // Nach Links bewegen ( enemys )
  moveLeft() {
    setInterval(() => {
      this.x -= this.speed;
    }, 1000 / 60);
  }

  playAnimation(images) {
    let i = this.currentImage % this.IMAGES_WALKING.length; // index soll heißen: ergeht durch die json und fängt nach dem ende wieder bei 1 an.
    let path = images[i];
    this.img = this.imageCache[path];
    this.currentImage++;
  }
}
