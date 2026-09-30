class Endboss extends MovableObject {
  height = 350;
  width = 350;
  y = 95;
  x = 3950;
  speed = 25;
  activated = false;
  enterSoundPlayed = false;
  energy = 100;
  dead = false;
  deathTime = 0;

  enter_sound = new Audio("./audio/boss-enter.flac");
  target = null;

  IMAGES_WALKING = [
    "assets/img/4_enemie_boss_chicken/1_walk/G1.png",
    "assets/img/4_enemie_boss_chicken/1_walk/G2.png",
    "assets/img/4_enemie_boss_chicken/1_walk/G3.png",
    "assets/img/4_enemie_boss_chicken/1_walk/G4.png",
  ];

  IMAGES_ATTACK = [
    "assets/img/4_enemie_boss_chicken/3_attack/G13.png",
    "assets/img/4_enemie_boss_chicken/3_attack/G14.png",
    "assets/img/4_enemie_boss_chicken/3_attack/G15.png",
    "assets/img/4_enemie_boss_chicken/3_attack/G16.png",
    "assets/img/4_enemie_boss_chicken/3_attack/G17.png",
    "assets/img/4_enemie_boss_chicken/3_attack/G18.png",
    "assets/img/4_enemie_boss_chicken/3_attack/G19.png",
    "assets/img/4_enemie_boss_chicken/3_attack/G20.png",
  ];

  IMAGES_HURT = [
    "assets/img/4_enemie_boss_chicken/4_hurt/G21.png",
    "assets/img/4_enemie_boss_chicken/4_hurt/G22.png",
    "assets/img/4_enemie_boss_chicken/4_hurt/G23.png",
  ];

  IMAGES_DEAD = [
    "assets/img/4_enemie_boss_chicken/5_dead/G24.png",
    "assets/img/4_enemie_boss_chicken/5_dead/G25.png",
    "assets/img/4_enemie_boss_chicken/5_dead/G26.png",
  ];

  constructor() {
    super().loadImage(this.IMAGES_WALKING[0]);
    this.loadImages(this.IMAGES_WALKING);
    this.loadImages(this.IMAGES_ATTACK);
    this.loadImages(this.IMAGES_HURT);
    this.loadImages(this.IMAGES_DEAD);
    this.enter_sound.volume = 0.2;
    this.animate();
  }

  activate(character) {
    this.activated = true;
    this.target = character;
    if (!this.enterSoundPlayed) {
      this.enterSoundPlayed = true;
      playSound(this.enter_sound);
    }
  }

  hitByBottle() {
    if (this.dead) return;

    this.hit(); 

    if (this.isDead()) {
      this.dead = true;
      this.deathTime = new Date().getTime();
    }
  }

  // Animation endboss
  animate() {
    setInterval(() => {
      if (this.target && this.target.world && this.target.world.paused) return;
      
      if (this.target && this.target.world && this.target.world.gameOver) {
        stopSound(this.enter_sound);
        return;
      }
      if (this.dead) {
        this.playAnimation(this.IMAGES_DEAD);
        return;
      }
      if (this.isHurt()) {
        this.playAnimation(this.IMAGES_HURT);
        return;
      }
      if (this.activated && this.target) {
        const distance = Math.abs(this.x - this.target.x);
        if (distance < 120) {
          this.playAnimation(this.IMAGES_ATTACK);
          if (this.x > this.target.x) {
            this.x -= this.speed * 0.5;
          }
          return;
        }
        this.playAnimation(this.IMAGES_WALKING);
        if (this.x > this.target.x) {
          this.x -= this.speed;
          this.otherDirection = false;
        }
      } else {
        this.playAnimation(this.IMAGES_WALKING);
      }
    }, 280);
  }
}
