const isValueBelowOrEqual = (currentValue, threshold) => {
  return currentValue <= threshold;
};

const isNumberEven = (valueToCheck) => {
  const divisor = 2;
  return valueToCheck % divisor === 0;
};

function processInputData(inputStringData) {
  const parsedNumericValue = Number(inputStringData);

  const thresholdForEarlyExit = 2;

  if (isValueBelowOrEqual(parsedNumericValue, thresholdForEarlyExit)) {
    const earlyExitOutput = 2;
    console.log(earlyExitOutput);
    return;
  }

  if (isNumberEven(parsedNumericValue)) {
    const outputMultiplier = 2;
    const finalCalculatedResult = outputMultiplier * parsedNumericValue;
    console.log(finalCalculatedResult);
  }
}

processInputData(require("fs").readFileSync("/dev/stdin", "utf8"));
