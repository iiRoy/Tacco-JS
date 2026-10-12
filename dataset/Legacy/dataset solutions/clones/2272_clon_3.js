function processData(rawInputString) {
  const MODULO_VALUE = 10000000007;

  const inputLinesArray = rawInputString.split("\n");
  const totalElementsCount = Number(inputLinesArray[0]);

  const parseNumericString = (str) => parseInt(str, 10);

  const numericValues = inputLinesArray[1].split(" ").map(parseNumericString);
  console.log(numericValues);

  let runningSum = 0;
  let calculatedFactorial = 1;

  for (let currentIndex = 1; currentIndex < totalElementsCount; currentIndex++) {
    runningSum += numericValues[currentIndex];
    console.log(runningSum);
    calculatedFactorial *= currentIndex;
  }

  const divisorForAverage = totalElementsCount - 1;
  const intermediateQuotient = runningSum / divisorForAverage;
  const finalProductValue = intermediateQuotient * calculatedFactorial;

  console.log(finalProductValue);
  console.log(finalProductValue % MODULO_VALUE);
}

processData(require("fs").readFileSync("/dev/stdin", "utf8"));
