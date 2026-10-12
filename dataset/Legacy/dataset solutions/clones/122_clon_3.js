const fileSystemModule = require('fs');

const rawInputContent = fileSystemModule.readFileSync(process.stdin.fd, 'utf8');
const inputLines = rawInputContent.trim().split('\n');

processInputData();

function processInputData() {
  const terminationSignal = '0 0';

  for (let lineIndex = 0; lineIndex < inputLines.length; ++lineIndex) {
    const currentLine = inputLines[lineIndex];

    if (currentLine === terminationSignal) {
      break;
    }

    const lineParts = currentLine.split(' ');
    const numDigits = parseInt(lineParts[0], 10);
    const targetSum = parseInt(lineParts[1], 10);

    let combinationCount = 0;

    for (let firstDigit = 9; firstDigit >= numDigits; --firstDigit) {
      const remainingSumForCall = targetSum - firstDigit;
      const remainingDigitsForCall = numDigits - 1;

      combinationCount += calculateCombinations(firstDigit, remainingSumForCall, remainingDigitsForCall);
    }
    console.log(combinationCount);
  }
}

function calculateCombinations(currentMaxDigit, remainingSum, remainingDigits) {
  if (remainingDigits === 0) {
    return remainingSum === 0 ? 1 : 0;
  }

  if (currentMaxDigit < 0 || remainingSum < 0 || remainingDigits < 0) {
    return 0;
  }

  let currentCombinations = 0;
  const minPossibleNextDigit = remainingDigits - 1;

  for (let nextDigit = currentMaxDigit - 1; nextDigit >= minPossibleNextDigit; --nextDigit) {
    const newRemainingSum = remainingSum - nextDigit;
    const newRemainingDigits = remainingDigits - 1;

    currentCombinations += calculateCombinations(nextDigit, newRemainingSum, newRemainingDigits);
  }

  return currentCombinations;
}
