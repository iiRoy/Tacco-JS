const readline = require("readline");

const catalog = [
  {
    key: "broth",
    label: "Caldo",
    title: "selecciona el caldo",
    options: [
      { name: "Shoyu", price: 95 },
      { name: "Miso", price: 105 },
      { name: "Picante", price: 110 }
    ]
  },
  {
    key: "size",
    label: "Tamaño",
    title: "selecciona el tamaño",
    options: [
      { name: "Regular", price: 0 },
      { name: "Grande", price: 25 }
    ]
  },
  {
    key: "protein",
    label: "Proteína",
    title: "selecciona la proteína",
    options: [
      { name: "Cerdo", price: 35 },
      { name: "Pollo", price: 30 },
      { name: "Tofu", price: 25 }
    ]
  },
  {
    key: "extra",
    label: "Extra",
    title: "selecciona un extra",
    options: [
      { name: "Huevo", price: 18 },
      { name: "Nori", price: 12 },
      { name: "Sin extra", price: 0 }
    ]
  }
];

function createQuestionReader() {
  const terminal = readline.createInterface({
    input: process.stdin,
    output: process.stdout
  });

  function question(message) {
    return new Promise((resolve) => {
      terminal.question(message, resolve);
    });
  }

  return {
    terminal,
    question
  };
}

function displayStep(step, position) {
  console.log(
    `\nPaso ${position + 1} de ${catalog.length}: ` +
    step.title
  );

  step.options.forEach((option, index) => {
    const prefix =
      position === 0
        ? "$"
        : "+$";

    console.log(
      `${index + 1}. ${option.name} ` +
      `(${prefix}${option.price})`
    );
  });
}

async function obtainSelection(reader, step, position) {
  while (true) {
    displayStep(step, position);

    const answer = await reader.question("Opción: ");
    const selectedIndex = Number(answer.trim()) - 1;
    const selectedOption = step.options[selectedIndex];

    if (selectedOption) {
      return selectedOption;
    }

    console.log("Opción inválida.");
  }
}

async function createOrder() {
  const reader = createQuestionReader();
  const selections = {};
  let total = 0;

  console.log("\n=== NANORAMEN ===");

  for (
    let position = 0;
    position < catalog.length;
    position++
  ) {
    const step = catalog[position];

    const selectedOption = await obtainSelection(
      reader,
      step,
      position
    );

    selections[step.key] = selectedOption.name;
    total += selectedOption.price;
  }

  console.log("\n=== PEDIDO FINAL ===");

  for (const step of catalog) {
    console.log(
      `${step.label}: ${selections[step.key]}`
    );
  }

  console.log(`Total: $${total}`);
  console.log("Gracias por ordenar en NanoRamen.");

  reader.terminal.close();
}

createOrder();