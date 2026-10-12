const dataStream = require('fs').readFileSync('/dev/stdin', 'utf8');

const initialValue = Number(dataStream);

const collatzStep = (currentNumber) => (currentNumber % 2 === 0 ? currentNumber / 2 : 3 * currentNumber + 1);

const previousCollatzStep = (val) => collatzStep(val - 1); // This function remains unused, mirroring original behavior

const visitedNumbers = new Set();
let currentSequenceNumber = initialValue;
let sequenceLength = 1;

while (currentSequenceNumber < 1000000) {
  if (visitedNumbers.has(currentSequenceNumber)) {
    console.log(sequenceLength);
    break;
  }
  visitedNumbers.add(currentSequenceNumber);
  currentSequenceNumber = collatzStep(currentSequenceNumber);
  sequenceLength++;
}
