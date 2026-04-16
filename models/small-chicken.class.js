class SmallChicken extends MovableObject {
  y = 366;
  width = 50;
  height = 50;
isDead = false;
deathTime = 0;

  IMAGES_WALKING = [
    "./assets/img/3_enemies_chicken/chicken_small/1_walk/1_w.png",
    "./assets/img/3_enemies_chicken/chicken_small/1_walk/2_w.png",
    "./assets/img/3_enemies_chicken/chicken_small/1_walk/3_w.png",
  ];

  IMAGES_DEAD = [
    "./assets/img/3_enemies_chicken/chicken_small/2_dead/dead.png",
  ];

  constructor() {
    super().loadImage(
      "./assets/img/3_enemies_chicken/chicken_small/1_walk/1_w.png"
    );
    this.loadImages(this.IMAGES_WALKING);
    this.loadImages(this.IMAGES_DEAD);
    this.x = 950 + Math.random() * 2500;
    this.speed = 0.35 + Math.random() * 0.8;

    this.animate();
  }

  die() {
    if (this.isDead) return;
    this.isDead = true;
    this.deathTime = new Date().getTime();
    this.speed = 0;

    const lastDeadImage = this.IMAGES_DEAD[this.IMAGES_DEAD.length - 1];
    this.img = this.imageCache[lastDeadImage];
  }

  // Animation Chicken
  animate() {
    setInterval(() => {
      if (!this.isDead) {
        this.moveLeft();
      }
    }, 1000 / 60);

    setInterval(() => {
      if (!this.isDead) {
        this.playAnimation(this.IMAGES_WALKING);
      }
    }, 280);
  }
}
