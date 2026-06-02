const fileContent = require('fs').readFileSync('/dev/stdin', 'utf8');

const inputLines = fileContent.split('\n');

const dataLength = Number(inputLines[0]);

const firstCharArr = inputLines[1].split('');
const secondCharArr = inputLines[2].split('');
const thirdCharArr = inputLines[3].split('');

let totalOperations = 0;

const determineIncrementValue = (charOne, charTwo, charThree) => {
  const areAllDifferent = (charOne !== charTwo && charTwo !== charThree && charThree !== charOne);
  const areAllSame = (charOne === charTwo && charTwo === charThree);

  if (areAllDifferent) {
    return 2;
  } else if (areAllSame) {
    return 0;
  } else {
    // This covers the case where exactly two characters are identical.
    return 1;
  }
};

for (let iterationIndex = 0; iterationIndex < dataLength; iterationIndex++) {
  const currentA = firstCharArr[iterationIndex];
  const currentB = secondCharArr[iterationIndex];
  const currentC = thirdCharArr[iterationIndex];

  const incrementAmount = determineIncrementValue(currentA, currentB, currentC);
  totalOperations += incrementAmount;
}

console.log(totalOperations);
