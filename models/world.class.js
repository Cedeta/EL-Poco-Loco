class World {
  character = new Character();
  level;

  canvas;
  ctx;
  keyboard;
  camera_x = 0;
  statusBar = new StatusBarHealth(20, 0);
  statusBarCoin = new StatusBarCoin(20, 45);
  statusBarBottle = new StatusBarBottle(20, 90);
  statusBarEndboss = new StatusBarEndboss(480, 0);

  collectedCoins = 0;
  collectedBottles = 0;

  maxCoins = 15;
  maxBottles = 5;

  throwableObjects = [];

  gameOver = false;
  paused = false;
  bossActivated = false;
  bossMusic = new Audio("./audio/final-boss-musik.wav");
  backgroundMusic = new Audio("./audio/bg-sound.mp3");

  winSoundPlayed = false;
  winSound = new Audio("./audio/win.wav");
  loseSoundPlayed = false;
  loseSound = new Audio("./audio/lose.wav");
  breakSound = new Audio("./audio/broken-glass.wav");

  constructor(canvas, keyboard) {
    this.ctx = canvas.getContext("2d");
    this.canvas = canvas;
    this.keyboard = keyboard;
    this.level = window.createLevel1();
    this.bossMusic.volume = 0.18;
    this.breakSound.volume = 0.3;
    this.loseSound.volume = 0.4;
    this.setWorld();
    this.draw();
    this.checkCollisions();
    this.checkThrowObjects();
    this.prepareBackgroundMusic();
  }

  /**
   * Startet die Hintergrundmusik als Schleife unter den Spielsounds.
   */
  prepareBackgroundMusic() {
    this.backgroundMusic.loop = true;
    this.backgroundMusic.volume = 0.35;
    this.resumeBackgroundMusic();
  }

  /**
   * Setzt die Hintergrundmusik fort, außer im Boss, in Pause oder nach Spielende.
   */
  resumeBackgroundMusic() {
    if (this.paused || this.gameOver || this.bossActivated) return;
    playSound(this.backgroundMusic, false);
  }

  /**
   * Verbindet Pepe und die Gegner mit dieser Welt.
   */
  setWorld() {
    this.character.world = this;
    this.level.enemies.forEach((enemy) => {
      enemy.world = this;
    });
  }

  /**
   * Prüft Treffer, Einsammeln und Aufräumen in einem festen Takt.
   */
  checkCollisions() {
    trackInterval(() => this.runCollisions(), 1000 / 60);
  }

  /**
   * Zuerst der Stomp, danach Münzen, Flaschen und tote Gegner.
   */
  runCollisions() {
    if (this.gameOver || this.paused) return;
    this.resolveBossHit();
    this.resolveChickenHits();
    this.collectCoins();
    this.collectBottles();
    this.resolveThrownBottles();
    this.removeDeadEnemies();
  }

  /**
   * Nimmt Münzen auf, die Pepe berührt.
   */
  collectCoins() {
    const coinsBefore = this.level.coins.length;
    this.level.coins = this.level.coins.filter((coin) => {
      return !this.character.isColliding(coin);
    });
    this.collectedCoins += coinsBefore - this.level.coins.length;
  }

  /**
   * Sammelt Bodenflaschen, solange die Leiste nicht voll ist.
   */
  collectBottles() {
    this.level.bottles = this.level.bottles.filter((bottle) => {
      return this.keepGroundBottle(bottle);
    });
  }

  /**
   * Lässt eine Bodenflasche liegen, wenn Pepe sie nicht nimmt.
   */
  keepGroundBottle(bottle) {
    if (!this.character.isColliding(bottle)) return true;
    if (this.collectedBottles >= this.maxBottles) return true;
    this.collectedBottles++;
    return false;
  }

  /**
   * Trifft geworfene Flaschen und entfernt sie danach.
   */
  resolveThrownBottles() {
    const bottlesToRemove = new Set();
    this.throwableObjects.forEach((bottle, bottleIndex) => {
      this.hitEnemiesWithBottle(bottle, bottleIndex, bottlesToRemove);
    });
    this.dropHitBottles(bottlesToRemove);
  }

  /**
   * Prüft eine Flasche gegen alle Gegner. Gegner bleiben im Level.
   */
  hitEnemiesWithBottle(bottle, bottleIndex, bottlesToRemove) {
    this.level.enemies = this.level.enemies.filter((enemy) => {
      return this.bottleHitsEnemy(bottle, enemy, bottleIndex, bottlesToRemove);
    });
  }

  /**
   * Zerbricht die Flasche einmal und wendet den Treffer an.
   */
  bottleHitsEnemy(bottle, enemy, bottleIndex, bottlesToRemove) {
    if (!bottle.isColliding(enemy)) return true;
    if (!bottlesToRemove.has(bottleIndex)) this.shatterBottle(bottle);
    bottlesToRemove.add(bottleIndex);
    this.applyBottleHit(enemy);
    return true;
  }

  /**
   * Tötet Hühner oder trifft den Boss, je nach Gegnertyp.
   */
  applyBottleHit(enemy) {
    const chicken = enemy instanceof Chicken || enemy instanceof SmallChicken;
    if (chicken && !enemy.isDead && typeof enemy.die === "function") enemy.die();
    if (enemy instanceof Endboss && typeof enemy.hitByBottle === "function") {
      enemy.hitByBottle();
    }
  }

  /**
   * Entfernt Flaschen, die in diesem Takt getroffen haben.
   */
  dropHitBottles(bottlesToRemove) {
    this.throwableObjects = this.throwableObjects.filter((_, index) => {
      return !bottlesToRemove.has(index);
    });
  }

  /**
   * Entfernt tote Hühner nach 500 ms und den Boss nach 1500 ms.
   */
  removeDeadEnemies() {
    this.level.enemies = this.level.enemies.filter((enemy) => {
      return this.keepEnemy(enemy);
    });
  }

  /**
   * Behält lebende Gegner und tote nur für die kurze Liegezeit.
   */
  keepEnemy(enemy) {
    if (enemy instanceof Chicken && enemy.isDead) return this.diedWithin(enemy, 500);
    if (enemy instanceof SmallChicken && enemy.isDead) return this.diedWithin(enemy, 500);
    if (enemy instanceof Endboss && enemy.dead) return this.diedWithin(enemy, 1500);
    return true;
  }

  /**
   * Prüft, ob der Tod noch innerhalb der Liegezeit liegt.
   */
  diedWithin(enemy, limit) {
    const aliveTime = new Date().getTime() - (enemy.deathTime || 0);
    return aliveTime < limit;
  }

  /**
   * Trifft der Boss Pepe, bekommt Pepe Schaden.
   */
  resolveBossHit() {
    const boss = this.level.enemies.find((enemy) => enemy instanceof Endboss);
    if (!boss || boss.dead || !this.character.isColliding(boss)) return;
    this.character.hit();
  }

  /**
   * Tötet beim Draufspringen alle betroffenen Hühner, sonst normaler Schaden.
   */
  resolveChickenHits() {
    const colliding = this.livingChickens().filter((enemy) => {
      return this.character.isColliding(enemy);
    });
    if (!colliding.length) return;
    if (this.isStomping()) this.defeatStompGroup(colliding);
    else this.character.hit();
  }

  /**
   * Prüft, ob Pepe von oben auf ein Huhn fällt.
   */
  isStomping() {
    return this.character.speedY < 0 && this.character.isAboveGround();
  }

  /**
   * Liefert lebende normale und kleine Hühner.
   */
  livingChickens() {
    return this.level.enemies.filter((enemy) => this.isLivingChicken(enemy));
  }

  /**
   * Prüft, ob ein Gegner ein lebendes Huhn ist.
   */
  isLivingChicken(enemy) {
    const chicken = enemy instanceof Chicken || enemy instanceof SmallChicken;
    return chicken && !enemy.isDead;
  }

  /**
   * Tötet das getroffene Huhn und jedes direkt überlappende Nachbarhuhn.
   */
  defeatStompGroup(colliding) {
    this.stompGroup(colliding).forEach((enemy) => enemy.die());
    this.character.speedY = 15;
  }

  /**
   * Erweitert die getroffenen Hühner um überlappende Nachbarn.
   */
  stompGroup(colliding) {
    const group = [...colliding];
    this.livingChickens().forEach((enemy) => this.addOverlap(group, enemy));
    return group;
  }

  /**
   * Nimmt ein Huhn in die Gruppe auf, wenn es einen Treffer überlappt.
   */
  addOverlap(group, enemy) {
    if (group.includes(enemy)) return;
    if (group.some((hit) => this.chickensOverlap(hit, enemy))) group.push(enemy);
  }

  /**
   * Prüft, ob zwei Hühner sich berühren oder dicht nebeneinander stehen.
   */
  chickensOverlap(first, second) {
    const left = Math.max(first.x, second.x);
    const right = Math.min(first.x + first.width, second.x + second.width);
    const closeInHeight = Math.abs(first.y - second.y) < 40;
    return left - right < 24 && closeInHeight;
  }

  /**
   * Spielt den Glas-Sound einmal, wenn die Flasche zerbricht.
   */
  shatterBottle(bottle) {
    if (bottle.broken) return;
    bottle.broken = true;
    playSound(this.breakSound);
  }

  /**
   * Prüft Landung und neuen Wurf im festen Takt.
   */
  checkThrowObjects() {
    trackInterval(() => this.runThrows(), 200);
  }

  /**
   * Entfernt gelandete Flaschen und wirft bei Leertaste eine neue.
   */
  runThrows() {
    if (this.gameOver || this.paused) return;
    this.removeLandedBottles();
    this.throwBottle();
  }

  /**
   * Zerbricht Flaschen, die den Boden berühren.
   */
  removeLandedBottles() {
    this.throwableObjects = this.throwableObjects.filter((bottle) => {
      if (bottle.isAboveGround()) return true;
      this.shatterBottle(bottle);
      return false;
    });
  }

  /**
   * Wirft eine Flasche, solange welche gesammelt sind.
   */
  throwBottle() {
    if (!this.keyboard.SPACE || this.collectedBottles <= 0) return;
    const bottle = new ThrowableObject(
      this.character.x + 50,
      this.character.y + 100,
      this.character.otherDirection
    );
    this.throwableObjects.push(bottle);
    this.collectedBottles--;
    this.keyboard.SPACE = false;
  }

  /**
   * Aktiviert den Endboss und startet den vorhandenen Boss-Sound.
   */
  activateBoss() {
    this.level.enemies.forEach((enemy) => {
      if (enemy instanceof Endboss) enemy.activate(this.character);
    });
    this.backgroundMusic.pause();
    playSound(this.bossMusic);
  }

  /**
   * Pausiert die Welt und hält den Boss-Sound an, ohne ihn zurückzuspulen.
   */
  togglePause() {
    this.paused = !this.paused;
    if (this.paused) {
      this.character?.stopSounds();
      this.bossMusic.pause();
      this.backgroundMusic.pause();
      return;
    }
    this.draw();
    this.resumeBossMusic();
    this.resumeBackgroundMusic();
  }

  /**
   * Setzt den Boss-Sound fort, solange der Kampf läuft und Sound an ist.
   */
  resumeBossMusic() {
    if (!this.bossActivated || this.paused || this.gameOver) return;
    playSound(this.bossMusic, false);
  }

  /**
   * Zeichnet Hintergrund, Leisten und Figuren und plant den nächsten Frame.
   */
  draw() {
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    this.drawScenery();
    this.drawHud();
    this.drawActors();
    this.tryActivateBoss();
    this.scheduleNextFrame();
  }

  /**
   * Zeichnet Hintergrund und Wolken mit der Kamera.
   */
  drawScenery() {
    this.ctx.translate(this.camera_x, 0);
    this.addObjectsToMap(this.level.backgroundObjects);
    this.addObjectsToMap(this.level.clouds);
    this.ctx.translate(-this.camera_x, 0);
  }

  /**
   * Zeichnet die Leisten fest am Bildschirm, nicht mit der Kamera.
   */
  drawHud() {
    this.drawStatus(this.statusBar, this.character.energy);
    this.drawStatus(this.statusBarCoin, this.coinPercent());
    this.drawStatus(this.statusBarBottle, this.bottlePercent());
    this.drawBossHud();
  }

  /**
   * Liefert den Füllstand der Münzleiste.
   */
  coinPercent() {
    return (this.collectedCoins / this.maxCoins) * 100;
  }

  /**
   * Liefert den Füllstand der Flaschenleiste.
   */
  bottlePercent() {
    return (this.collectedBottles / this.maxBottles) * 100;
  }

  /**
   * Setzt eine Leiste und zeichnet sie, wenn sie vorhanden ist.
   */
  drawStatus(bar, percentage) {
    if (!bar) return;
    bar.setPercentage(percentage);
    this.addToMap(bar);
  }

  /**
   * Spielt den Sieg und zeichnet die Boss-Leiste.
   */
  drawBossHud() {
    const boss = this.level.enemies.find((enemy) => enemy instanceof Endboss);
    this.playWinOnce(boss);
    this.drawBossBar(boss);
  }

  /**
   * Spielt den Sieg-Sound genau einmal, wenn der Boss tot ist.
   */
  playWinOnce(boss) {
    if (!this.bossActivated || !boss || !boss.dead || this.winSoundPlayed) return;
    this.winSoundPlayed = true;
    stopSound(this.bossMusic);
    playSound(this.winSound);
    if (typeof window.showWin === "function") window.showWin();
  }

  /**
   * Zeichnet die Boss-Leiste nur während des Kampfes.
   */
  drawBossBar(boss) {
    if (!this.statusBarEndboss || !this.bossActivated || !boss || boss.dead) return;
    this.statusBarEndboss.setPercentage(boss.energy);
    this.addToMap(this.statusBarEndboss);
  }

  /**
   * Zeichnet Bodenflaschen hinter Pepe und geworfene Flaschen davor.
   */
  drawActors() {
    this.ctx.translate(this.camera_x, 0);
    this.addObjectsToMap(this.level.bottles);
    this.addToMap(this.character);
    this.addObjectsToMap(this.level.coins);
    this.addObjectsToMap(this.level.enemies);
    this.addObjectsToMap(this.throwableObjects);
    this.ctx.translate(-this.camera_x, 0);
  }

  /**
   * Startet den Boss einmal, sobald Pepe den Bereich erreicht.
   */
  tryActivateBoss() {
    if (this.bossActivated || this.character.x < 3300) return;
    this.bossActivated = true;
    this.activateBoss();
  }

  /**
   * Plant das nächste Bild, außer nach Spielende oder in der Pause.
   */
  scheduleNextFrame() {
    if (this.gameOver || this.paused) return;
    const self = this;
    rememberFrame(requestAnimationFrame(function () {
      self.draw();
    }));
  }

  /**
   * Zeichnet eine Liste von Objekten.
   */
  addObjectsToMap(objects) {
    objects.forEach((object) => {
      this.addToMap(object);
    });
  }

  /**
   * Spiegelt das Bild bei Blick nach rechts und zeichnet es.
   */
  addToMap(mo) {
    if (mo.otherDirection) this.flipImage(mo);
    mo.draw(this.ctx);
    if (mo.otherDirection) this.flipImageBack(mo);
  }

  /**
   * Spiegelt die Zeichenfläche, damit das Bild nach rechts zeigt.
   */
  flipImage(mo) {
    this.ctx.save();
    this.ctx.translate(mo.width, 0);
    this.ctx.scale(-1, 1);
    mo.x = mo.x * -1;
  }

  /**
   * Setzt die Spiegelung nach dem Zeichnen zurück.
   */
  flipImageBack(mo) {
    mo.x = mo.x * -1;
    this.ctx.restore();
  }
}
