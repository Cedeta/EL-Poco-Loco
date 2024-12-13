class Cloud extends MovableObject {
  y = 15;
  height = 300;
  width = 500;

  constructor() {
    super().loadImage("./assets/img/5_background/layers/4_clouds/1.png");

    this.x = Math.random() * 500; // Zahl zwischen 200 und 700
    this.animate();
  }

  animate() {
    setInterval(() => {
      this.x -= 0.15;
    }, 1000 / 60);
  }
}
