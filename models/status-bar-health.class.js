class StatusBarHealth extends DrawableObject {
  percentage = 100;

  IMAGES = [
    "./assets/img/7_statusbars/1_statusbar/2_statusbar_health/green/0.png",
    "./assets/img/7_statusbars/1_statusbar/2_statusbar_health/green/20.png",
    "./assets/img/7_statusbars/1_statusbar/2_statusbar_health/green/40.png",
    "./assets/img/7_statusbars/1_statusbar/2_statusbar_health/green/60.png",
    "./assets/img/7_statusbars/1_statusbar/2_statusbar_health/green/80.png",
    "./assets/img/7_statusbars/1_statusbar/2_statusbar_health/green/100.png",
  ];

  constructor(x = 20, y = 0) {
    super();
    this.x = x;
    this.y = y;
    this.width = 150;
    this.height = 40;
    this.otherDirection = false;
    
    // alle bilder laden
    this.loadImages(this.IMAGES);
    // erstes bild ist 100% health
    this.loadImage(this.IMAGES[5]);
  }

  /**
   * Wählt das Bild passend zum Lebensstand.
   */
  resolveImageIndex() {
    if (this.percentage == 100) return 5;
    if (this.percentage >= 80) return 4;
    if (this.percentage >= 60) return 3;
    if (this.percentage >= 40) return 2;
    if (this.percentage >= 20) return 1;
    return 0;
  }

  /**
   * Setzt den Prozentwert und tauscht das Bild.
   */
  setPercentage(percentage) {
    this.percentage = percentage;
    let path = this.IMAGES[this.resolveImageIndex()];
    this.img = this.imageCache[path];
  }

  /**
   * Zeichnet die Leiste über die Basisklasse.
   */
  draw(ctx) {
    super.draw(ctx);
  }
}

