((inputData) => {
  const lineSegments = inputData.trim().split('\n');
  const elementCount = parseInt(lineSegments[0].split(' ')[0], 10);
  const sourceNumbers = lineSegments[1].split(' ').map(Number);

  const occurrenceTracker = new Map();
  let greatestValue = 0;
  for (const numValue of sourceNumbers) {
    occurrenceTracker.set(numValue, (occurrenceTracker.get(numValue) || 0) + 1);
    if (numValue > greatestValue) {
      greatestValue = numValue;
    }
  }

  const distinctSortedValues = Array.from(occurrenceTracker.keys()).sort((a, b) => a - b);

  let finalResult = 0;
  const markedMultiples = new Set();

  for (const currentElement of distinctSortedValues) {
    if (markedMultiples.has(currentElement)) {
      continue;
    }

    if (occurrenceTracker.get(currentElement) === 1) {
      finalResult++;
    }

    for (let multiplier = currentElement; multiplier <= greatestValue; multiplier += currentElement) {
      markedMultiples.add(multiplier);
    }
  }

  return `${finalResult}`;
})(require('fs').readFileSync('/dev/stdin', 'utf8'));
