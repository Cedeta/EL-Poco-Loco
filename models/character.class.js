class Character extends MovableObject {
  speed = 5;
  x = 0;
  // y = 193;
  y = 198;
  long_standing = 0;
  deadAnimationCounter = 0;
  deadAnimationFinished = false;

  IMAGES_STANDING = [
    "./assets/img/2_character_pepe/1_idle/idle/I-2.png",
    "./assets/img/2_character_pepe/1_idle/idle/I-3.png",
    "./assets/img/2_character_pepe/1_idle/idle/I-4.png",
    "./assets/img/2_character_pepe/1_idle/idle/I-5.png",
    "./assets/img/2_character_pepe/1_idle/idle/I-6.png",
    "./assets/img/2_character_pepe/1_idle/idle/I-7.png",
    "./assets/img/2_character_pepe/1_idle/idle/I-8.png",
    "./assets/img/2_character_pepe/1_idle/idle/I-9.png",
  ];

  IMAGES_LONG_STANDING = [
    "./assets/img/2_character_pepe/1_idle/long_idle/I-11.png",
    "./assets/img/2_character_pepe/1_idle/long_idle/I-12.png",
    "./assets/img/2_character_pepe/1_idle/long_idle/I-13.png",
    "./assets/img/2_character_pepe/1_idle/long_idle/I-14.png",
    "./assets/img/2_character_pepe/1_idle/long_idle/I-15.png",
    "./assets/img/2_character_pepe/1_idle/long_idle/I-16.png",
    "./assets/img/2_character_pepe/1_idle/long_idle/I-17.png",
    "./assets/img/2_character_pepe/1_idle/long_idle/I-18.png",
    "./assets/img/2_character_pepe/1_idle/long_idle/I-19.png",
    "./assets/img/2_character_pepe/1_idle/long_idle/I-20.png",
  ];

  IMAGES_WALKING = [
    "./assets/img/2_character_pepe/2_walk/W-21.png",
    "./assets/img/2_character_pepe/2_walk/W-22.png",
    "./assets/img/2_character_pepe/2_walk/W-23.png",
    "./assets/img/2_character_pepe/2_walk/W-24.png",
    "./assets/img/2_character_pepe/2_walk/W-25.png",
    "./assets/img/2_character_pepe/2_walk/W-26.png",
  ];

  IMAGES_JUMPING = [
    "assets/img/2_character_pepe/3_jump/J-31.png",
    "assets/img/2_character_pepe/3_jump/J-32.png",
    "assets/img/2_character_pepe/3_jump/J-33.png",
    "assets/img/2_character_pepe/3_jump/J-34.png",
    "assets/img/2_character_pepe/3_jump/J-35.png",
    "assets/img/2_character_pepe/3_jump/J-36.png",
    "assets/img/2_character_pepe/3_jump/J-37.png",
    "assets/img/2_character_pepe/3_jump/J-38.png",
    "assets/img/2_character_pepe/3_jump/J-39.png",
  ];

  IMAGES_DEAD = [
    "./assets/img/2_character_pepe/5_dead/D-51.png",
    "./assets/img/2_character_pepe/5_dead/D-52.png",
    "./assets/img/2_character_pepe/5_dead/D-53.png",
    "./assets/img/2_character_pepe/5_dead/D-54.png",
    "./assets/img/2_character_pepe/5_dead/D-55.png",
    "./assets/img/2_character_pepe/5_dead/D-56.png",
    "./assets/img/2_character_pepe/5_dead/D-57.png",
  ];

  IMAGES_HURT = [
    "assets/img/2_character_pepe/4_hurt/H-41.png",
    "assets/img/2_character_pepe/4_hurt/H-42.png",
    "assets/img/2_character_pepe/4_hurt/H-43.png",
  ];

  world;

  // Sound 

  //(laufen)
  walking_sound = new Audio("./audio/footstep.wav");
  jump_sound = new Audio("./audio/jump.wav");
  // idle_sound = new Audio("./audio/snoring.wav");

  constructor() {
    super().loadImage("./assets/img/2_character_pepe/2_walk/W-21.png");
    this.loadImages(this.IMAGES_WALKING);
    this.loadImages(this.IMAGES_JUMPING);
    this.loadImages(this.IMAGES_DEAD);
    this.loadImages(this.IMAGES_HURT);
    this.loadImages(this.IMAGES_STANDING);
    this.loadImages(this.IMAGES_LONG_STANDING);
    this.applyGravity();
    this.animate();
  }

  // Animation Charakter (/ laufen)
  // ( Info ) % heist Modulu
  animate() {
    setInterval(() => {
      // Bewegung nur erlauben, wenn nicht Tod ist
      if (!this.isDead()) {
      
      // nach rechts laufen
      if (this.world.keyboard.RIGHT && this.x < this.world.level.level_end_x) {
        this.moveRight();
        this.otherDirection = false;
        this.walking_sound.play();
        this.long_standing = 0;
      }
      // nach links laufen
      if (this.world.keyboard.LEFT && this.x > 0) {
        this.moveLeft();
        this.otherDirection = true;
        this.walking_sound.play();
        this.long_standing = 0;
      }
      // Nach oben Springen
      // this.jump_sound.pause();
      if (this.world.keyboard.UP && !this.isAboveGround()) {
        this.jump();
        this.jump_sound.play();
        this.long_standing = 0;
      }
    }
      this.world.camera_x = -this.x + 60;
    }, 1000 / 60);
    

    setInterval(() => {
      if (this.isDead()) {
        if (!this.deadAnimationFinished) {
          // Todes-Animation abspielen mit eigenem Counter
          if (this.deadAnimationCounter < this.IMAGES_DEAD.length) {
            let path = this.IMAGES_DEAD[this.deadAnimationCounter];
            this.img = this.imageCache[path];
            this.deadAnimationCounter++;
          } else {
            // Animation fertig - am letzten Bild bleiben
            this.deadAnimationFinished = true;
            let lastImage = this.IMAGES_DEAD[this.IMAGES_DEAD.length - 1];
            this.img = this.imageCache[lastImage];
          }
        }
        // Wenn deadAnimationFinished = true, bleibt das Bild auf dem letzten Frame
      } else if (this.isHurt()) {
        this.playAnimation(this.IMAGES_HURT);
      } else if (this.isAboveGround()) {
        this.playAnimation(this.IMAGES_JUMPING);
      } else {
        if (this.world.keyboard.RIGHT || this.world.keyboard.LEFT) {
          this.playAnimation(this.IMAGES_WALKING);
        }
      }
    }, 200);

    // Langsamere Animation für Stand-Animation
    setInterval(() => {
      if (!this.isDead() && !this.isHurt() && !this.isAboveGround()) {
        if (!this.world.keyboard.RIGHT && !this.world.keyboard.LEFT) {
          this.long_standing += 200;
          
          // Nach 3 Sekunden (3000ms) zur long_idle Animation wechseln
          if (this.long_standing >= 3000) {
            this.playAnimation(this.IMAGES_LONG_STANDING);
          } else {
            this.playAnimation(this.IMAGES_STANDING);
          }
        } else {
          this.long_standing = 0;
        }
      } else {
        this.long_standing = 0;
      }
    }, 200);
    
  }

  
  jump() {
    this.speedY = 25;
    this.jump_sound.currentTime = 0;
    this.jump_sound.play();
  }
}
