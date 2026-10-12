process.stdin.resume();
process.stdin.setEncoding('utf8');

let capturedLines = [];
const inputProcessor = require('readline').createInterface({
  input: process.stdin,
  output: process.stdout
});

inputProcessor.on('line', (currentInputLine) => {
  capturedLines.push(currentInputLine);
});

inputProcessor.on('close', () => {
  const upperLimit = Number(capturedLines[0]);

  const calculateBinaryExponent = (valueOperand) => {
    return Math.log2(valueOperand & -valueOperand);
  };

  let bestCandidate = 1;
  let maximumExponent = calculateBinaryExponent(1);

  for (let currentIterationValue = 2; currentIterationValue <= upperLimit; currentIterationValue++) {
    const currentExponentResult = calculateBinaryExponent(currentIterationValue);

    if (currentExponentResult > maximumExponent) {
      maximumExponent = currentExponentResult;
      bestCandidate = currentIterationValue;
    }
  }

  console.log(bestCandidate);
});
