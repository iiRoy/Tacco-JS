let collectedNumbers = [];
let inputReader = require('readline').createInterface({
  input: process.stdin,
  output: process.stdout
});

function processNumberSequence(numericSequence) {
  const processedPairs = numericSequence.reduce((accumulator, currentElement, currentIndex, fullArray) => {
    if (currentIndex % 2 === 0) {
      const firstValue = currentElement;
      const secondValue = fullArray[currentIndex + 1];

      if (firstValue === 0 && secondValue === 0) {
        return accumulator;
      }
      accumulator.push({ primary: firstValue, secondary: secondValue });
    }
    return accumulator;
  }, []);

  processedPairs.forEach(pairObject => {
    const smallerValue = Math.min(pairObject.primary, pairObject.secondary);
    const largerValue = Math.max(pairObject.primary, pairObject.secondary);
    console.log(`${smallerValue} ${largerValue}`);
  });
}

inputReader.on('line', function (currentLine) {
  const lineParts = currentLine.split(' ');
  const numA = parseInt(lineParts[0], 10);
  const numB = parseInt(lineParts[1], 10);

  collectedNumbers.push(numA);
  collectedNumbers.push(numB);

  if (numA === 0 && numB === 0) {
    processNumberSequence(collectedNumbers);
  }
});

process.stdin.on('end', function () {
  // No action needed here as processing is triggered by '0 0' sentinel
});
