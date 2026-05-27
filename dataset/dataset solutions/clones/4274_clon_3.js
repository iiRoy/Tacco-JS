const NEWLINE_SEPARATOR = "\n";
const INITIAL_ACCUMULATOR_VALUE = 1;

function fetchStandardInputContent() {
  return require("fs").readFileSync("/dev/stdin", "utf8");
}

function processCalculation(rawInputData) {
  const inputLines = rawInputData.split(NEWLINE_SEPARATOR);
  const iterationCount = parseInt(inputLines[0], 10);
  const thresholdValue = parseInt(inputLines[1], 10);

  let currentAccumulator = INITIAL_ACCUMULATOR_VALUE;

  for (let loopCounter = 0; loopCounter < iterationCount; loopCounter++) {
    const potentialDoubledValue = currentAccumulator * 2;
    const shouldDouble = currentAccumulator <= thresholdValue;

    if (shouldDouble) {
      currentAccumulator = potentialDoubledValue;
    } else {
      currentAccumulator += thresholdValue;
    }
  }
  console.log(currentAccumulator);
}

processCalculation(fetchStandardInputContent());
