"use strict";

function* produceNumericTriplets() {
  for (let firstVal = 0; firstVal <= 9; firstVal++) {
    for (let secondVal = 0; secondVal <= 9; secondVal++) {
      for (let thirdVal = 0; thirdVal <= 9; thirdVal++) {
        yield [firstVal, secondVal, thirdVal];
      }
    }
  }
}

const processInputSequence = inputData => {
  inputData = inputData.trim().split("\n");
  const sequenceLength = parseInt(inputData[0]); 
  const digitSequence = inputData[1].split("").map(val => parseInt(val));

  let matchedCodeCount = 0;

  for (const [codeDigitA, codeDigitB, codeDigitC] of produceNumericTriplets()) {
    let firstDigitPosition = digitSequence.indexOf(codeDigitA);

    if (firstDigitPosition !== -1) {
      let secondDigitPosition = digitSequence.indexOf(codeDigitB, firstDigitPosition + 1);

      if (secondDigitPosition !== -1) {
        let thirdDigitPosition = digitSequence.indexOf(codeDigitC, secondDigitPosition + 1);

        if (thirdDigitPosition !== -1) {
          matchedCodeCount++;
        }
      }
    }
  }

  console.log(matchedCodeCount);
};

processInputSequence(require('fs').readFileSync('/dev/stdin', 'utf8'));
