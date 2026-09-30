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
    this.loadCharacterImages();
    this.prepareCharacterSounds();
    this.applyGravity();
    this.animate();
  }

  /**
   * Lädt die Bildfolgen für Lauf, Sprung, Tod, Treffer und Stand.
   */
  loadCharacterImages() {
    this.loadImages(this.IMAGES_WALKING);
    this.loadImages(this.IMAGES_JUMPING);
    this.loadImages(this.IMAGES_DEAD);
    this.loadImages(this.IMAGES_HURT);
    this.loadImages(this.IMAGES_STANDING);
    this.loadImages(this.IMAGES_LONG_STANDING);
  }

  /**
   * Hält Schnarchen und Schritte leise, damit sie andere Sounds nicht überdecken.
   */
  prepareCharacterSounds() {
    this.idle_sound.volume = 0.15;
    this.walking_sound.volume = 0.2;
    this.walking_sound.loop = true;
  }

  /**
   * Startet Bewegung, Posen und den Stand getrennt, damit jede Schleife kurz bleibt.
   */
  animate() {
    trackInterval(() => this.moveTick(), 1000 / 60);
    trackInterval(() => this.poseTick(), 200);
    trackInterval(() => this.idleTick(), 200);
  }

  /**
   * Bewegt Pepe, solange er lebt, und folgt mit der Kamera.
   */
  moveTick() {
    if (this.world && this.world.paused) return this.stopSounds();
    if (this.world && this.world.gameOver) return this.stopSounds();
    if (!this.isDead()) this.handleMovement();
    this.world.camera_x = -this.x + 60;
  }

  /**
   * Wählt Tod, Treffer, Sprung oder Lauf. Die Sprungbilder bleiben unverändert.
   */
  poseTick() {
    if (this.holdsPose()) return;
    if (this.isDead()) return this.playDeadPose();
    if (this.isHurt()) return this.playAnimation(this.IMAGES_HURT);
    if (this.isAboveGround()) return this.playAnimation(this.IMAGES_JUMPING);
    this.playWalkPose();
  }

  /**
   * Stoppt bei Pause die Sounds. Nach Spielende bleibt die letzte Pose stehen.
   */
  holdsPose() {
    if (this.world && this.world.paused) {
      this.stopSounds();
      return true;
    }
    return Boolean(this.world && this.world.gameOver);
  }

  /**
   * Spielt den Todessound einmal und danach die Todesbilder bis zum letzten Frame.
   */
  playDeadPose() {
    this.playDieSound();
    if (this.deadAnimationFinished) return;
    if (this.deadAnimationCounter < this.IMAGES_DEAD.length) return this.showNextDeadFrame();
    this.finishDeadPose();
  }

  /**
   * Spielt Pepes Todessound nur ein einziges Mal.
   */
  playDieSound() {
    if (this.die_sound_played) return;
    playSound(this.die_sound);
    this.die_sound_played = true;
  }

  /**
   * Zeigt das nächste Todesbild.
   */
  showNextDeadFrame() {
    const path = this.IMAGES_DEAD[this.deadAnimationCounter];
    this.img = this.imageCache[path];
    this.deadAnimationCounter++;
  }

  /**
   * Beendet die Todesbilder und öffnet den Game-Over-Bildschirm.
   */
  finishDeadPose() {
    this.deadAnimationFinished = true;
    this.world.gameOver = true;
    if (typeof window.showGameOver === "function") window.showGameOver();
    const lastImage = this.IMAGES_DEAD[this.IMAGES_DEAD.length - 1];
    this.img = this.imageCache[lastImage];
  }

  /**
   * Spielt die Laufbilder nur, solange links oder rechts gedrückt ist.
   */
  playWalkPose() {
    if (this.world.keyboard.RIGHT || this.world.keyboard.LEFT) {
      this.playAnimation(this.IMAGES_WALKING);
    }
  }

  /**
   * Zählt die Standzeit und wechselt nach drei Sekunden zum Schnarchen.
   */
  idleTick() {
    if (this.holdsPose()) return;
    if (this.canIdle()) this.advanceIdle();
    else this.resetIdle();
  }

  /**
   * Prüft, ob Pepe ruhig am Boden steht.
   */
  canIdle() {
    const grounded = !this.isDead() && !this.isHurt() && !this.isAboveGround();
    const still = !this.world.keyboard.RIGHT && !this.world.keyboard.LEFT;
    return grounded && still;
  }

  /**
   * Schaltet nach drei Sekunden von der kurzen Stand-Animation zum Schnarchen.
   */
  advanceIdle() {
    this.long_standing += 200;
    if (this.long_standing >= 3000) this.playLongIdle();
    else this.playAnimation(this.IMAGES_STANDING);
  }

  /**
   * Startet den Schnarchton einmal und spielt die lange Stand-Animation.
   */
  playLongIdle() {
    if (!this.isSnoring && window.soundEnabled !== false) {
      playSound(this.idle_sound);
      this.isSnoring = true;
    }
    this.playAnimation(this.IMAGES_LONG_STANDING);
  }


  /**
   * Zieht Leben ab und spielt Treffer- oder Todessound einmalig.
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
   */
  jump() {
    this.speedY = 25;
    playSound(this.jump_sound);
  }

  /**
   * Bewegt Pepe und koppelt den Laufsound an den Boden.
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
   */
  canMoveRight() {
    return this.world.keyboard.RIGHT && this.x < this.world.level.level_end_x;
  }

  /**
   * Prüft, ob Pepe nach links laufen darf.
   */
  canMoveLeft() {
    return this.world.keyboard.LEFT && this.x > 0;
  }

  /**
   * Läuft in eine Richtung und beendet dabei den Schnarchton.
   */
  moveGround(toLeft) {
    if (toLeft) this.moveLeft();
    else this.moveRight();
    this.otherDirection = toLeft;
    this.resetIdle();
  }

  /**
   * Startet einen Sprung nur vom Boden und ohne zweiten Sprungton.
   */
  startJump() {
    this.jump();
    this.resetIdle();
  }

  /**
   * Spielt Schritte nur am Boden in einer Schleife.
   * In der Luft würde der Laufsound den Sprung überdecken.
   */
  updateWalkingSound(isMoving) {
    const inAir = this.isAboveGround() || this.speedY > 0;
    if (!isMoving || inAir) {
      stopSound(this.walking_sound);
      return;
    }
    const audio = this.walking_sound;
    audio.volume = 0.2;
    audio.loop = true;
    if (!audio.paused) return;
    playSound(audio, false);
  }

  /**
   * Beendet den Schnarchton, sobald Pepe sich wieder bewegt.
   */
  resetIdle() {
    this.long_standing = 0;
    this.isSnoring = false;
    stopSound(this.idle_sound);
  }

  /**
   * Stoppt Pepes Clips, damit Pause und Mute sie nicht weiterlaufen lassen.
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
