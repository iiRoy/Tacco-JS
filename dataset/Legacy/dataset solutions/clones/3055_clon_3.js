const processInput = (rawData) => {
  const charArray = rawData.trim().split("");

  let mismatchesForPatternA = 0;
  let mismatchesForPatternB = 0;

  const DIGIT_ZERO = 0;
  const DIGIT_ONE = 1;

  for (let idx = 0; idx < charArray.length; idx++) {
    const currentDigit = Number(charArray[idx]);

    const isEvenIndex = (idx % 2 === DIGIT_ZERO);

    const expectedDigitForPatternA = isEvenIndex ? DIGIT_ZERO : DIGIT_ONE;
    const expectedDigitForPatternB = isEvenIndex ? DIGIT_ONE : DIGIT_ZERO;

    if (currentDigit !== expectedDigitForPatternA) {
      mismatchesForPatternA++;
    }

    if (currentDigit !== expectedDigitForPatternB) {
      mismatchesForPatternB++;
    }
  }

  console.log(Math.min(mismatchesForPatternA, mismatchesForPatternB));
};

processInput(require('fs').readFileSync('/dev/stdin', 'UTF-8'));
