const terminalReader = require("readline");

const CREATURE_LIMIT = 100;
const TURN_DURATION = 1000;
const SESSION_DURATION = 90000;

function generateInteger(lowerBound, upperBound) {
  return Math.floor(
    Math.random() * (upperBound - lowerBound + 1)
  ) + lowerBound;
}

function randomize(list) {
  const randomizedList = list.slice();

  for (
    let position = randomizedList.length - 1;
    position > 0;
    position--
  ) {
    const selectedPosition = generateInteger(0, position);

    [
      randomizedList[position],
      randomizedList[selectedPosition]
    ] = [
      randomizedList[selectedPosition],
      randomizedList[position]
    ];
  }

  return randomizedList;
}

function generateCreatures() {
  const totalRabbits = generateInteger(2, 98);
  const totalSnakes = CREATURE_LIMIT - totalRabbits;
  const creatures = [];

  for (let position = 0; position < totalRabbits; position++) {
    creatures.push("rabbit");
  }

  for (let position = 0; position < totalSnakes; position++) {
    creatures.push("snake");
  }

  return {
    animals: randomize(creatures),
    rabbitCount: totalRabbits,
    snakeCount: totalSnakes
  };
}

if (!process.stdin.isTTY) {
  console.error("Este juego necesita una terminal interactiva.");
  process.exit(1);
}

const configuration = generateCreatures();

let creaturePosition = 0;
let points = 0;
let safeRabbits = 0;
let separatedSnakes = 0;
let turnTimer = null;
let sessionTimer = null;
let acceptingAnswer = false;
let gameEnded = false;

const initialTime = Date.now();

function display(statusMessage = "") {
  const currentCreature =
    configuration.animals[creaturePosition];

  const secondsAvailable = Math.max(
    0,
    Math.ceil(
      (
        SESSION_DURATION -
        (Date.now() - initialTime)
      ) / 1000
    )
  );

  console.clear();
  console.log("=== CONEJOS Y SERPIENTES ===");
  console.log(
    `Mezcla: ${configuration.rabbitCount} conejos y ` +
    `${configuration.snakeCount} serpientes`
  );
  console.log(
    `Clasificados: ${creaturePosition}/${CREATURE_LIMIT}`
  );
  console.log(`Puntuación: ${points}`);
  console.log(`Tiempo restante: ${secondsAvailable}s`);
  console.log("");
  console.log(
    currentCreature === "rabbit"
      ? "Animal actual: 🐇 CONEJO"
      : "Animal actual: 🐍 SERPIENTE"
  );
  console.log("");
  console.log("[R] Caja de conejos");
  console.log("[S] Caja de serpientes");
  console.log("[Q] Terminar");

  if (statusMessage) {
    console.log(`\n${statusMessage}`);
  }
}

function endGame(explanation) {
  if (gameEnded) {
    return;
  }

  gameEnded = true;
  acceptingAnswer = false;

  clearTimeout(turnTimer);
  clearTimeout(sessionTimer);

  process.stdin.removeAllListeners("keypress");

  if (process.stdin.isRaw) {
    process.stdin.setRawMode(false);
  }

  process.stdin.pause();
  console.clear();

  console.log("=== RESULTADO FINAL ===");
  console.log(explanation);
  console.log(
    `Clasificados: ${creaturePosition}/${CREATURE_LIMIT}`
  );
  console.log(`Puntuación: ${points}`);
  console.log(`Conejos seguros: ${safeRabbits}`);
  console.log(`Serpientes separadas: ${separatedSnakes}`);
}

function beginTurn(statusMessage = "") {
  if (gameEnded) {
    return;
  }

  if (creaturePosition >= configuration.animals.length) {
    endGame("Clasificaste los 100 animales.");
    return;
  }

  if (Date.now() - initialTime >= SESSION_DURATION) {
    endGame("Se agotaron los 90 segundos.");
    return;
  }

  acceptingAnswer = true;
  display(statusMessage);

  turnTimer = setTimeout(() => {
    if (!acceptingAnswer || gameEnded) {
      return;
    }

    acceptingAnswer = false;
    creaturePosition += 1;
    beginTurn("Tiempo agotado: animal sin clasificar.");
  }, TURN_DURATION);
}

function placeCreature(destinationBox) {
  if (!acceptingAnswer || gameEnded) {
    return;
  }

  acceptingAnswer = false;
  clearTimeout(turnTimer);

  const currentCreature =
    configuration.animals[creaturePosition];

  let statusMessage;

  if (
    currentCreature === "rabbit" &&
    destinationBox === "rabbit"
  ) {
    points += 1;
    safeRabbits += 1;
    statusMessage = "Conejo clasificado correctamente: +1.";
  } else if (
    currentCreature === "snake" &&
    destinationBox === "snake"
  ) {
    points += 1;
    separatedSnakes += 1;
    statusMessage = "Serpiente clasificada correctamente: +1.";
  } else if (
    currentCreature === "rabbit" &&
    destinationBox === "snake"
  ) {
    points -= 1;
    statusMessage =
      "El conejo fue enviado con las serpientes: -1.";
  } else {
    const removedPoints = safeRabbits;
    points -= removedPoints;
    safeRabbits = 0;
    statusMessage =
      `La serpiente entró con los conejos: -${removedPoints}.`;
  }

  creaturePosition += 1;
  beginTurn(statusMessage);
}

terminalReader.emitKeypressEvents(process.stdin);
process.stdin.setRawMode(true);
process.stdin.resume();

process.stdin.on("keypress", (typedCharacter, keyData) => {
  const selectedKey =
    (typedCharacter || "").toLowerCase();

  if (
    keyData &&
    keyData.ctrl &&
    keyData.name === "c"
  ) {
    endGame("Juego interrumpido.");
  } else if (selectedKey === "q") {
    endGame("Terminaste el juego.");
  } else if (selectedKey === "r") {
    placeCreature("rabbit");
  } else if (selectedKey === "s") {
    placeCreature("snake");
  }
});

sessionTimer = setTimeout(() => {
  endGame("Se agotaron los 90 segundos.");
}, SESSION_DURATION);

beginTurn();