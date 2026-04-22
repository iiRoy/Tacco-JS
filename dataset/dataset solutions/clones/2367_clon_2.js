function acquireData() {
  return require("fs")
    .readFileSync("/dev/stdin", "utf8")
    .trim();
}

function emitOutput(dataPayload) {
  console.log(dataPayload);
}

/*
  This function handles various input transformations.
  Mode 0: Returns the input value unchanged.
  Mode 1: Converts the input value to an integer.
  Mode 2: Splits the input string by spaces.
  Mode 3: Splits the input string by newlines.
  Mode 4: Splits by spaces and converts each resulting part to a number.
  Mode 5: Splits by newlines and converts each resulting part to a number.
  Mode 6: Splits the input string into individual characters.
  Mode 7: Splits into individual characters and converts each to a number.
*/
function processInput(sourceVal, conversionMode) {
  switch (conversionMode) {
    case 0:
      return sourceVal;
    case 1:
      return parseInt(sourceVal);
    case 2:
      return sourceVal.split(" ");
    case 3:
      return sourceVal.split("\n");
    case 4:
      return sourceVal.split(" ").map((item) => Number(item));
    case 5:
      return sourceVal.split("\n").map((item) => Number(item));
    case 6:
      return sourceVal.split("");
    case 7:
      return sourceVal.split("").map((item) => Number(item));
  }
}

function performAnalysis(primaryData) {
  primaryData = processInput(primaryData, 1);

  let initialCostA = Math.floor(primaryData / 1.08);
  let initialCostB = Math.ceil(primaryData / 1.08);

  let calculatedValueA = Math.floor(initialCostA * 1.08);
  let calculatedValueB = Math.floor(initialCostB * 1.08);

  if (primaryData == calculatedValueA) {
    emitOutput(initialCostA);
  } else if (primaryData == calculatedValueB) {
    emitOutput(initialCostB);
  } else {
    emitOutput(":(");
  }
}

performAnalysis(acquireData());