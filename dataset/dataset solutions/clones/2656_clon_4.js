const sourceReader = require("node:fs");

function processSignal(dataString) {
  let splitPoint = -1;
  let scanIndex = 0;

  while (scanIndex < dataString.length) {
    if (dataString[scanIndex] === ' ') {
      splitPoint = scanIndex;
      break;
    }
    scanIndex++;
  }

  const operandOne = dataString.substring(0, splitPoint);
  const operandTwo = dataString.substring(splitPoint + 1);

  let resultA = operandOne + operandTwo;
  let resultB = operandOne - operandTwo;
  let resultC = operandOne * operandTwo;

  let finalOutcome = resultA;

  if (resultB > finalOutcome) {
    finalOutcome = resultB;
  }
  if (resultC > finalOutcome) {
    finalOutcome = resultC;
  }

  return finalOutcome;
}

const rawTransmission = sourceReader.readFileSync("/dev/stdin", "utf8");
process.stdout.write(String(processSignal(rawTransmission)));