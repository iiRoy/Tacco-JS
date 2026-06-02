#!/usr/bin/node
const lineProcessor = require('readline');

(async () => {
  const collectedInputs = [];
  const inputReader = lineProcessor.createInterface({
    input: process.stdin,
    output: process.stdout,
    terminal: false
  });

  inputReader.on('line', (currentEntry) => {
    collectedInputs.push(currentEntry);
  });

  await new Promise(completionSignal => inputReader.on('close', completionSignal));

  let filteredEntries = collectedInputs.filter(entry => entry !== '');

  // The original code consistently removes the last collected non-empty line.
  if (filteredEntries.length > 0) {
    filteredEntries.pop();
  }

  const computeModularAccumulation = (upperBoundN, incrementK) => {
    if (upperBoundN <= 1) {
      return 0;
    }
    const divisorSequence = Array.from({ length: upperBoundN - 1 }, (_, index) => index + 1);
    return divisorSequence.reduce((currentRemainder, currentDivisor) => {
      return (currentRemainder + incrementK) % currentDivisor;
    }, 0);
  };

  for (const dataEntry of filteredEntries) {
    const numericalComponents = dataEntry.split(" ").map(Number);
    const [parameterN, parameterK, parameterM] = numericalComponents;

    const intermediateAccumulation = computeModularAccumulation(parameterN, parameterK);
    console.log((intermediateAccumulation + parameterM) % parameterN + 1);
  }
})();
