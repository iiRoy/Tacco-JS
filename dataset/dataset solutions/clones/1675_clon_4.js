const inputAcquirer = process.stdin;
const textEncoding = 'utf8';

inputAcquirer.resume();
inputAcquirer.setEncoding(textEncoding);

let storedSegments = [];
const lineHandler = require('readline').createInterface({
  input: inputAcquirer,
  output: process.stdout
});

lineHandler.on('line', (currentPiece) => {
  storedSegments.push(currentPiece);
});

lineHandler.on('close', () => {
  const maximumTarget = parseInt(storedSegments[0], 10);

  const highestPossibleSum = 60000;
  const sumOccurrences = new Array(highestPossibleSum + 1).fill(0);

  for (let componentA = 1; componentA <= 100; ++componentA) {
    for (let componentB = 1; componentB <= 100; ++componentB) {
      for (let componentC = 1; componentC <= 100; ++componentC) {
        const computedSum =
          componentA * componentA + componentB * componentB + componentC * componentC +
          componentA * componentB + componentA * componentC + componentB * componentC;
        
        if (computedSum <= highestPossibleSum) {
          sumOccurrences[computedSum]++;
        }
      }
    }
  }

  const generatedOutputs = [];
  for (let currentCheck = 1; currentCheck <= maximumTarget; ++currentCheck) {
    generatedOutputs.push(sumOccurrences[currentCheck]);
  }

  console.log(generatedOutputs.join('\n'));
});