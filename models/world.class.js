class World {
  character = new Character();
  level = level1;

  canvas;
  ctx;
  keyboard;
  camera_x = 0;
  statusBar = new StatusBarHealth(20, 0);
  gameOver = false;
  bossMusicStarted = false;
  bossMusic = new Audio("./audio/final-boss-musik.wav");

  constructor(canvas, keyboard) {
    this.ctx = canvas.getContext("2d");
    this.canvas = canvas;
    this.keyboard = keyboard;
    this.setWorld();
    this.draw();
    this.checkCollisions();
  }

  setWorld() {
    this.character.world = this;
  }

  // prüft ob der character mit enemies kollidiert
  checkCollisions() {
    setInterval(() => {
      if (this.gameOver) return;
      this.level.enemies.forEach((enemy) => {
        if (this.character.isColliding(enemy)) {
          this.character.hit();
          console.log("collision with Character", this.character.energy);
        }
      });
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

    // kamera nochmal verschieben für character und enemies
    this.ctx.translate(this.camera_x, 0);

    this.addToMap(this.character);
    this.addObjectsToMap(this.level.enemies);

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
    
    if (this.gameOver) return;
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
