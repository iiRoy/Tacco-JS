const inputLibrary = require("readline");

const session = inputLibrary.createInterface({
  input: process.stdin,
  output: process.stdout
});

const request = {
  soup: "",
  portion: "",
  ingredient: "",
  complement: ""
};

let price = 0;

function requestNumber(message, callback) {
  session.question(message, (response) => {
    callback(Number(response.trim()));
  });
}

function chooseSoup() {
  console.log("\n=== NANORAMEN ===");
  console.log("Paso 1 de 4: selecciona el caldo");
  console.log("1. Shoyu ............ $95");
  console.log("2. Miso ............. $105");
  console.log("3. Picante .......... $110");

  requestNumber("Opción: ", (option) => {
    switch (option) {
      case 1:
        request.soup = "Shoyu";
        price += 95;
        break;

      case 2:
        request.soup = "Miso";
        price += 105;
        break;

      case 3:
        request.soup = "Picante";
        price += 110;
        break;

      default:
        console.log("Opción inválida.");
        chooseSoup();
        return;
    }

    choosePortion();
  });
}

function choosePortion() {
  console.log("\nPaso 2 de 4: selecciona el tamaño");
  console.log("1. Regular .......... +$0");
  console.log("2. Grande ........... +$25");

  requestNumber("Opción: ", (option) => {
    switch (option) {
      case 1:
        request.portion = "Regular";
        break;

      case 2:
        request.portion = "Grande";
        price += 25;
        break;

      default:
        console.log("Opción inválida.");
        choosePortion();
        return;
    }

    chooseIngredient();
  });
}

function chooseIngredient() {
  console.log("\nPaso 3 de 4: selecciona la proteína");
  console.log("1. Cerdo ............ +$35");
  console.log("2. Pollo ............ +$30");
  console.log("3. Tofu ............. +$25");

  requestNumber("Opción: ", (option) => {
    switch (option) {
      case 1:
        request.ingredient = "Cerdo";
        price += 35;
        break;

      case 2:
        request.ingredient = "Pollo";
        price += 30;
        break;

      case 3:
        request.ingredient = "Tofu";
        price += 25;
        break;

      default:
        console.log("Opción inválida.");
        chooseIngredient();
        return;
    }

    chooseComplement();
  });
}

function chooseComplement() {
  console.log("\nPaso 4 de 4: selecciona un extra");
  console.log("1. Huevo ............ +$18");
  console.log("2. Nori ............. +$12");
  console.log("3. Sin extra ........ +$0");

  requestNumber("Opción: ", (option) => {
    switch (option) {
      case 1:
        request.complement = "Huevo";
        price += 18;
        break;

      case 2:
        request.complement = "Nori";
        price += 12;
        break;

      case 3:
        request.complement = "Sin extra";
        break;

      default:
        console.log("Opción inválida.");
        chooseComplement();
        return;
    }

    printRequest();
  });
}

function printRequest() {
  console.log("\n=== PEDIDO FINAL ===");
  console.log(`Caldo: ${request.soup}`);
  console.log(`Tamaño: ${request.portion}`);
  console.log(`Proteína: ${request.ingredient}`);
  console.log(`Extra: ${request.complement}`);
  console.log(`Total: $${price}`);
  console.log("Gracias por ordenar en NanoRamen.");

  session.close();
}

chooseSoup();