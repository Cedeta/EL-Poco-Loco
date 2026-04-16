class SmallChicken extends MovableObject {
  y = 366;
  width = 40;
  height = 45;

  IMAGES_WALKING = [
    "./assets/img/3_enemies_chicken/chicken_small/1_walk/1_w.png",
    "./assets/img/3_enemies_chicken/chicken_small/1_walk/2_w.png",
    "./assets/img/3_enemies_chicken/chicken_small/1_walk/3_w.png",
  ];

  constructor() {
    super().loadImage(
      "./assets/img/3_enemies_chicken/chicken_small/1_walk/1_w.png"
    );
    this.loadImages(this.IMAGES_WALKING);

    this.x = 950 + Math.random() * 2500;
    this.speed = 0.35 + Math.random() * 0.8;

    this.animate();
  }

  // Animation Chicken
  animate() {
    setInterval(() => {
      this.moveLeft();
    }, 1000 / 60);

    setInterval(() => {
      this.playAnimation(this.IMAGES_WALKING);
    }, 280);
  }
}
