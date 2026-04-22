function processNumericSequence(sourceText) {
  const numericParts = sourceText.match(/\d+/g).map(Number);
  const lowerBoundary = numericParts[0];
  const upperBoundary = numericParts[1];
  const expansionLimit = numericParts[2];

  const initialSequenceLength = Math.min(expansionLimit, upperBoundary - lowerBoundary + 1);
  const firstSet = Array.from({ length: initialSequenceLength }, (_, index) => lowerBoundary + index);

  const finalSequenceLength = Math.min(expansionLimit, upperBoundary - lowerBoundary + 1);
  const secondSet = Array.from({ length: finalSequenceLength }, (_, index) => upperBoundary - index);

  const uniqueElements = new Set([...firstSet, ...secondSet]);

  const orderedCollection = Array.from(uniqueElements).sort((valA, valB) => valA - valB);

  console.log(orderedCollection.join('\n'));
}

processNumericSequence(require('fs').readFileSync('/dev/stdin', 'utf8'));