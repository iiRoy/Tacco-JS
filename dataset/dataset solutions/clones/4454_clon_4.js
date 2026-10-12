const readline = require("readline");

const ANIMAL_LIMIT = 100;
const DECISION_TIME = 1000;
const COMPLETE_TIME = 90000;

function createRandomAnimals() {
  const rabbitTotal =
    2 + Math.floor(Math.random() * 97);

  const snakeTotal =
    ANIMAL_LIMIT - rabbitTotal;

  const animals = Array.from(
    { length: ANIMAL_LIMIT },
    (_, index) => (
      index < rabbitTotal
        ? "rabbit"
        : "snake"
    )
  );

  for (
    let index = animals.length - 1;
    index > 0;
    index -= 1
  ) {
    const randomPosition =
      Math.floor(Math.random() * (index + 1));

    const temporary = animals[index];
    animals[index] = animals[randomPosition];
    animals[randomPosition] = temporary;
  }

  return {
    animals,
    rabbitTotal,
    snakeTotal
  };
}

function waitForChoice(milliseconds) {
  return new Promise((resolve) => {
    let completed = false;
    let timer;

    function complete(value) {
      if (completed) {
        return;
      }

      completed = true;
      clearTimeout(timer);

      process.stdin.removeListener(
        "keypress",
        handleKey
      );

      resolve(value);
    }

    function handleKey(character, key) {
      const pressed =
        (character || "").toLowerCase();

      if (
        key &&
        key.ctrl &&
        key.name === "c"
      ) {
        complete("quit");
      } else if (pressed === "q") {
        complete("quit");
      } else if (pressed === "r") {
        complete("rabbit");
      } else if (pressed === "s") {
        complete("snake");
      }
    }

    process.stdin.on("keypress", handleKey);

    timer = setTimeout(
      () => complete(null),
      milliseconds
    );
  });
}

function drawGame(state, setup, message) {
  const animal = setup.animals[state.position];
  const remaining = Math.max(
    0,
    Math.ceil(
      (state.deadline - Date.now()) / 1000
    )
  );

  console.clear();

  console.log([
    "=== CONEJOS Y SERPIENTES ===",
    `Mezcla: ${setup.rabbitTotal} conejos y ` +
      `${setup.snakeTotal} serpientes`,
    `Clasificados: ${state.position}/${ANIMAL_LIMIT}`,
    `Puntuación: ${state.score}`,
    `Tiempo restante: ${remaining}s`,
    "",
    animal === "rabbit"
      ? "Animal actual: 🐇 CONEJO"
      : "Animal actual: 🐍 SERPIENTE",
    "",
    "[R] Caja de conejos",
    "[S] Caja de serpientes",
    "[Q] Terminar",
    message ? `\n${message}` : ""
  ].join("\n"));
}

function updateScore(state, animal, selectedBox) {
  if (animal === selectedBox) {
    state.score += 1;

    if (animal === "rabbit") {
      state.rabbitsInBox += 1;
      return "Conejo clasificado correctamente: +1.";
    }

    state.snakesInBox += 1;
    return "Serpiente clasificada correctamente: +1.";
  }

  if (animal === "rabbit") {
    state.score -= 1;
    return "El conejo fue enviado con las serpientes: -1.";
  }

  const penalty = state.rabbitsInBox;

  state.score -= penalty;
  state.rabbitsInBox = 0;

  return (
    `La serpiente entró con los conejos: -${penalty}.`
  );
}

async function play() {
  if (!process.stdin.isTTY) {
    console.error(
      "Este juego necesita una terminal interactiva."
    );
    return;
  }

  readline.emitKeypressEvents(process.stdin);
  process.stdin.setRawMode(true);
  process.stdin.resume();

  const setup = createRandomAnimals();

  const state = {
    position: 0,
    score: 0,
    rabbitsInBox: 0,
    snakesInBox: 0,
    deadline: Date.now() + COMPLETE_TIME
  };

  let message = "";
  let reason = "Clasificaste los 100 animales.";

  while (state.position < ANIMAL_LIMIT) {
    const totalRemaining =
      state.deadline - Date.now();

    if (totalRemaining <= 0) {
      reason = "Se agotaron los 90 segundos.";
      break;
    }

    drawGame(state, setup, message);

    const availableTime = Math.min(
      DECISION_TIME,
      totalRemaining
    );

    const selectedBox = await waitForChoice(
      availableTime
    );

    if (selectedBox === "quit") {
      reason = "Terminaste el juego.";
      break;
    }

    if (Date.now() >= state.deadline) {
      reason = "Se agotaron los 90 segundos.";
      break;
    }

    if (selectedBox === null) {
      message =
        "Tiempo agotado: animal sin clasificar.";
    } else {
      const animal =
        setup.animals[state.position];

      message = updateScore(
        state,
        animal,
        selectedBox
      );
    }

    state.position += 1;
  }

  if (process.stdin.isRaw) {
    process.stdin.setRawMode(false);
  }

  process.stdin.pause();
  console.clear();

  console.log([
    "=== RESULTADO FINAL ===",
    reason,
    `Clasificados: ${state.position}/${ANIMAL_LIMIT}`,
    `Puntuación: ${state.score}`,
    `Conejos seguros: ${state.rabbitsInBox}`,
    `Serpientes separadas: ${state.snakesInBox}`
  ].join("\n"));
}

play();