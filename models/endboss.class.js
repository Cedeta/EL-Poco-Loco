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
  dashMode = "walk";
  dashStartedAt = 0;
  dashFromX = 0;
  dashDirection = -1;

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

  /**
   * Trennt Lauf und Bildwechsel, damit der Dash nicht am Animations-Takt hängt.
   * @returns {void}
   */
  animate() {
    trackInterval(() => this.moveBoss(), 50);
    trackInterval(() => this.animateBoss(), 280);
  }

  /**
   * Bewegt den Boss. Ein Treffer bricht den Dash ab.
   * @returns {void}
   */
  moveBoss() {
    if (!this.canMove()) return;
    if (this.isHurt() || this.dead) {
      this.dashMode = "walk";
      return;
    }
    if (this.dashMode === "walk") this.walkOrStart();
    else if (this.dashMode === "windup") this.stepWindup();
    else if (this.dashMode === "dash") this.stepDash();
    else this.stepRecover();
  }

  /**
   * Prüft, ob der Boss laufen oder angreifen darf.
   * @returns {boolean} False bei Pause, Spielende oder vor der Aktivierung.
   */
  canMove() {
    const world = this.target?.world;
    if (world?.paused || world?.gameOver) return false;
    return this.activated && !!this.target;
  }

  /**
   * Wechselt das Bild passend zu Lauf, Angriff, Treffer oder Tod.
   * @returns {void}
   */
  animateBoss() {
    const world = this.target?.world;
    if (world?.paused) return;
    if (world?.gameOver) return stopSound(this.enter_sound);
    if (this.dead) return this.playAnimation(this.IMAGES_DEAD);
    if (this.isHurt()) return this.playAnimation(this.IMAGES_HURT);
    if (this.dashMode === "walk") return this.playAnimation(this.IMAGES_WALKING);
    this.playAnimation(this.IMAGES_ATTACK);
  }

  /**
   * Läuft auf Pepe zu oder startet die Ansage, wenn er nah genug ist.
   * @returns {void}
   */
  walkOrStart() {
    if (Math.abs(this.x - this.target.x) < 320) return this.startWindup();
    this.stepTowardTarget(this.walkSpeed());
  }

  /**
   * Setzt einen Schritt auf Pepe zu. Nach rechts wird das Bild gespiegelt.
   * @param {number} speed - Pixel pro bisherigem 280-ms-Takt.
   * @returns {void}
   */
  stepTowardTarget(speed) {
    const toRight = this.target.x > this.x;
    this.otherDirection = toRight;
    const step = speed * (50 / 280);
    this.x += toRight ? step : -step;
  }

  /**
   * Bleibt stehen, damit der kommende Satz vorher lesbar ist.
   * @returns {void}
   */
  startWindup() {
    this.dashMode = "windup";
    this.dashStartedAt = Date.now();
    this.otherDirection = this.target.x > this.x;
  }

  /**
   * Startet den Satz in die Richtung, in der Pepe am Ende der Ansage steht.
   * @returns {void}
   */
  stepWindup() {
    if (Date.now() - this.dashStartedAt < this.windupMs()) return;
    this.dashMode = "dash";
    this.dashStartedAt = Date.now();
    this.dashFromX = this.x;
    this.dashDirection = this.target.x >= this.x ? 1 : -1;
    this.otherDirection = this.dashDirection > 0;
  }

  /**
   * Springt geradeaus, ohne Pepe während des Satzes nachzuziehen.
   * @returns {void}
   */
  stepDash() {
    const done = Math.min((Date.now() - this.dashStartedAt) / 450, 1);
    const distance = this.isEnraged() ? 240 : 180;
    this.x = this.dashFromX + this.dashDirection * distance * done;
    if (done < 1) return;
    this.dashMode = "recover";
    this.dashStartedAt = Date.now();
  }

  /**
   * Wartet kurz nach dem Satz, bevor der Boss wieder läuft.
   * @returns {void}
   */
  stepRecover() {
    if (Date.now() - this.dashStartedAt < 500) return;
    this.dashMode = "walk";
  }

  /**
   * Liefert das Lauftempo. Ab 40 Energie wird der Boss schneller.
   * @returns {number} Pixel pro 280-ms-Takt.
   */
  walkSpeed() {
    if (this.isEnraged()) return 40;
    return 25;
  }

  /**
   * Liefert die Ansage. In der zweiten Phase ist sie kürzer.
   * @returns {number} Dauer in Millisekunden.
   */
  windupMs() {
    if (this.isEnraged()) return 250;
    return 400;
  }

  /**
   * Prüft die zweite Phase nach drei Treffern.
   * @returns {boolean} True ab 40 Energie.
   */
  isEnraged() {
    return this.energy <= 40;
  }
}
