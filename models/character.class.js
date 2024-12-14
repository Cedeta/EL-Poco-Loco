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

  constructor() {
    super().loadImage("./assets/img/2_character_pepe/1_idle/idle/I-1.png");
    this.loadImages(this.IMAGES_STAND);

    this.animate();
  }

  // Animation Charakter
  // ( Info ) % heist Modulu
  animate() {
    setInterval(() => {
      let i = this.currentImage % this.IMAGES_STAND.length; // index soll heißen: ergeht durch die json und fängt nach dem ende wieder bei 1 an.
      let path = this.IMAGES_STAND[i];
      this.img = this.imageCache[path];
      this.currentImage++;
    }, 400);
  }

  jump() {}
}
