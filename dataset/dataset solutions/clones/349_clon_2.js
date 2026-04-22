function massiveSum(firstNum, secondNum) {
  const digitsOne = String(firstNum) . split('') . reverse() . map(Number);
  const digitsTwo = String(secondNum) . split('') . reverse() . map(Number);

  let sumDigits = [ ];
  const maxLength = Math.max(digitsOne.length, digitsTwo.length);

  for (let digitIndex = 0; digitIndex < maxLength + 1; digitIndex++) {
    sumDigits[digitIndex] = 0;
  }

  for (let digitIndex = 0; digitIndex < maxLength; digitIndex++) {
    let currentSum = 0;
    if (digitsOne.length > digitIndex) {
      currentSum += digitsOne[digitIndex];
    }
    if (digitsTwo.length > digitIndex) {
      currentSum += digitsTwo[digitIndex];
    }
    sumDigits[digitIndex] += currentSum;
  }

  for (let digitIndex = 0; digitIndex < maxLength; digitIndex++) {
    if (sumDigits[digitIndex] >= 10) {
      sumDigits[digitIndex] -= 10;
      sumDigits[digitIndex + 1]++;
    }
  }

  if (sumDigits[sumDigits.length - 1] === 0) {
    sumDigits.pop();
  }

  const resultString = sumDigits.reverse().join('');
  return resultString;
}

const getModule = require;
const outputToConsole = console;
outputToConsole.display = console.log;

const fileSystem = getModule('fs');
const rawData = fileSystem.readFileSync('/dev/stdin', 'utf8');

let inputLines = rawData.trim().split('\n');

while (true) {
  if (inputLines.length === 0) {
    break;
  }

  const parts = inputLines.shift().split(new RegExp('[+=]'));
  let possibleDigits = [];

  for (let digitCandidate = 0; digitCandidate <= 9; digitCandidate++) {
    const operandOne = Number(parts[0].replace(/X/g, digitCandidate));
    const operandTwo = Number(parts[1].replace(/X/g, digitCandidate));
    const expectedResult = parts[2].replace(/X/g, digitCandidate);

    if (massiveSum(operandOne, operandTwo) === expectedResult) {
      possibleDigits.push(digitCandidate);
    }
  }

  outputToConsole.display((possibleDigits.length === 1) ? possibleDigits[0] : "NA");
}