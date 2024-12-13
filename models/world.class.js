class World {
  character = new Character();
  enemies = [new Chicken(), new Chicken(), new Chicken()];

  // Clouds werden hinzugefügt
  clouds = [new Cloud()];

  // Background wird hinzugefügt
  backgroundObjects = [
    new BackgroundObject("./assets/img/5_background/layers/air.png", 0),
    new BackgroundObject(
      "./assets/img/5_background/layers/3_third_layer/1.png",
      0
    ),
    new BackgroundObject(
      "./assets/img/5_background/layers/2_second_layer/1.png",
      0
    ),
    new BackgroundObject(
      "./assets/img/5_background/layers/1_first_layer/1.png",
      0
    ),
  ];

  canvas;
  ctx;

  // wird in 2d angezeigt
  constructor(canvas) {
    this.ctx = canvas.getContext("2d");
    this.canvas = canvas;
    this.draw();
  }

  draw() {
    // hier wird  bewegung wieder gecleart
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    this.addObjectsToMap(this.backgroundObjects);
    this.addObjectsToMap(this.clouds);
    this.addToMap(this.character);
    this.addObjectsToMap(this.enemies);

    //=======================================================================

    // // so wirds eigendlich geschrieben, besser ohne kommentare

    // draw() {
    //   this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    //   this.addToMap(this.character);
    //   addObjectsToMap(this.clouds);
    //   addObjectsToMap(this.enemies);
    //   addObjectsToMap(this.backgroundObjects);

    //=========================================================

    // Draw() wird immer wieder aufgerufen
    let self = this;
    requestAnimationFrame(function () {
      self.draw();
    });
  }

  addObjectsToMap(objects) {
    objects.forEach((o) => {
      this.addToMap(o);
    });
  }

  // function für alle inhalte die man aanzeigen möchte
  addToMap(mo) {
    this.ctx.drawImage(mo.img, mo.x, mo.y, mo.width, mo.height);
  }
}
