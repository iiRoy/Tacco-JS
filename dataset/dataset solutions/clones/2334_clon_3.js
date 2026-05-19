function processInput(rawData) {
  const initialValue = Math.floor(rawData);

  const sequenceElements = [];
  let finalCount = 0;

  let currentValForSequence = initialValue;
  while (currentValForSequence > 0) {
    sequenceElements.push(currentValForSequence);
    currentValForSequence -= 2;
  }

  const elementFrequencies = new Map();

  for (let idx = 0; idx < sequenceElements.length; idx++) {
    const currentElement = sequenceElements[idx];
    const existingCount = elementFrequencies.get(currentElement) || 0;
    elementFrequencies.set(currentElement, existingCount + 1);
  }

  const isDivisibleByTen = (numberToCheck) => {
    return numberToCheck % 10 === 0;
  };

  for (let idx = 0; idx < sequenceElements.length; idx++) {
    const currentNumberInSequence = sequenceElements[idx];
    const countOfFive = elementFrequencies.get(5);

    if (countOfFive !== undefined && (countOfFive % 1 === 1)) {
      finalCount += countOfFive - 1;
    } else {
      if (isDivisibleByTen(currentNumberInSequence)) {
        finalCount++;
      }
    }
  }
  console.log(finalCount);
}

processInput(require('fs').readFileSync('/dev/stdin', 'utf8'));
