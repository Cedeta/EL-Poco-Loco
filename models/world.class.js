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

  constructor(canvas, keyboard) {
    this.ctx = canvas.getContext("2d");
    this.canvas = canvas;
    this.keyboard = keyboard;
    this.level = window.createLevel1();
    this.bossMusic.volume = 0.18;
    this.setWorld();
    this.draw();
    this.checkCollisions();
    this.checkThrowObjects();
    this.prepareBackgroundMusic();
  }

  /**
   * Startet die Hintergrundmusik als Schleife unter den Spielsounds.
   * @returns {void}
   */
  prepareBackgroundMusic() {
    this.backgroundMusic.loop = true;
    this.backgroundMusic.volume = 0.35;
    this.resumeBackgroundMusic();
  }

  /**
   * Setzt die Hintergrundmusik fort, außer im Boss, in Pause oder nach Spielende.
   * @returns {void}
   */
  resumeBackgroundMusic() {
    if (this.paused || this.gameOver || this.bossActivated) return;
    playSound(this.backgroundMusic, false);
  }

  setWorld() {
    this.character.world = this;
    this.level.enemies.forEach(e => e.world = this);
  }

  // prüft ob der character mit enemies kollidiert
  checkCollisions() {
    setInterval(() => {
      if (this.gameOver || this.paused) return;

      // Zuerst die ganze Stomp-Gruppe töten, danach erst abprallen.
      this.resolveBossHit();
      this.resolveChickenHits();

      // Character vs Coins (einsammeln)
      const coinsBefore = this.level.coins.length;
      this.level.coins = this.level.coins.filter(
        (coin) => !this.character.isColliding(coin)
      );
      this.collectedCoins += coinsBefore - this.level.coins.length;

      // Character vs Boden-Bottles (einsammeln) – nur bis maxBottles
      this.level.bottles = this.level.bottles.filter((bottle) => {
        if (!this.character.isColliding(bottle)) return true;
        if (this.collectedBottles >= this.maxBottles) return true; // Leiste voll → Bottle bleibt liegen
        this.collectedBottles++;
        return false; // eingesammelt → aus dem Level entfernen
      });

      // Wurf-Flaschen vs Enemies (Flasche nach Treffer entfernen)
      const bottlesToRemove = new Set();
      this.throwableObjects.forEach((bottle, bottleIndex) => {
        this.level.enemies = this.level.enemies.filter((enemy) => {
          if (bottle.isColliding(enemy)) {
            // Flasche soll nur einmal treffen
            bottlesToRemove.add(bottleIndex);

            if (enemy instanceof Chicken) {
              if (!enemy.isDead && typeof enemy.die === "function") enemy.die();
              return true;
            }

            if (enemy instanceof SmallChicken) {
              if (!enemy.isDead && typeof enemy.die === "function") enemy.die();
              return true;
            }

            if (enemy instanceof Endboss) {
              if (typeof enemy.hitByBottle === "function") enemy.hitByBottle();
              return true;
            }
          }

          return true;
        });
      });

      // getroffene Flaschen entfernen
      this.throwableObjects = this.throwableObjects.filter(
        (_, i) => !bottlesToRemove.has(i)
      );

      // tote Chickens und Boss nach 500ms entfernen
      this.level.enemies = this.level.enemies.filter((enemy) => {
        if (enemy instanceof Chicken && enemy.isDead) {
          const aliveTime = new Date().getTime() - (enemy.deathTime || 0);
          return aliveTime < 500;
        }

        if (enemy instanceof SmallChicken && enemy.isDead) {
          const aliveTime = new Date().getTime() - (enemy.deathTime || 0);
          return aliveTime < 500;
        }

        if (enemy instanceof Endboss && enemy.dead) {
          const aliveTime = new Date().getTime() - (enemy.deathTime || 0);
          return aliveTime < 1500;
        }

        return true;
      });
    }, 1000 / 60);
  }

  /**
   * Trifft der Boss Pepe, bekommt Pepe Schaden.
   * @returns {void}
   */
  resolveBossHit() {
    const boss = this.level.enemies.find((enemy) => enemy instanceof Endboss);
    if (!boss || boss.dead || !this.character.isColliding(boss)) return;
    this.character.hit();
  }

  /**
   * Tötet beim Draufspringen alle betroffenen Hühner, sonst normaler Schaden.
   * @returns {void}
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
   * @returns {boolean} True, solange Pepe in der Luft nach unten fällt.
   */
  isStomping() {
    return this.character.speedY < 0 && this.character.isAboveGround();
  }

  /**
   * Liefert lebende normale und kleine Hühner.
   * @returns {MovableObject[]} Lebende Hühner.
   */
  livingChickens() {
    return this.level.enemies.filter((enemy) => this.isLivingChicken(enemy));
  }

  /**
   * Prüft, ob ein Gegner ein lebendes Huhn ist.
   * @param {MovableObject} enemy - Gegner aus dem Level.
   * @returns {boolean} True bei lebendem Huhn oder Küken.
   */
  isLivingChicken(enemy) {
    const chicken = enemy instanceof Chicken || enemy instanceof SmallChicken;
    return chicken && !enemy.isDead;
  }

  /**
   * Tötet das getroffene Huhn und jedes direkt überlappende Nachbarhuhn.
   * @param {MovableObject[]} colliding - Hühner, die Pepe gerade berührt.
   * @returns {void}
   */
  defeatStompGroup(colliding) {
    this.stompGroup(colliding).forEach((enemy) => enemy.die());
    this.character.speedY = 15;
  }

  /**
   * Erweitert die getroffenen Hühner um überlappende Nachbarn.
   * @param {MovableObject[]} colliding - Hühner unter Pepe.
   * @returns {MovableObject[]} Alle Hühner dieser Stomp-Gruppe.
   */
  stompGroup(colliding) {
    const group = [...colliding];
    this.livingChickens().forEach((enemy) => this.addOverlap(group, enemy));
    return group;
  }

  /**
   * Nimmt ein Huhn in die Gruppe auf, wenn es einen Treffer überlappt.
   * @param {MovableObject[]} group - Bisher getroffene Hühner.
   * @param {MovableObject} enemy - Weiteres lebendes Huhn.
   * @returns {void}
   */
  addOverlap(group, enemy) {
    if (group.includes(enemy)) return;
    if (group.some((hit) => this.chickensOverlap(hit, enemy))) group.push(enemy);
  }

  /**
   * Prüft, ob zwei Hühner sich berühren oder dicht nebeneinander stehen.
   * @param {MovableObject} first - Erstes Huhn.
   * @param {MovableObject} second - Zweites Huhn.
   * @returns {boolean} True bei Überlappung oder kleinem Abstand.
   */
  chickensOverlap(first, second) {
    const left = Math.max(first.x, second.x);
    const right = Math.min(first.x + first.width, second.x + second.width);
    const closeInHeight = Math.abs(first.y - second.y) < 40;
    return left - right < 24 && closeInHeight;
  }

  checkThrowObjects() {
    setInterval(() => {
      if (this.gameOver || this.paused) return;
      this.throwableObjects = this.throwableObjects.filter(
        (bottle) => bottle.y < 426 - bottle.height
      );

      // Flasche werfen
      if (this.keyboard.SPACE && this.collectedBottles > 0) {
        let bottle = new ThrowableObject(
          this.character.x + 50,
          this.character.y + 100,
          this.character.otherDirection
        );
        this.throwableObjects.push(bottle);
        this.collectedBottles--;
        this.keyboard.SPACE = false;
      }
    }, 200);
  }

  /**
   * Aktiviert den Endboss und startet den vorhandenen Boss-Sound.
   * @returns {void}
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
   * @returns {void}
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
   * @returns {void}
   */
  resumeBossMusic() {
    if (!this.bossActivated || this.paused || this.gameOver) return;
    playSound(this.bossMusic, false);
  }

  draw() {
    // canvas leeren damit alles neu gezeichnet werden kann
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

    // kamera verschieben damit der hintergrund mitläuft
    this.ctx.translate(this.camera_x, 0);

    this.addObjectsToMap(this.level.backgroundObjects);
    this.addObjectsToMap(this.level.clouds);

    // kamera wieder zurücksetzen
    this.ctx.translate(-this.camera_x, 0);

    // statusbar zeichnen (muss zwischen den translate aufrufen sein sonst bewegt sie sich mit)
    if (this.statusBar) {
      this.statusBar.setPercentage(this.character.energy);
      this.addToMap(this.statusBar);
    }
    if (this.statusBarCoin) {
      this.statusBarCoin.setPercentage((this.collectedCoins / this.maxCoins) * 100);
      this.addToMap(this.statusBarCoin);
    }
    if (this.statusBarBottle) {
      this.statusBarBottle.setPercentage((this.collectedBottles / this.maxBottles) * 100);
      this.addToMap(this.statusBarBottle);
    }
    let boss = this.level.enemies.find((e) => e instanceof Endboss);

    // Boss tot → Boss-Sound stoppen, danach Win-Sound genau einmal
    if (this.bossActivated && boss && boss.dead && !this.winSoundPlayed) {
      this.winSoundPlayed = true;
      stopSound(this.bossMusic);
      playSound(this.winSound);
      if (typeof window.showWin === "function") window.showWin();
    }
    if (this.statusBarEndboss && this.bossActivated && boss && !boss.dead) {
      this.statusBarEndboss.setPercentage(boss.energy);
      this.addToMap(this.statusBarEndboss);
    }

    // kamera nochmal verschieben für character und enemies
    this.ctx.translate(this.camera_x, 0);

    this.addToMap(this.character);
    this.addObjectsToMap(this.level.coins);
    this.addObjectsToMap(this.level.bottles);
    this.addObjectsToMap(this.level.enemies);
    this.addObjectsToMap(this.throwableObjects);
    // kamera wieder zurück
    this.ctx.translate(-this.camera_x, 0);

    // draw immer wieder aufrufen damit es animiert wird
    let self = this;

    // Boss-Sound startet einmalig, sobald Pepe den Boss-Bereich erreicht.
    if (!this.bossActivated && this.character.x >= 3300) {
      this.bossActivated = true;
      this.activateBoss();
    }
    
    if (this.gameOver || this.paused) return;
    requestAnimationFrame(function () {
      self.draw();
    });
  }

  addObjectsToMap(objects) {
    objects.forEach((o) => {
      this.addToMap(o);
    });
  }

  // fügt ein objekt zur map hinzu und zeichnet es
  addToMap(mo) {
    // wenn das objekt nach links schaut dann spiegel es
    if (mo.otherDirection) {
      this.flipImage(mo);
    }
    mo.draw(this.ctx);

    // spiegelung wieder rückgängig machen
    if (mo.otherDirection) {
      this.flipImageBack(mo);
    }
  }

  flipImage(mo) {
    this.ctx.save();
    this.ctx.translate(mo.width, 0);
    this.ctx.scale(-1, 1);
    mo.x = mo.x * -1;
  }

  flipImageBack(mo) {
    mo.x = mo.x * -1;
    this.ctx.restore();
  }
}
