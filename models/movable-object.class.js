class MovableObject extends DrawableObject {
  speed = 0.15;
  otherDirection = false;
  speedY = 0;
  acceleration = 2.5;
  energy = 100;
  lastHit = 0;

  /**
   * Zieht das Objekt nach unten, solange es in der Luft ist.
   */
  applyGravity() {
    trackInterval(() => {
      if (this.isAboveGround() || this.speedY > 0) {
        this.y -= this.speedY;
        this.speedY -= this.acceleration;
      }
    }, 1000 / 25);
  }

  /**
   * Prüft, ob das Objekt über dem Boden von Pepe liegt.
   */
  isAboveGround() {
    return this.y < 198;
  }


  /**
   * Prüft die Berührung über die versetzte Trefferbox.
   */
  isColliding(mo) {
    return (
      this.x + this.width - this.offset.right > mo.x + mo.offset.left &&
      this.y + this.height - this.offset.bottom > mo.y + mo.offset.top &&
      this.x + this.offset.left < mo.x + mo.width - mo.offset.right &&
      this.y + this.offset.top < mo.y + mo.height - mo.offset.bottom
    );
  }

  /**
   * Zieht 20 Lebenspunkte ab und merkt sich den Trefferzeitpunkt.
   */
  hit() {
    this.energy -= 20;
    if (this.energy < 0) {
      this.energy = 0;
    } else {
      this.lastHit = new Date().getTime();
    }
  }

  /**
   * Prüft, ob der letzte Treffer weniger als eine Sekunde her ist.
   */
  isHurt() {
    let timepassed = new Date().getTime() - this.lastHit; // differenz in millisekunden
    timepassed = timepassed / 1000;
    return timepassed < 1;
  }

  /**
   * Prüft, ob keine Lebenspunkte mehr übrig sind.
   */
  isDead() {
    return this.energy == 0;
  }

  /**
   * Bewegt das Objekt nach rechts.
   */
  moveRight() {
    this.x += this.speed;
  }

  /**
   * Bewegt das Objekt nach links.
   */
  moveLeft() {
    this.x -= this.speed;
  }

  /**
   * Gibt dem Objekt einen Sprungimpuls nach oben.
   */
  jump() {
    this.speedY = 25;
  }

  /**
   * Zeigt das nächste Bild der Folge und fängt danach wieder vorne an.
   */
  playAnimation(images) {
    let i = this.currentImage % images.length; // index soll heißen: ergeht durch die json und fängt nach dem ende wieder bei 1 an.
    let path = images[i];
    this.img = this.imageCache[path];
    this.currentImage++;
  }
}
