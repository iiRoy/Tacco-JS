const nodeProcess = process;

nodeProcess.stdin.resume();
nodeProcess.stdin.setEncoding('utf8');

var receivedInputLines = [];
const readlineModule = require('readline');

var inputHandler = readlineModule.createInterface({
  input: nodeProcess.stdin,
  output: nodeProcess.stdout
});

inputHandler.on('line', (incomingLine) => {
  receivedInputLines.push(incomingLine);
});

function performCalculation(operandA, operandB) {
  const numericA = Number(operandA);
  const numericB = Number(operandB);
  const intermediateResult = numericB / 2;
  const finalSum = numericA + intermediateResult;
  return finalSum;
}

inputHandler.on('close', () => {
  const firstInputLine = receivedInputLines[0];
  const numericParts = firstInputLine.split(' ');

  const firstValueString = numericParts[0];
  const secondValueString = numericParts[1];

  const calculatedOutput = performCalculation(firstValueString, secondValueString);

  console.log(calculatedOutput);
});
