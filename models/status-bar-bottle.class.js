class StatusBarBottle extends DrawableObject {
    percentage = 0;
  
    IMAGES = [
      "./assets/img/7_statusbars/1_statusbar/3_statusbar_bottle/green/0.png",
      "./assets/img/7_statusbars/1_statusbar/3_statusbar_bottle/green/20.png",
      "./assets/img/7_statusbars/1_statusbar/3_statusbar_bottle/green/40.png",
      "./assets/img/7_statusbars/1_statusbar/3_statusbar_bottle/green/60.png",
      "./assets/img/7_statusbars/1_statusbar/3_statusbar_bottle/green/80.png",
      "./assets/img/7_statusbars/1_statusbar/3_statusbar_bottle/green/100.png",
    ];
  
    constructor(x = 20, y = 90) {
      super();
      this.x = x;
      this.y = y;
      this.width = 150;
      this.height = 40;
      this.otherDirection = false;
  
      this.loadImages(this.IMAGES);
      this.loadImage(this.IMAGES[0]);
    }
  
    resolveImageIndex() {
      if (this.percentage > 0 && this.percentage < 20) return 1;
      if (this.percentage >= 20 && this.percentage < 40) return 2;
      if (this.percentage >= 40 && this.percentage < 60) return 3;
      if (this.percentage >= 60 && this.percentage < 80) return 4;
      if (this.percentage >= 80) return 5;
      return 0;
    }
  
    setPercentage(percentage) {
      this.percentage = percentage;
      let path = this.IMAGES[this.resolveImageIndex()];
      this.img = this.imageCache[path];
    }
  }