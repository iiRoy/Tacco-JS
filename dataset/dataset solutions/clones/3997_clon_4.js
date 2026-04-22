const sysio = require('node:fs');
const dataStorage = Buffer.alloc(1024);
const byteCount = sysio.readSync(0, dataStorage, 0, dataStorage.length);
const dataStream = dataStorage.toString('utf8', 0, byteCount);

let currentIndex = 0;
let currentCharacter;
let firstValStr = '';
let secondValStr = '';

while (currentIndex < dataStream.length) {
  currentCharacter = dataStream[currentIndex];
  if (currentCharacter !== ' ' && currentCharacter !== '\t' && currentCharacter !== '\n' && currentCharacter !== '\r') {
    break;
  }
  currentIndex++;
}

while (currentIndex < dataStream.length) {
  currentCharacter = dataStream[currentIndex];
  if (currentCharacter === ' ' || currentCharacter === '\t' || currentCharacter === '\n' || currentCharacter === '\r') {
    break;
  }
  firstValStr += currentCharacter;
  currentIndex++;
}

while (currentIndex < dataStream.length) {
  currentCharacter = dataStream[currentIndex];
  if (currentCharacter !== ' ' && currentCharacter !== '\t' && currentCharacter !== '\n' && currentCharacter !== '\r') {
    break;
  }
  currentIndex++;
}

while (currentIndex < dataStream.length) {
  currentCharacter = dataStream[currentIndex];
  if (currentCharacter === ' ' || currentCharacter === '\t' || currentCharacter === '\n' || currentCharacter === '\r') {
    break;
  }
  secondValStr += currentCharacter;
  currentIndex++;
}

const operandA = Number(firstValStr) - 2;
const operandB = Number(secondValStr) - 2;

function calculateProductValue(valX, valY) {
  let outcomeAccumulator = 0;
  let isNegativeResult = false;

  if ((valX < 0 && valY > 0) || (valX > 0 && valY < 0)) {
    isNegativeResult = true;
  }

  valX = (valX < 0) ? (0 - valX) : valX;
  valY = (valY < 0) ? (0 - valY) : valY;

  for (let counter = 0; counter < valY; counter++) {
    outcomeAccumulator += valX;
  }

  return isNegativeResult ? (0 - outcomeAccumulator) : outcomeAccumulator;
}

function determinePositiveValue(initialValue) {
  return (initialValue < 0) ? (initialValue * -1) : initialValue;
}

const intermediateProduct = calculateProductValue(operandA, operandB);
const finalAbsoluteResult = determinePositiveValue(intermediateProduct);

const displayString = String(finalAbsoluteResult);
process.stdout.write(displayString + '\n');