function processInput(rawData) {
  const parsedLines = rawData.split('\n');
  const numericSequence = parsedLines[1].split(' ').map(Number);

  const nonDivisibleElements = numericSequence.filter((currentValue, currentIndex, fullSequence) => {
    const isDivisibleByAnother = fullSequence.some((otherValue, otherIndex) => {
      return currentIndex !== otherIndex && currentValue % otherValue === 0;
    });
    return !isDivisibleByAnother;
  });

  console.log(nonDivisibleElements.length);
}

processInput(require('fs').readFileSync('/dev/stdin', 'utf8'));
