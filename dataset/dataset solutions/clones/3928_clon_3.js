function processInputData(inputString) {
  const inputLines = inputString.split("\n");
  const entryCount = +inputLines[0];
  let finalResult = 0;
  const INITIAL_MIN_VALUE_MARKER = 1e10;
  let minBForCondition = INITIAL_MIN_VALUE_MARKER;

  const parseNumericPair = (lineContent) => lineContent.split(" ").map(Number);

  for (let idx = 0; idx < entryCount; idx++) {
    const currentValues = parseNumericPair(inputLines[idx + 1]);

    const valueA = currentValues[0];
    const valueB = currentValues[1];

    if (valueA > valueB) {
      minBForCondition = Math.min(minBForCondition, valueB);
    }
    finalResult += valueA;
  }

  if (minBForCondition === INITIAL_MIN_VALUE_MARKER) {
    finalResult = 0;
  } else {
    finalResult -= minBForCondition;
  }

  console.log(finalResult);
}

processInputData(require("fs").readFileSync("/dev/stdin", "utf8"));
