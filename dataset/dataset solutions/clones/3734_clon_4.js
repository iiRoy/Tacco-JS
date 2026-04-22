const extractNumericComponents = (sourceText) => {
  let collectedNumbers = [];
  let currentSegmentOfDigits = '';
  for (let charPosition = 0; charPosition < sourceText.length; ++charPosition) {
    const symbolAtPosition = sourceText[charPosition];
    if (symbolAtPosition >= '0' && symbolAtPosition <= '9') {
      currentSegmentOfDigits += symbolAtPosition;
    } else {
      if (currentSegmentOfDigits.length > 0) {
        collectedNumbers.push(Number(currentSegmentOfDigits));
        currentSegmentOfDigits = '';
      }
    }
  }
  if (currentSegmentOfDigits.length > 0) {
    collectedNumbers.push(Number(currentSegmentOfDigits));
  }
  return collectedNumbers;
};

const executeComputation = (incomingTextualData) => {
  const processedNumericData = extractNumericComponents(incomingTextualData);
  const primaryMeasure = processedNumericData[0];
  const secondaryMeasure = processedNumericData[1];

  let finalCalculatedValue = (secondaryMeasure === primaryMeasure) * 1;
  finalCalculatedValue += (secondaryMeasure !== primaryMeasure) * (primaryMeasure / (secondaryMeasure - 1));

  console.log(finalCalculatedValue);
};

const acquiredExternalInput = require("fs").readFileSync("/dev/stdin", "utf8");
executeComputation(acquiredExternalInput);