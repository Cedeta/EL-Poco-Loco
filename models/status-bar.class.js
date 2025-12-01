class StatusBar extends DrawableObject {
  IMAGES = [
    "assets/img/7_statusbars/1_statusbar/2_statusbar_health/orange/0_.png",
    "assets/img/7_statusbars/1_statusbar/2_statusbar_health/orange/20_.png",
    "assets/img/7_statusbars/1_statusbar/2_statusbar_health/orange/40_.png",
    "assets/img/7_statusbars/1_statusbar/2_statusbar_health/orange/60_.png",
    "assets/img/7_statusbars/1_statusbar/2_statusbar_health/orange/80_.png",
    "assets/img/7_statusbars/1_statusbar/2_statusbar_health/orange/100_.png",
  ];

  percentage = 100;

  constructor() {
    this.loadImages(this.IMAGES);
  }

  // set Percentage(50)
  setPercentage() {
    this.percentage = percantage; // => 0 -5
  }

  resolveImageIndex() {
    if (this.percentage == 100) {
      return 5;
    } else if (this.percentage > 80) {
      return 4;
    } else if (this.percentage > 60) {
      return 3;
    } else if (this.percentage > 40) {
      return 2;
    } else if (this.percentage > 20) {
      return 1;
    } else this.percentage > 0;
    return 0;
  }
}
