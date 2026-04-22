class World {
  character = new Character();
  level = level1;

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
  bossMusicStarted = false;
  bossMusic = new Audio("./audio/final-boss-musik.wav");

  winSoundPlayed = false;
  winSound = new Audio("./audio/win.wav");

  constructor(canvas, keyboard) {
    this.ctx = canvas.getContext("2d");
    this.canvas = canvas;
    this.keyboard = keyboard;
    this.setWorld();
    this.draw();
    this.checkCollisions();
    this.checkThrowObjects();
  }

  setWorld() {
    this.character.world = this;
  }

  // prüft ob der character mit enemies kollidiert
  checkCollisions() {
    setInterval(() => {
      if (this.gameOver || this.paused) return;

      // Character vs Enemies (Schaden für Spieler)
      this.level.enemies.forEach((enemy) => {
        if (this.character.isColliding(enemy)) {
          this.character.hit();
          console.log("collision with Character", this.character.energy);
        }
      });

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
    }, 200);
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

    // Boss tot → Bossmusik stoppen, Win-Sound 1x
    if (this.bossMusicStarted && boss && boss.dead && !this.winSoundPlayed) {
      this.winSoundPlayed = true;
      this.bossMusic.pause();
      this.bossMusic.currentTime = 0;
      if (window.soundEnabled !== false) {
        this.winSound.currentTime = 0;
        this.winSound.play();
      }
      if (typeof window.showWin === "function") {
        window.showWin();
      }
    }
    if (this.statusBarEndboss && this.bossMusicStarted && boss && !boss.dead) {
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

// Bossbereich-Trigger 
    if (!this.bossMusicStarted && this.character.x >= 3300) {
      this.bossMusicStarted = true;
      this.level.enemies.forEach((enemy) => {
        if (enemy instanceof Endboss) {
          enemy.activate(this.character);
        }
      });
      if (window.soundEnabled !== false) {
        this.bossMusic.currentTime = 0;
        this.bossMusic.play();
      }
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
    
    // wenn drawFrame existiert dann zeichne den rahmen (für debug)
    if (mo.drawFrame) {
      mo.drawFrame(this.ctx);
    }

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
