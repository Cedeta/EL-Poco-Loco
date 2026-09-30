class ThrowableObject extends MovableObject {
    width = 60;
    height = 60;
  
    IMAGES = [
      "./assets/img/6_salsa_bottle/1_salsa_bottle_on_ground.png",
      "./assets/img/6_salsa_bottle/2_salsa_bottle_on_ground.png",
    ];
  
    constructor(x, y, otherDirection) {
      super().loadImage("./assets/img/6_salsa_bottle/1_salsa_bottle_on_ground.png");
      this.loadImages(this.IMAGES);
  
      this.x = x;
      this.y = y;
      this.otherDirection = otherDirection;
      this.speedY = 20;
      this.applyGravity();
      this.throw();
    }
  
    /**
     * Bewegt die Flasche seitlich und dreht ihr Bild.
     */
    throw() {
      trackInterval(() => {
        if (this.otherDirection) {
          this.x -= 14;
        } else {
          this.x += 14;
        }
      }, 1000 / 25);
  
      trackInterval(() => {
        this.playAnimation(this.IMAGES);
      }, 120);
    }
  
    /**
     * Prüft, ob die Flasche noch über dem Boden ist.
     */
    isAboveGround() {
      return this.y < 426 - this.height;
    }
  }