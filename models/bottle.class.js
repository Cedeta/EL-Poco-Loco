class Bottle extends DrawableObject {
    width = 70;
    height = 70;
    offset = {
      top: 10,
      bottom: 10,
      left: 15,
      right: 15,
    };
  
    IMAGES = [
      "./assets/img/6_salsa_bottle/1_salsa_bottle_on_ground.png",
      "./assets/img/6_salsa_bottle/2_salsa_bottle_on_ground.png",
    ];
  
    constructor(x) {
      super();
      this.loadImages(this.IMAGES);
      this.loadImage(this.IMAGES[0]);
  
      this.x = x;
      this.y = 426 - this.height;
  
      this.animate();
    }
  
    animate() {
      setInterval(() => {
        const i = this.currentImage % this.IMAGES.length;
        const path = this.IMAGES[i];
        this.img = this.imageCache[path];
        this.currentImage++;
      }, 1000);
    }
  }