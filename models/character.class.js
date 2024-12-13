class Character extends MovableObject {
  IMAGES_STAND = [
    "./assets/img/2_character_pepe/1_idle/idle/I-2.png",
    "./assets/img/2_character_pepe/1_idle/idle/I-3.png",
    "./assets/img/2_character_pepe/1_idle/idle/I-4.png",
    "./assets/img/2_character_pepe/1_idle/idle/I-5.png",
    "./assets/img/2_character_pepe/1_idle/idle/I-6.png",
    "./assets/img/2_character_pepe/1_idle/idle/I-7.png",
    "./assets/img/2_character_pepe/1_idle/idle/I-8.png",
    "./assets/img/2_character_pepe/1_idle/idle/I-9.png",
  ];

  currentImage = 0;

  constructor() {
    super().loadImage("./assets/img/2_character_pepe/1_idle/idle/I-1.png");
    this.loadImages(this.IMAGES_STAND);

    this.animate();
  }

  animate() {
    setInterval(() => {
      let path = this.IMAGES_STAND[this.currentImage];
      this.img = this.imageCache[path];
      this.currentImage++;
    }, 1000);
  }

  jump() {}
}
