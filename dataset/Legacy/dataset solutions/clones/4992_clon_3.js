function parseNumericLines(sourceText) {
  const cleanedText = sourceText.trim();
  const lineSegments = cleanedText.split('\n');
  const parsedNumbers = lineSegments.map(Number);
  return parsedNumbers;
}

function computeConditionalValue(paramA, paramB, paramC, paramD) {
  const baseCalculation = paramB * paramC;
  if (paramA > paramB) {
    const additionalTerm = (paramA - paramB) * paramD;
    return baseCalculation + additionalTerm;
  } else {
    return baseCalculation;
  }
}

function processInputData(rawData) {
  const numericInputs = parseNumericLines(rawData);

  const firstValue = numericInputs[0];
  const secondValue = numericInputs[1];
  const thirdValue = numericInputs[2];
  const fourthValue = numericInputs[3];

  const finalResult = computeConditionalValue(firstValue, secondValue, thirdValue, fourthValue);
  console.log(finalResult);
}

processInputData(require('fs').readFileSync('/dev/stdin', 'utf8'));
