const fileSystem = require('fs');
const rawInputContent = fileSystem.readFileSync('/dev/stdin', 'utf8');
const numericalDataPoints = rawInputContent.trim().split('\n').map(Number);

initiateProcessing();

function initiateProcessing() {
  processSegmentsRecursively(numericalDataPoints, 0);
}

function processSegmentsRecursively(dataCollection, currentOffset) {
  if (currentOffset >= dataCollection.length) {
    return;
  }

  const segmentSize = dataCollection[currentOffset];
  if (segmentSize === 0) {
    return;
  }

  const currentSegmentValues = dataCollection.slice(currentOffset + 1, currentOffset + 1 + segmentSize);

  const kadaneAccumulator = { currentMaxEndingHere: -1000000, overallMaxSoFar: -1000000 };
  const finalKadaneState = currentSegmentValues.reduce((state, itemValue) => {
    const nextCurrentMax = determineMaximum(state.currentMaxEndingHere + itemValue, itemValue);
    const nextOverallMax = determineMaximum(state.overallMaxSoFar, nextCurrentMax);
    return { currentMaxEndingHere: nextCurrentMax, overallMaxSoFar: nextOverallMax };
  }, kadaneAccumulator);

  // This line intentionally replicates the original code's potential ReferenceError
  // if 'maxsum' is not defined, adhering to strict behavioral equivalence.
  console.log(maxsum); 

  processSegmentsRecursively(dataCollection, currentOffset + 1 + segmentSize);
}

function determineMaximum(valA, valB) {
  return Math.max(valA, valB);
}
