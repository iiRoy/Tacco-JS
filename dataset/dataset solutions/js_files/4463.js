const readline = require("readline");

const terminal = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

const order = {
  broth: "",
  size: "",
  protein: "",
  extra: ""
};

let total = 0;

function ask(question, handler) {
  terminal.question(question, (answer) => {
    handler(Number(answer.trim()));
  });
}

function selectBroth() {
  console.log("\n=== NANORAMEN ===");
  console.log("Paso 1 de 4: selecciona el caldo");
  console.log("1. Shoyu ............ $95");
  console.log("2. Miso ............. $105");
  console.log("3. Picante .......... $110");

  ask("Opción: ", (choice) => {
    switch (choice) {
      case 1:
        order.broth = "Shoyu";
        total += 95;
        break;

      case 2:
        order.broth = "Miso";
        total += 105;
        break;

      case 3:
        order.broth = "Picante";
        total += 110;
        break;

      default:
        console.log("Opción inválida.");
        selectBroth();
        return;
    }

    selectSize();
  });
}

function selectSize() {
  console.log("\nPaso 2 de 4: selecciona el tamaño");
  console.log("1. Regular .......... +$0");
  console.log("2. Grande ........... +$25");

  ask("Opción: ", (choice) => {
    switch (choice) {
      case 1:
        order.size = "Regular";
        break;

      case 2:
        order.size = "Grande";
        total += 25;
        break;

      default:
        console.log("Opción inválida.");
        selectSize();
        return;
    }

    selectProtein();
  });
}

function selectProtein() {
  console.log("\nPaso 3 de 4: selecciona la proteína");
  console.log("1. Cerdo ............ +$35");
  console.log("2. Pollo ............ +$30");
  console.log("3. Tofu ............. +$25");

  ask("Opción: ", (choice) => {
    switch (choice) {
      case 1:
        order.protein = "Cerdo";
        total += 35;
        break;

      case 2:
        order.protein = "Pollo";
        total += 30;
        break;

      case 3:
        order.protein = "Tofu";
        total += 25;
        break;

      default:
        console.log("Opción inválida.");
        selectProtein();
        return;
    }

    selectExtra();
  });
}

function selectExtra() {
  console.log("\nPaso 4 de 4: selecciona un extra");
  console.log("1. Huevo ............ +$18");
  console.log("2. Nori ............. +$12");
  console.log("3. Sin extra ........ +$0");

  ask("Opción: ", (choice) => {
    switch (choice) {
      case 1:
        order.extra = "Huevo";
        total += 18;
        break;

      case 2:
        order.extra = "Nori";
        total += 12;
        break;

      case 3:
        order.extra = "Sin extra";
        break;

      default:
        console.log("Opción inválida.");
        selectExtra();
        return;
    }

    showOrder();
  });
}

function showOrder() {
  console.log("\n=== PEDIDO FINAL ===");
  console.log(`Caldo: ${order.broth}`);
  console.log(`Tamaño: ${order.size}`);
  console.log(`Proteína: ${order.protein}`);
  console.log(`Extra: ${order.extra}`);
  console.log(`Total: $${total}`);
  console.log("Gracias por ordenar en NanoRamen.");

  terminal.close();
}

selectBroth();