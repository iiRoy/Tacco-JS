function arrangeByFrequency(sourceValues, maxValueLimit) {
  const tally = new Map();

  sourceValues.forEach(val => {
    tally.set(val, (tally.get(val) || 0) + 1);
  });

  const finalSequence = [];

  for (let currentVal = 0; currentVal <= maxValueLimit; currentVal++) {
    const count = tally.get(currentVal);
    if (count > 0) {
      finalSequence.push(...Array(count).fill(currentVal));
    }
  }

  return finalSequence;
}

function processAndOutputResults(rawText) {
  const numericPayload = rawText.match(/\d+/g).map(Number);

  const dataQuantity = numericPayload[0];
  const inputElements = numericPayload.slice(1, -1);

  const sortedOrder = arrangeByFrequency(inputElements, 109);

  const midpointValueIndex = Math.floor(dataQuantity / 2);
  const decisionThreshold = sortedOrder[midpointValueIndex];

  const alternativeIndex = (dataQuantity / 2 - 1) | 0; // Replicates `~~` behavior for negative results
  const alternativeOutcome = sortedOrder[alternativeIndex];

  inputElements.map(originalElement => {
    return originalElement < decisionThreshold ? decisionThreshold : alternativeOutcome;
  }).forEach(valueToPrint => console.log(valueToPrint));
}

processAndOutputResults(require('fs').readFileSync('/dev/stdin', 'utf8'));