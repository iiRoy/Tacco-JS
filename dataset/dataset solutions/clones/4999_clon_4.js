function ensureLengthWithPadding(valueString, targetLength) {
  return String(valueString).padStart(targetLength, '0');
}

function processInputData(rawData) {
  const inputLines = rawData.split('\n');
  const [elementCountStr, targetAverageStr] = inputLines[0].split(' ');
  const elementCount = parseInt(elementCountStr);
  const targetAverage = parseInt(targetAverageStr);
  const numericValues = inputLines[1].split(' ').map(Number);

  let validSubsetCount = 0;

  function exploreSubsets(currentElementIndex, accumulatedSum, chosenElementCount) {
    if (currentElementIndex === elementCount) {
      if (chosenElementCount > 0 && accumulatedSum / chosenElementCount === targetAverage) {
        validSubsetCount++;
      }
      return;
    }

    exploreSubsets(currentElementIndex + 1, accumulatedSum, chosenElementCount);

    exploreSubsets(currentElementIndex + 1, accumulatedSum + numericValues[currentElementIndex], chosenElementCount + 1);
  }

  exploreSubsets(0, 0, 0);

  console.log(validSubsetCount);
}

processInputData(require('fs').readFileSync('/dev/stdin', 'UTF-8'));
