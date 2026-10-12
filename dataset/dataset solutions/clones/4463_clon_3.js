const readline = require("readline");

class NanoRamenOrder {
  constructor() {
    this.terminal = readline.createInterface({
      input: process.stdin,
      output: process.stdout
    });

    this.selection = {
      broth: "",
      size: "",
      protein: "",
      extra: ""
    };

    this.total = 0;
  }

  ask(message, next) {
    this.terminal.question(message, (answer) => {
      const numericAnswer = Number(answer.trim());

      next(numericAnswer);
    });
  }

  start() {
    console.log("\n=== NANORAMEN ===");
    this.chooseBroth();
  }

  chooseBroth() {
    console.log([
      "Paso 1 de 4: selecciona el caldo",
      "1. Shoyu ............ $95",
      "2. Miso ............. $105",
      "3. Picante .......... $110"
    ].join("\n"));

    this.ask("Opción: ", (choice) => {
      let selectedBroth;
      let selectedPrice;

      switch (choice) {
        case 1:
          selectedBroth = "Shoyu";
          selectedPrice = 95;
          break;

        case 2:
          selectedBroth = "Miso";
          selectedPrice = 105;
          break;

        case 3:
          selectedBroth = "Picante";
          selectedPrice = 110;
          break;

        default:
          console.log("Opción inválida.");
          this.chooseBroth();
          return;
      }

      this.selection.broth = selectedBroth;
      this.total += selectedPrice;

      this.chooseSize();
    });
  }

  chooseSize() {
    console.log([
      "",
      "Paso 2 de 4: selecciona el tamaño",
      "1. Regular .......... +$0",
      "2. Grande ........... +$25"
    ].join("\n"));

    this.ask("Opción: ", (choice) => {
      switch (choice) {
        case 1:
          this.selection.size = "Regular";
          break;

        case 2:
          this.selection.size = "Grande";
          this.total += 25;
          break;

        default:
          console.log("Opción inválida.");
          this.chooseSize();
          return;
      }

      this.chooseProtein();
    });
  }

  chooseProtein() {
    console.log([
      "",
      "Paso 3 de 4: selecciona la proteína",
      "1. Cerdo ............ +$35",
      "2. Pollo ............ +$30",
      "3. Tofu ............. +$25"
    ].join("\n"));

    this.ask("Opción: ", (choice) => {
      const proteins = {
        1: ["Cerdo", 35],
        2: ["Pollo", 30],
        3: ["Tofu", 25]
      };

      const selectedProtein = proteins[choice];

      if (!selectedProtein) {
        console.log("Opción inválida.");
        this.chooseProtein();
        return;
      }

      this.selection.protein = selectedProtein[0];
      this.total += selectedProtein[1];

      this.chooseExtra();
    });
  }

  chooseExtra() {
    console.log([
      "",
      "Paso 4 de 4: selecciona un extra",
      "1. Huevo ............ +$18",
      "2. Nori ............. +$12",
      "3. Sin extra ........ +$0"
    ].join("\n"));

    this.ask("Opción: ", (choice) => {
      switch (choice) {
        case 1:
          this.selection.extra = "Huevo";
          this.total += 18;
          break;

        case 2:
          this.selection.extra = "Nori";
          this.total += 12;
          break;

        case 3:
          this.selection.extra = "Sin extra";
          break;

        default:
          console.log("Opción inválida.");
          this.chooseExtra();
          return;
      }

      this.finish();
    });
  }

  finish() {
    const summary = [
      "",
      "=== PEDIDO FINAL ===",
      `Caldo: ${this.selection.broth}`,
      `Tamaño: ${this.selection.size}`,
      `Proteína: ${this.selection.protein}`,
      `Extra: ${this.selection.extra}`,
      `Total: $${this.total}`,
      "Gracias por ordenar en NanoRamen."
    ];

    console.log(summary.join("\n"));

    this.terminal.close();
  }
}

const order = new NanoRamenOrder();
order.start();