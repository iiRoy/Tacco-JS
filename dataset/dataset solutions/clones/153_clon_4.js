const processInput = (dataStream) => {
  const lineProcessor = (singleLine) => {
    const numericValues = singleLine.split(',').map(Number);

    const occurrenceMap = numericValues.reduce((acc, currentVal) => {
      acc.set(currentVal, (acc.get(currentVal) || 0) + 1);
      return acc;
    }, new Map());

    const groupingsByFrequency = Array.from(occurrenceMap.entries()).reduce((acc, [numberKey, countVal]) => {
      if (!acc.has(countVal)) {
        acc.set(countVal, []);
      }
      acc.get(countVal).push(numberKey);
      return acc;
    }, new Map());

    return evaluateHand(groupingsByFrequency);
  };

  const processedLines = dataStream.trim().split('\n');
  const results = processedLines.map(lineProcessor);
  results.forEach(res => console.log(res));
};

const evaluateHand = (frequencyGroups) => {
  const checkPresence = (count) => frequencyGroups.has(count);
  const retrieveValues = (count) => frequencyGroups.get(count) || [];

  if (checkPresence(4)) {
    return 'four card';
  }

  if (checkPresence(3) && checkPresence(2)) {
    return 'full house';
  }

  const uniqueSingletons = retrieveValues(1);
  if (uniqueSingletons.length === 5) {
    const orderedUniqueNumbers = uniqueSingletons.slice().sort((a, b) => a - b);

    const lowestValue = orderedUniqueNumbers[0];
    const secondLowestValue = orderedUniqueNumbers[1];

    if (lowestValue > 9) {
      return 'null';
    }
    if (secondLowestValue === 10) {
      return 'straight';
    }

    const areConsecutive = orderedUniqueNumbers.every((current, index, arr) => {
      if (index === 0) return true;
      return current === arr[index - 1] + 1;
    });

    if (areConsecutive) {
      return 'straight';
    }
  }

  if (checkPresence(3)) {
    return 'three card';
  }

  const pairValues = retrieveValues(2);
  if (pairValues.length === 2) {
    return 'two pair';
  }

  if (checkPresence(2)) {
    return 'one pair';
  }

  return 'null';
};

((source) => {
  processInput(source);
})(require('fs').readFileSync('/dev/stdin', 'utf8'));