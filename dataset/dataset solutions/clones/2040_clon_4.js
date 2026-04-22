const streamHandler = require("fs");

function pairCounter(totalEntities) {
  if (totalEntities <= 1) {
    return 0;
  }
  return (totalEntities - 1) + pairCounter(totalEntities - 1);
}

function processInputAndCompute() {
  const inputData = streamHandler.readFileSync("/dev/stdin", "utf8").trim();
  const firstLine = inputData.split('\n')[0];
  const numericInputs = firstLine.split(' ').map(Number);

  const valueA = numericInputs[0];
  const valueB = numericInputs[1];

  const resultA = pairCounter(valueA);
  const resultB = pairCounter(valueB);

  const finalResult = resultA + resultB;
  return finalResult;
}

const computedValue = processInputAndCompute();
console.log(computedValue);