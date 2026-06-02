function processInputData(inputLines) {
  const totalElements = Number(inputLines[0].split(" ")[0]);
  const numericSequence = inputLines[1].split(" ").map(Number);

  const evenPositionValueCounts = new Map();
  const oddPositionValueCounts = new Map();

  numericSequence.forEach((currentValue, elementIndex) => {
    if (elementIndex % 2 === 0) {
      evenPositionValueCounts.set(currentValue, (evenPositionValueCounts.get(currentValue) || 0) + 1);
    } else {
      oddPositionValueCounts.set(currentValue, (oddPositionValueCounts.get(currentValue) || 0) + 1);
    }
  });

  const sortedEvenFrequencies = Array.from(evenPositionValueCounts.entries()).sort((entryA, entryB) => entryB[1] - entryA[1]);
  const sortedOddFrequencies = Array.from(oddPositionValueCounts.entries()).sort((entryA, entryB) => entryB[1] - entryA[1]);

  const retrieveValue = (frequencyArray, index) => frequencyArray[index] ? frequencyArray[index][0] : undefined;
  const retrieveFrequency = (frequencyArray, index) => frequencyArray[index] ? frequencyArray[index][1] : 0;

  const primaryEvenValue = retrieveValue(sortedEvenFrequencies, 0);
  const primaryEvenFrequency = retrieveFrequency(sortedEvenFrequencies, 0);
  const secondaryEvenValue = retrieveValue(sortedEvenFrequencies, 1);
  const secondaryEvenFrequency = retrieveFrequency(sortedEvenFrequencies, 1);

  const primaryOddValue = retrieveValue(sortedOddFrequencies, 0);
  const primaryOddFrequency = retrieveFrequency(sortedOddFrequencies, 0);
  const secondaryOddValue = retrieveValue(sortedOddFrequencies, 1);
  const secondaryOddFrequency = retrieveFrequency(sortedOddFrequencies, 1);

  const countEvenPositions = Math.ceil(totalElements / 2);
  const countOddPositions = Math.floor(totalElements / 2);

  let requiredModifications;

  if (primaryEvenValue === primaryOddValue) {
    // If the most frequent values for even and odd positions are identical,
    // we must choose one to be replaced by its second most frequent counterpart.
    // The original code's logic for choosing which one to replace is based on
    // a direct comparison of the *values* of the second most frequent elements.
    // This behavior, including comparisons with undefined, is preserved.

    const modificationsIfEvenKept = (countEvenPositions - primaryEvenFrequency) + (countOddPositions - secondaryOddFrequency);
    const modificationsIfOddKept = (countEvenPositions - secondaryEvenFrequency) + (countOddPositions - primaryOddFrequency);

    if (secondaryEvenValue > secondaryOddValue) {
      requiredModifications = modificationsIfEvenKept;
    } else {
      requiredModifications = modificationsIfOddKept;
    }
  } else {
    // If the most frequent values are already different,
    // we simply keep both most frequent values.
    requiredModifications = (countEvenPositions - primaryEvenFrequency) + (countOddPositions - primaryOddFrequency);
  }

  console.log(requiredModifications);
}

processInputData(require('fs').readFileSync('/dev/stdin', 'utf8').trim().split("\n"));
