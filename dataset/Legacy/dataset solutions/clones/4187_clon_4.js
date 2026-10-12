const processInputAndOutput = (rawText) => {
  const cleanedText = rawText.trim();
  let firstNumStr = '';
  let secondNumStr = '';
  let thirdNumStr = '';
  let currentSegment = 0;

  for (let charIndex = 0; charIndex < cleanedText.length; charIndex++) {
    const currentCharacter = cleanedText[charIndex];
    if (currentCharacter === ' ') {
      currentSegment++;
      while (charIndex + 1 < cleanedText.length && cleanedText[charIndex + 1] === ' ') {
        charIndex++;
      }
    } else {
      if (currentSegment === 0) {
        firstNumStr += currentCharacter;
      } else if (currentSegment === 1) {
        secondNumStr += currentCharacter;
      } else {
        thirdNumStr += currentCharacter;
      }
    }
  }

  const firstOperand = Number(firstNumStr);
  const secondOperand = Number(secondNumStr);
  const thirdValue = Number(thirdNumStr);

  const productResult = firstOperand * secondOperand;
  const finalOutcome = productResult < thirdValue ? productResult : thirdValue;

  console.log(finalOutcome);
};

processInputAndOutput(require('fs').readFileSync('/dev/stdin', 'utf8'));
