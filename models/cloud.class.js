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
<<<<<<< HEAD
    setInterval(() => {
      this.moveLeft();
    }, 1000 / 60);
  }

}
=======
    this.moveLeft();
  }
}
>>>>>>> 55217d74a7747cd726c046d2184f32af4a734180
