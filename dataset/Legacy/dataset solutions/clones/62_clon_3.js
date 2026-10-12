const convertToReversedDigitArray = (numString) => {
  return numString.split('').map(Number).reverse();
};

const propagateCarriesInPlace = (digitArray) => {
  for (let k = 0; k < digitArray.length - 1; k++) {
    if (digitArray[k] >= 10) {
      const carryValue = Math.floor(digitArray[k] / 10);
      digitArray[k] %= 10;
      digitArray[k + 1] += carryValue;
    }
  }
  return digitArray;
};

const addLargeNumbers = (firstNumStr, secondNumStr) => {
  let longDigits, shortDigits;

  const digitsA = convertToReversedDigitArray(firstNumStr);
  const digitsB = convertToReversedDigitArray(secondNumStr);

  if (digitsA.length >= digitsB.length) {
    longDigits = digitsA;
    shortDigits = digitsB;
  } else {
    longDigits = digitsB;
    shortDigits = digitsA;
  }

  for (let idx = 0; idx < shortDigits.length; idx++) {
    longDigits[idx] += shortDigits[idx];
  }

  const finalDigits = propagateCarriesInPlace(longDigits);

  return finalDigits.reverse().join('');
};

(function() {
  const rawInputData = require('fs').readFileSync('/dev/stdin', 'utf8');

  const inputLines = rawInputData.replace(/\n$/, '').split('\n');

  const _numberOfCases = inputLines.shift();

  while (inputLines.length > 0) {
    const currentFirstNum = inputLines.shift();
    const currentSecondNum = inputLines.shift();

    const sumResult = addLargeNumbers(currentFirstNum, currentSecondNum);

    if (sumResult.length >= 80) {
      console.log('overflow');
    } else {
      console.log('%s', sumResult);
    }
  }
})();
