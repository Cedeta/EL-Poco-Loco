/**
 * Erzeugt Münzen an zufälligen Stellen im Level.
 */
function createCoins(count) {
  const coins = [];
  for (let i = 0; i < count; i++) {
    const x = 200 + Math.random() * 3000;
    coins.push(new Coin(x));
  }
  return coins;
}

/**
 * Erzeugt Flaschen an zufälligen Stellen im Level.
 */
function createBottles(count) {
  const bottles = [];
  for (let i = 0; i < count; i++) {
    const x = 200 + Math.random() * 3000;
    bottles.push(new Bottle(x));
  }
  return bottles;
}

/**
 * Baut Level 1 mit denselben Gegnern, Wolken und Hintergründen.
 */
function createLevel1() {
  return new Level(
    createEnemies(),
    [new Cloud()],
    createBackgrounds(),
    createCoins(15),
    createBottles(10)
  );
}

/**
 * Liefert die fünf Hühner, fünf Küken und den Endboss.
 */
function createEnemies() {
  return createChickens().concat(createSmallChickens(), [new Endboss()]);
}

/**
 * Liefert die fünf normalen Hühner.
 */
function createChickens() {
  return [new Chicken(), new Chicken(), new Chicken(), new Chicken(), new Chicken()];
}

/**
 * Liefert die fünf kleinen Hühner.
 */
function createSmallChickens() {
  return [
    new SmallChicken(),
    new SmallChicken(),
    new SmallChicken(),
    new SmallChicken(),
    new SmallChicken(),
  ];
}

/**
 * Setzt die Hintergründe an dieselben Stellen wie zuvor.
 */
function createBackgrounds() {
  const parts = [];
  for (let i = 0; i < 7; i++) {
    const variant = i % 2 === 0 ? 2 : 1;
    parts.push(...backgroundAt(-719 + 719 * i, variant));
  }
  return parts;
}

/**
 * Baut eine Hintergrund-Spalte. Gerade Spalten nutzen Bild 2, ungerade Bild 1.
 */
function backgroundAt(x, variant) {
  const layer = String(variant);
  return [
    new BackgroundObject("./assets/img/5_background/layers/air.png", x),
    new BackgroundObject(layerPath("3_third_layer", layer), x),
    new BackgroundObject(layerPath("2_second_layer", layer), x),
    new BackgroundObject(layerPath("1_first_layer", layer), x),
  ];
}

/**
 * Baut den Pfad einer Hintergrundebene.
 */
function layerPath(folder, layer) {
  return "./assets/img/5_background/layers/" + folder + "/" + layer + ".png";
}

window.createLevel1 = createLevel1;
