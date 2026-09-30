class Character extends MovableObject {
  speed = 5;
  x = 0;
  // y = 193;
  y = 198;
  offset = {
    top: 100,
    bottom: 10,
    left: 35,
    right: 35,
  };
  long_standing = 0;
  deadAnimationCounter = 0;
  deadAnimationFinished = false;
  isSnoring = false;
  die_sound_played = false;

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

  // Sounds
  walking_sound = new Audio("./audio/footstep.wav");
  jump_sound = new Audio("./audio/jump.wav");
  idle_sound = new Audio("./audio/snoring.wav"); 
  hit_sound = new Audio("./audio/hit.wav");
  die_sound = new Audio("./audio/die.mp3");

  constructor() {
    super().loadImage("./assets/img/2_character_pepe/2_walk/W-21.png");
    this.loadImages(this.IMAGES_WALKING);
    this.loadImages(this.IMAGES_JUMPING);
    this.loadImages(this.IMAGES_DEAD);
    this.loadImages(this.IMAGES_HURT);
    this.loadImages(this.IMAGES_STANDING);
    this.loadImages(this.IMAGES_LONG_STANDING);
    // Schnarchen bleibt leise, damit es Schritte und Sprünge nicht überdeckt.
    this.idle_sound.volume = 0.15;
    this.applyGravity();
    this.animate();
  }

  // Animation Charakter (/ laufen)
  // ( Info ) % heist Modulu
  animate() {
    setInterval(() => {
      if (this.world && this.world.paused) {
        this.stopSounds();
        return;
      }

      if (this.world && this.world.gameOver) {
        this.stopSounds();
        return;
      }
      // Bewegung nur erlauben, wenn nicht Tod ist
      if (!this.isDead()) {
        this.handleMovement();
      }
      this.world.camera_x = -this.x + 60;
    }, 1000 / 60);
    

    setInterval(() => {
      if (this.world && this.world.paused) {
        this.stopSounds();
        return;
      }

      if (this.world && this.world.gameOver) return;
      if (this.isDead()) {
        if (!this.die_sound_played) {
          playSound(this.die_sound);
          this.die_sound_played = true;
        }
        if (!this.deadAnimationFinished) {
          // Todes-Animation abspielen mit eigenem Counter
          if (this.deadAnimationCounter < this.IMAGES_DEAD.length) {
            let path = this.IMAGES_DEAD[this.deadAnimationCounter];
            this.img = this.imageCache[path];
            this.deadAnimationCounter++;
          } else {
            // Animation fertig - am letzten Bild bleiben
            this.deadAnimationFinished = true;
            this.world.gameOver = true;
            if (typeof window.showGameOver === "function") window.showGameOver();
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
      if (this.world && this.world.paused) {
        this.stopSounds();
        return;
      }
      
      if (this.world && this.world.gameOver) return;
      if (!this.isDead() && !this.isHurt() && !this.isAboveGround()) {
        if (!this.world.keyboard.RIGHT && !this.world.keyboard.LEFT) {
          this.long_standing += 200;
          
          // Nach 3 Sekunden (3000ms) zur long_idle Animation wechseln
          if (this.long_standing >= 3000) {
            if (!this.isSnoring && window.soundEnabled !== false) {
              playSound(this.idle_sound);
              this.isSnoring = true;
            }
            this.playAnimation(this.IMAGES_LONG_STANDING);
          } else {
            this.playAnimation(this.IMAGES_STANDING);
          }
        } else {
          this.resetIdle();
        }
      } else {
        this.resetIdle();
      }
    }, 200);
    
  }


  /**
   * Zieht Leben ab und spielt Treffer- oder Todessound einmalig.
   * @returns {void}
   */
  hit() {
    if (this.isDead()) return;
    if (this.isHurt()) return;
    super.hit();
    if (this.isDead()) {
      if (!this.die_sound_played) {
        playSound(this.die_sound);
        this.die_sound_played = true;
      }
      return;
    }
    playSound(this.hit_sound);
  }

  /**
   * Springt und spielt den Sprungton genau einmal ab.
   * @returns {void}
   */
  jump() {
    this.speedY = 25;
    playSound(this.jump_sound);
  }

  /**
   * Bewegt Pepe und koppelt den Laufsound an den Boden.
   * @returns {void}
   */
  handleMovement() {
    const movingRight = this.canMoveRight();
    const movingLeft = this.canMoveLeft();
    if (movingRight) this.moveGround(false);
    if (movingLeft) this.moveGround(true);
    if (this.world.keyboard.UP && !this.isAboveGround()) this.startJump();
    this.updateWalkingSound(movingRight || movingLeft);
  }

  /**
   * Prüft, ob Pepe nach rechts laufen darf.
   * @returns {boolean} True, wenn die rechte Taste innerhalb des Levels gedrückt ist.
   */
  canMoveRight() {
    return this.world.keyboard.RIGHT && this.x < this.world.level.level_end_x;
  }

  /**
   * Prüft, ob Pepe nach links laufen darf.
   * @returns {boolean} True, wenn die linke Taste und noch Weg übrig sind.
   */
  canMoveLeft() {
    return this.world.keyboard.LEFT && this.x > 0;
  }

  /**
   * Läuft in eine Richtung und beendet dabei den Schnarchton.
   * @param {boolean} toLeft - True läuft nach links, false nach rechts.
   * @returns {void}
   */
  moveGround(toLeft) {
    if (toLeft) this.moveLeft();
    else this.moveRight();
    this.otherDirection = toLeft;
    this.resetIdle();
  }

  /**
   * Startet einen Sprung nur vom Boden und ohne zweiten Sprungton.
   * @returns {void}
   */
  startJump() {
    this.jump();
    this.resetIdle();
  }

  /**
   * Spielt Schritte nur am Boden in einer Schleife.
   * In der Luft würde der Laufsound den Sprung überdecken.
   * @param {boolean} isMoving - Ob links oder rechts gedrückt ist.
   * @returns {void}
   */
  updateWalkingSound(isMoving) {
    const inAir = this.isAboveGround() || this.speedY > 0;
    if (!isMoving || inAir) {
      stopSound(this.walking_sound);
      return;
    }
    this.walking_sound.loop = true;
    playSound(this.walking_sound, false);
  }

  /**
   * Beendet den Schnarchton, sobald Pepe sich wieder bewegt.
   * @returns {void}
   */
  resetIdle() {
    this.long_standing = 0;
    this.isSnoring = false;
    stopSound(this.idle_sound);
  }

  /**
   * Stoppt Pepes Clips, damit Pause und Mute sie nicht weiterlaufen lassen.
   * @returns {void}
   */
  stopSounds() {
    stopSound(this.walking_sound);
    stopSound(this.jump_sound);
    stopSound(this.idle_sound);
    stopSound(this.hit_sound);
    stopSound(this.die_sound);
    // Mute stoppt den Clip. Das Flag darf den nächsten Schnarcher nicht blockieren.
    this.isSnoring = false;
  }
}
