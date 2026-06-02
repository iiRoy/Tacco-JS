'use strict';

function processInput(rawData) {
  const targetNum = Number(rawData.trim());

  const REQUIRED_DIGIT_SEVEN = '7';
  const REQUIRED_DIGIT_FIVE = '5';
  const REQUIRED_DIGIT_THREE = '3';

  const validateDigits = (numStringCandidate) => {
    const hasSeven = numStringCandidate.includes(REQUIRED_DIGIT_SEVEN);
    const hasFive = numStringCandidate.includes(REQUIRED_DIGIT_FIVE);
    const hasThree = numStringCandidate.includes(REQUIRED_DIGIT_THREE);
    return hasSeven && hasFive && hasThree;
  };

  const exploreNumbers = (currentNumberString) => {
    const numericValue = currentNumberString === '' ? 0 : Number(currentNumberString);

    if (currentNumberString === '' || numericValue <= targetNum) {
      let foundCount = 0;

      if (validateDigits(currentNumberString)) {
        foundCount = 1;
      }

      foundCount += exploreNumbers(currentNumberString + REQUIRED_DIGIT_SEVEN);
      foundCount += exploreNumbers(currentNumberString + REQUIRED_DIGIT_FIVE);
      foundCount += exploreNumbers(currentNumberString + REQUIRED_DIGIT_THREE);

      return foundCount;
    } else {
      return 0;
    }
  };

  console.log(exploreNumbers(''));
}

processInput(require('fs').readFileSync('/dev/stdin', 'utf8'));
