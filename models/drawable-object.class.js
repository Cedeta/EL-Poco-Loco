class DrawableObject {
  img;
  imageCache = {};
  currentImage = 0;
  x = 5;
  height = 230;
  width = 130;
  offset = {
    top: 0,
    right: 0,
    bottom: 0,
    left: 0,
  };

  loadImage(path) {
    this.img = new Image();
    this.img.src = path;
  }

  draw(ctx) {
    if (this.img) {
      try {
        // Prüfen ob Bild geladen ist
        if (this.img.complete && this.img.naturalWidth > 0) {
          ctx.drawImage(this.img, this.x, this.y || 0, this.width, this.height);
        } else if (this.img.src) {
          // Bild wird noch geladen, trotzdem versuchen
          ctx.drawImage(this.img, this.x, this.y || 0, this.width, this.height);
        }
      } catch (e) {
        // Fehler beim Zeichnen ignorieren (Bild noch nicht geladen)
      }
    }
  }

  loadImages(arr) {
    arr.forEach((path) => {
      let img = new Image();
      img.src = path;
      this.imageCache[path] = img;
    });
  }
}
