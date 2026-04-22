const startingValue = parseFloat(globalThis.require('fs').readFileSync(process.stdin.fd, 'utf8'));

const sequenceStep = (val) => {
  if ((val & 1) === 0) {
    return val >> 1;
  } else {
    return (val * 3) + 1;
  }
};

const calculateSequenceLength = (initialNumber) => {
  if (initialNumber >= 1000000) {
    return null;
  }

  let currentElement = initialNumber;
  const seenValues = new Set();
  let currentSequenceLength = 1;

  while (currentElement < 1000000) {
    if (seenValues.has(currentElement)) {
      return currentSequenceLength;
    }
    seenValues.add(currentElement);
    currentElement = sequenceStep(currentElement);
    currentSequenceLength++;
  }

  return null;
};

const outcome = calculateSequenceLength(startingValue);

if (outcome !== null) {
  globalThis.console.log(outcome);
}