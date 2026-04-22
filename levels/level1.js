function createCoins(count) {
  const coins = [];
  for (let i = 0; i < count; i++) {
    const x = 200 + Math.random() * 3000;
    coins.push(new Coin(x));
  }
  return coins;
}
function createBottles(count) {
  const bottles = [];
  for (let i = 0; i < count; i++) {
    const x = 200 + Math.random() * 3000;
    bottles.push(new Bottle(x));
  }
  return bottles;
}

function createLevel1() {
  return new Level(
  [
    new Chicken(),
    new Chicken(),
    new Chicken(),
    new Chicken(),
    new Chicken(),
    new SmallChicken(),
    new SmallChicken(),
    new SmallChicken(),
    new SmallChicken(),
    new SmallChicken(),
    new Endboss(),
  ],

  [new Cloud()],


  [
    new BackgroundObject("./assets/img/5_background/layers/air.png", -719),
    new BackgroundObject(
      "./assets/img/5_background/layers/3_third_layer/2.png",
      -719
    ),
    new BackgroundObject(
      "./assets/img/5_background/layers/2_second_layer/2.png",
      -719
    ),
    new BackgroundObject(
      "./assets/img/5_background/layers/1_first_layer/2.png",
      -719
    ),

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

    new BackgroundObject("./assets/img/5_background/layers/air.png", 719),
    new BackgroundObject(
      "./assets/img/5_background/layers/3_third_layer/2.png",
      719
    ),
    new BackgroundObject(
      "./assets/img/5_background/layers/2_second_layer/2.png",
      719
    ),
    new BackgroundObject(
      "./assets/img/5_background/layers/1_first_layer/2.png",
      719
    ),

    new BackgroundObject("./assets/img/5_background/layers/air.png", 719 * 2),
    new BackgroundObject(
      "./assets/img/5_background/layers/3_third_layer/1.png",
      719 * 2
    ),
    new BackgroundObject(
      "./assets/img/5_background/layers/2_second_layer/1.png",
      719 * 2
    ),
    new BackgroundObject(
      "./assets/img/5_background/layers/1_first_layer/1.png",
      719 * 2
    ),

    new BackgroundObject("./assets/img/5_background/layers/air.png", 719 * 3),
    new BackgroundObject(
      "./assets/img/5_background/layers/3_third_layer/2.png",
      719 * 3
    ),
    new BackgroundObject(
      "./assets/img/5_background/layers/2_second_layer/2.png",
      719 * 3
    ),
    new BackgroundObject(
      "./assets/img/5_background/layers/1_first_layer/2.png",
      719 * 3
    ),

    new BackgroundObject("./assets/img/5_background/layers/air.png", 719 * 4),
    new BackgroundObject(
      "./assets/img/5_background/layers/3_third_layer/1.png",
      719 * 4
    ),
    new BackgroundObject(
      "./assets/img/5_background/layers/2_second_layer/1.png",
      719 * 4
    ),
    new BackgroundObject(
      "./assets/img/5_background/layers/1_first_layer/1.png",
      719 * 4
    ),

    new BackgroundObject("./assets/img/5_background/layers/air.png", 719 * 5),
    new BackgroundObject(
      "./assets/img/5_background/layers/3_third_layer/2.png",
      719 * 5
    ),
    new BackgroundObject(
      "./assets/img/5_background/layers/2_second_layer/2.png",
      719 * 5
    ),
    new BackgroundObject(
      "./assets/img/5_background/layers/1_first_layer/2.png",
      719 * 5
    ),
  ],
  createCoins(15),
  createBottles(10)
);
}
window.createLevel1 = createLevel1;