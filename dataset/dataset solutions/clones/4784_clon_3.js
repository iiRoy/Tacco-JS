function readCoordinates(sourceText) {
  var firstLine = sourceText.split("\n")[0];
  var values = firstLine.split(" ").map(Number);

  return {
    x: values[2],
    y: values[3]
  };
}

function repeatMove(symbol, times) {
  var chunk = "";

  for (var index = 0; index < times; index++) {
    chunk += symbol;
  }

  return chunk;
}

function expandRouteRecipe(recipe) {
  var routeParts = [];

  for (var stepIndex = 0; stepIndex < recipe.length; stepIndex++) {
    var currentStep = recipe[stepIndex];

    if (currentStep.kind === "repeat") {
      routeParts.push(repeatMove(currentStep.move, currentStep.amount));
    } else if (currentStep.kind === "literal") {
      routeParts.push(currentStep.value);
    }
  }

  return routeParts.join("");
}

function createMovementRecipe(point) {
  var horizontal = point.x;
  var vertical = point.y;

  return [
    { kind: "repeat", move: "U", amount: vertical },
    { kind: "repeat", move: "R", amount: horizontal },
    { kind: "repeat", move: "D", amount: vertical },
    { kind: "repeat", move: "L", amount: horizontal },

    { kind: "literal", value: "L" },

    { kind: "repeat", move: "U", amount: vertical + 1 },
    { kind: "repeat", move: "R", amount: horizontal + 1 },

    { kind: "literal", value: "DR" },

    { kind: "repeat", move: "D", amount: vertical + 1 },
    { kind: "repeat", move: "L", amount: horizontal + 1 },

    { kind: "literal", value: "U" }
  ];
}

function Main(input) {
  var targetPoint = readCoordinates(input);
  var movementRecipe = createMovementRecipe(targetPoint);
  var answer = expandRouteRecipe(movementRecipe);

  console.log(answer);
}

Main(require("fs").readFileSync("/dev/stdin", "utf8"));