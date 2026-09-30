class SmallChicken extends MovableObject {
  y = 366;
  width = 50;
  height = 50;
  offset = {
    top: 5,
    bottom: 5,
    left: 5,
    right: 5,
  };
  isDead = false;
  deathTime = 0;
  walking_sound = new Audio("./audio/chicken-footstep.wav");
  death_sound = new Audio("./audio/chicken-death.flac");

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
    this.prepareChicken();
    this.animate();
  }

  /**
   * Setzt Startpunkt, Tempo und die leisen Schritt- und Todes-Sounds.
   */
  prepareChicken() {
    this.x = 950 + Math.random() * 2500;
    this.speed = 0.35 + Math.random() * 0.8;
    this.walking_sound.volume = 0.2;
    this.walking_sound.loop = true;
    this.death_sound.volume = 0.2;
  }

  /**
   * Beendet das Huhn einmalig und spielt den Todes-Sound.
   */
  die() {
    if (this.isDead) return;
    stopSound(this.walking_sound);
    this.isDead = true;
    this.deathTime = new Date().getTime();
    this.speed = 0;
    this.showDeadFrame();
    this.death_sound.volume = 0.2;
    playSound(this.death_sound);
  }

  /**
   * Zeigt das letzte Todesbild.
   */
  showDeadFrame() {
    const frame = this.IMAGES_DEAD[this.IMAGES_DEAD.length - 1];
    this.img = this.imageCache[frame];
  }

  /**
   * Läuft weiter oder stoppt die Schritte bei Pause, Spielende und Tod.
   */
  updateWalk() {
    if (this.isMovementBlocked() || this.isDead) {
      stopSound(this.walking_sound);
      return;
    }
    this.moveLeft();
    this.playWalkingSound();
  }

  /**
   * Prüft, ob Pause oder Spielende Bewegung und Schritte unterbinden.
   */
  isMovementBlocked() {
    return Boolean(this.world && (this.world.paused || this.world.gameOver));
  }

  /**
   * Spielt leise Schritte in einer Schleife, ohne sie jeden Frame neu zu starten.
   */
  playWalkingSound() {
    const audio = this.walking_sound;
    audio.volume = 0.2;
    audio.loop = true;
    if (!audio.paused) return;
    playSound(audio, false);
  }

  /**
   * Lässt das Küken laufen und die Laufbilder wechseln.
   */
  animate() {
    trackInterval(() => this.updateWalk(), 1000 / 60);
    
    trackInterval(() => {
      if (this.world && this.world.paused) return;
      if (!this.isDead) this.playAnimation(this.IMAGES_WALKING);
    }, 280);
  }
}
