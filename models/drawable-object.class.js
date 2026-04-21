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

  
  drawFrame(ctx) {
    if (this instanceof Character || this instanceof Chicken || this instanceof Endboss) {
      ctx.beginPath();
      ctx.lineWidth = "5";
      ctx.strokeStyle = "blue";
      ctx.rect(this.x, this.y, this.width, this.height);
      ctx.stroke();
    }
  }

  loadImages(arr) {
    arr.forEach((path) => {
      let img = new Image();
      img.onerror = function() {
        console.error("Failed to load image:", path);
      };
      img.src = path;
      this.imageCache[path] = img;
    });
  }
}
