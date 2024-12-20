class DrawableObject {
  img;
  imageCache = {};
  currentImage = 0;
  x = 5;
  height = 230;
  width = 130;

  loadImage(path) {
    this.img = new Image();
    this.img.src = path;
  }

  draw(ctx) {
    ctx.drawImage(this.img, this.x, this.y, this.width, this.height);
  }
}
