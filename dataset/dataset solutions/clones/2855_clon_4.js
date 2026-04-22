let inputBuffer = '';

process.stdin.on('data', (inputChunk) => {
  inputBuffer += inputChunk.toString('utf8');
});

process.stdin.on('end', () => {
  const parsedValues = inputBuffer
    .trim()
    .split(' ')
    .map(Number);

  const smallestPairObject = parsedValues.reduce((accumulatorObject, currentNumericValue) => {
    if (currentNumericValue < accumulatorObject.primaryMinimum) {
      accumulatorObject.secondaryMinimum = accumulatorObject.primaryMinimum;
      accumulatorObject.primaryMinimum = currentNumericValue;
    } else if (currentNumericValue < accumulatorObject.secondaryMinimum) {
      accumulatorObject.secondaryMinimum = currentNumericValue;
    }
    return accumulatorObject;
  }, { primaryMinimum: Number.POSITIVE_INFINITY, secondaryMinimum: Number.POSITIVE_INFINITY });

  const finalSum = smallestPairObject.primaryMinimum + smallestPairObject.secondaryMinimum;
  process.stdout.write(finalSum.toString() + '\n');
});