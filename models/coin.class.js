class Coin extends DrawableObject {
    width = 120;
    height = 120;
    offset = {
      top: 30,
      bottom: 30,
      left: 30,
      right: 30,
    };
  
    IMAGES = [
      "./assets/img/8_coin/coin_1.png",
      "./assets/img/8_coin/coin_2.png",
    ];
  
    constructor(x) {
      super();
      this.loadImages(this.IMAGES);
      this.loadImage(this.IMAGES[0]);
  
      this.x = x;
      this.y = 100 + Math.random() * 150;
  
      this.animate();
    }
  
    /**
     * Wechselt das Münzbild einmal pro Sekunde.
     */
    animate() {
      trackInterval(() => {
        const i = this.currentImage % this.IMAGES.length;
        const path = this.IMAGES[i];
        this.img = this.imageCache[path];
        this.currentImage++;
      }, 1000);
    }
  }