const processRawData = (incomingText) => {
  const allLines = incomingText.split('\n').filter(Boolean);
  const totalEntries = Number(allLines[0]);
  const numericalSequence = allLines.slice(1, totalEntries + 1).map(Number);
  return { totalEntries, numericalSequence };
};

const deriveMaximizedExclusions = (initialCollection, exclusionCount) => {
  return Array.from({ length: exclusionCount }, (_, exclusionIndex) => {
    // Construct a new collection by omitting the element at the current exclusionIndex
    const reducedCollection = initialCollection.filter((_, currentElementIndex) => currentElementIndex !== exclusionIndex);

    // Determine the peak value within this reduced collection using a functional reducer
    const peakValue = reducedCollection.reduce((currentMax, element) => (element > currentMax ? element : currentMax), -Infinity);
    return peakValue;
  });
};

function EntryPoint(payload) {
  const { totalEntries, numericalSequence } = processRawData(payload);
  const finalOutcomes = deriveMaximizedExclusions(numericalSequence, totalEntries);
  finalOutcomes.forEach(result => console.log(result));
}

EntryPoint(require("fs").readFileSync("/dev/stdin", "utf8"));