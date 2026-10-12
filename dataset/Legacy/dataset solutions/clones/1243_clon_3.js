'use strict';

function processInputAndCompute(inputBuffer) {
  const receivedDataString = inputBuffer.toString().trim();
  const numberStrings = receivedDataString.split(' ');
  
  const parsedNumbers = numberStrings.map(Number);

  const firstOperand = parsedNumbers[0];
  const secondOperand = parsedNumbers[1];

  const rawDivisionResult = firstOperand / secondOperand;

  const floorDivision = Math.floor(rawDivisionResult);
  const moduloRemainder = firstOperand % secondOperand;
  const fixedPrecisionDivision = rawDivisionResult.toFixed(5);

  console.log(floorDivision, moduloRemainder, fixedPrecisionDivision);
}

process.stdin.on('data', processInputAndCompute);

process.stdin.resume();
process.stdin.setEncoding('utf8');
