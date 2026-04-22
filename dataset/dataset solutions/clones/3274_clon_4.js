process.stdin.setEncoding('utf8');

let receivedInput = '';

process.stdin.on('data', (dataFragment) => {
  receivedInput += dataFragment;
});

process.stdin.on('end', () => {
  const textLines = receivedInput.trim().split('\n');

  const totalElements = parseInt(textLines[0], 10);
  const mainValues = textLines[1].split(/\s/).map(Number);
  const comparisonValues = textLines[2].split(/\s/).map(Number);

  const sumOfMain = mainValues.reduce((agg, current) => agg + current, 0);
  const sumOfComparison = comparisonValues.reduce((agg, current) => agg + current, 0);

  if (sumOfMain < sumOfComparison) {
    console.log(-1);
    return;
  }

  const analysisResult = mainValues.reduce((accumulator, primaryVal, elementIndex) => {
    const differential = primaryVal - comparisonValues[elementIndex];
    if (differential <= 0) {
      accumulator.mandatoryContributions++;
      accumulator.cumulativeDeficit += differential;
    } else {
      accumulator.potentialOffsets.push(differential);
    }
    return accumulator;
  }, {
    mandatoryContributions: 0,
    cumulativeDeficit: 0,
    potentialOffsets: []
  });

  analysisResult.potentialOffsets.sort((valA, valB) => valB - valA);

  const determineOffsetCount = (currentDeficitState, availableOffsets, offsetTally = 0) => {
    if (currentDeficitState >= 0) {
      return offsetTally;
    }
    if (availableOffsets.length === 0) {
      return offsetTally;
    }

    const nextOffset = availableOffsets[0];
    const remainingOffsets = availableOffsets.slice(1);

    return determineOffsetCount(currentDeficitState + nextOffset, remainingOffsets, offsetTally + 1);
  };

  const supplementaryOffsets = determineOffsetCount(analysisResult.cumulativeDeficit, analysisResult.potentialOffsets);

  console.log(analysisResult.mandatoryContributions + supplementaryOffsets);
});