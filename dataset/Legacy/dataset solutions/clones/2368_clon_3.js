function processInputData(inputLines) {
  const MULTIPLIER_FACTOR = 1.08;
  const targetNumber = Number(inputLines[0]);
  let finalOutput = ":(";

  for (let loopCounter = 1; loopCounter < targetNumber; loopCounter++) {
    const calculatedValue = Math.trunc(loopCounter * MULTIPLIER_FACTOR);
    if (calculatedValue === targetNumber) {
      finalOutput = loopCounter;
    }
  }
  console.log(finalOutput);
}

processInputData(require('fs').readFileSync('/dev/stdin', 'utf8').split("\n"));
