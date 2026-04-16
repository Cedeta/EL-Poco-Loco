class Coin extends DrawableObject {
    width = 120;
    height = 120;
    constructor(x) {
      super();
      this.loadImage("./assets/img/8_coin/coin_1.png");
      this.x = x;

      this.y = 100 + Math.random() * 150;
    }
  }