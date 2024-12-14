class Chicken extends MovableObject {
  y = 359;
  width = 55;
  height = 60;

  IMAGES_WALKING = [
    "./assets/img/3_enemies_chicken/chicken_normal/1_walk/1_w.png",
    "./assets/img/3_enemies_chicken/chicken_normal/1_walk/2_w.png",
    "./assets/img/3_enemies_chicken/chicken_normal/1_walk/3_w.png",
  ];

  constructor() {
    super().loadImage(
      "./assets/img/3_enemies_chicken/chicken_normal/1_walk/1_w.png"
    );
    this.loadImages(this.IMAGES_WALKING);

    this.x = 200 + Math.random() * 500;
    this.animate();
  }

  // Animation Chicken
  animate() {
    setInterval(() => {
      let i = this.currentImage % this.IMAGES_WALKING.length; // index soll heißen: ergeht durch die json und fängt nach dem ende wieder bei 1 an.
      let path = this.IMAGES_WALKING[i];
      this.img = this.imageCache[path];
      this.currentImage++;
    }, 280);
  }
}
