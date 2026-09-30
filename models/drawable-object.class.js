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

  /**
   * Lädt das aktuelle Bild.
   */
  loadImage(path) {
    this.img = new Image();
    this.img.src = path;
  }

  /**
   * Zeichnet das Bild und ignoriert Fehler, solange es noch lädt.
   */
  draw(ctx) {
    if (!this.img) return;
    try {
      this.drawFrame(ctx);
    } catch (e) {
      // Fehler beim Zeichnen ignorieren (Bild noch nicht geladen)
    }
  }

  /**
   * Zeichnet das Bild, auch wenn es noch nicht fertig geladen ist.
   */
  drawFrame(ctx) {
    const ready = this.img.complete && this.img.naturalWidth > 0;
    if (ready || this.img.src) {
      ctx.drawImage(this.img, this.x, this.y || 0, this.width, this.height);
    }
  }

  /**
   * Lädt eine Bildfolge in den Cache.
   */
  loadImages(arr) {
    arr.forEach((path) => {
      let img = new Image();
      img.src = path;
      this.imageCache[path] = img;
    });
  }
}
