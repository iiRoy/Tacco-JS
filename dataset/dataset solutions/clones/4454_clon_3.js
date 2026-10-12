const readline = require("readline");

class AnimalSortingGame {
  constructor() {
    this.totalAnimals = 100;
    this.roundDuration = 1000;
    this.gameDuration = 90000;

    this.animals = [];
    this.rabbitTotal = this.randomInteger(2, 98);
    this.snakeTotal =
      this.totalAnimals - this.rabbitTotal;

    this.position = 0;
    this.score = 0;
    this.rabbitsInBox = 0;
    this.snakesInBox = 0;
    this.roundEnabled = false;
    this.ended = false;
    this.roundTimer = null;
    this.gameTimer = null;
    this.startedAt = 0;

    this.handleKey = this.handleKey.bind(this);

    this.prepareAnimals();
  }

  randomInteger(minimum, maximum) {
    return minimum + Math.floor(
      Math.random() * (maximum - minimum + 1)
    );
  }

  prepareAnimals() {
    this.animals = new Array(this.totalAnimals);

    let position = 0;

    while (position < this.rabbitTotal) {
      this.animals[position] = "rabbit";
      position += 1;
    }

    while (position < this.totalAnimals) {
      this.animals[position] = "snake";
      position += 1;
    }

    for (
      let index = this.animals.length - 1;
      index > 0;
      index -= 1
    ) {
      const destination =
        this.randomInteger(0, index);

      const temporary = this.animals[index];
      this.animals[index] =
        this.animals[destination];
      this.animals[destination] = temporary;
    }
  }

  show(message) {
    const currentAnimal =
      this.animals[this.position];

    const elapsed = Date.now() - this.startedAt;
    const seconds = Math.max(
      0,
      Math.ceil(
        (this.gameDuration - elapsed) / 1000
      )
    );

    const animalText =
      currentAnimal === "rabbit"
        ? "Animal actual: 🐇 CONEJO"
        : "Animal actual: 🐍 SERPIENTE";

    console.clear();

    const lines = [
      "=== CONEJOS Y SERPIENTES ===",
      `Mezcla: ${this.rabbitTotal} conejos y ` +
        `${this.snakeTotal} serpientes`,
      `Clasificados: ${this.position}/${this.totalAnimals}`,
      `Puntuación: ${this.score}`,
      `Tiempo restante: ${seconds}s`,
      "",
      animalText,
      "",
      "[R] Caja de conejos",
      "[S] Caja de serpientes",
      "[Q] Terminar"
    ];

    if (message) {
      lines.push("");
      lines.push(message);
    }

    console.log(lines.join("\n"));
  }

  applyResult(box) {
    const animal = this.animals[this.position];

    if (animal === box) {
      this.score += 1;

      if (animal === "rabbit") {
        this.rabbitsInBox += 1;
        return "Conejo clasificado correctamente: +1.";
      }

      this.snakesInBox += 1;
      return "Serpiente clasificada correctamente: +1.";
    }

    if (animal === "rabbit") {
      this.score -= 1;
      return "El conejo fue enviado con las serpientes: -1.";
    }

    const penalty = this.rabbitsInBox;
    this.score -= penalty;
    this.rabbitsInBox = 0;

    return (
      `La serpiente entró con los conejos: -${penalty}.`
    );
  }

  nextRound(message = "") {
    if (this.ended) {
      return;
    }

    const elapsed = Date.now() - this.startedAt;

    if (this.position === this.totalAnimals) {
      this.end("Clasificaste los 100 animales.");
      return;
    }

    if (elapsed >= this.gameDuration) {
      this.end("Se agotaron los 90 segundos.");
      return;
    }

    this.roundEnabled = true;
    this.show(message);

    this.roundTimer = setTimeout(() => {
      if (!this.roundEnabled || this.ended) {
        return;
      }

      this.roundEnabled = false;
      this.position += 1;

      this.nextRound(
        "Tiempo agotado: animal sin clasificar."
      );
    }, this.roundDuration);
  }

  choose(box) {
    if (!this.roundEnabled || this.ended) {
      return;
    }

    this.roundEnabled = false;
    clearTimeout(this.roundTimer);

    const message = this.applyResult(box);

    this.position += 1;
    this.nextRound(message);
  }

  handleKey(character, key) {
    const pressed = (character || "").toLowerCase();

    if (key && key.ctrl && key.name === "c") {
      this.end("Juego interrumpido.");
      return;
    }

    const actions = {
      q: () => this.end("Terminaste el juego."),
      r: () => this.choose("rabbit"),
      s: () => this.choose("snake")
    };

    const action = actions[pressed];

    if (action) {
      action();
    }
  }

  end(reason) {
    if (this.ended) {
      return;
    }

    this.ended = true;
    this.roundEnabled = false;

    clearTimeout(this.roundTimer);
    clearTimeout(this.gameTimer);

    process.stdin.removeListener(
      "keypress",
      this.handleKey
    );

    if (process.stdin.isRaw) {
      process.stdin.setRawMode(false);
    }

    process.stdin.pause();
    console.clear();

    console.log([
      "=== RESULTADO FINAL ===",
      reason,
      `Clasificados: ${this.position}/${this.totalAnimals}`,
      `Puntuación: ${this.score}`,
      `Conejos seguros: ${this.rabbitsInBox}`,
      `Serpientes separadas: ${this.snakesInBox}`
    ].join("\n"));
  }

  start() {
    if (!process.stdin.isTTY) {
      console.error(
        "Este juego necesita una terminal interactiva."
      );
      return;
    }

    readline.emitKeypressEvents(process.stdin);
    process.stdin.setRawMode(true);
    process.stdin.resume();
    process.stdin.on("keypress", this.handleKey);

    this.startedAt = Date.now();

    this.gameTimer = setTimeout(
      () => this.end("Se agotaron los 90 segundos."),
      this.gameDuration
    );

    this.nextRound();
  }
}

const game = new AnimalSortingGame();
game.start();