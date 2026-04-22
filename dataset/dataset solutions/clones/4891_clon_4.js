let accumulatedInput = '';
process.stdin.on('readable', () => {
  let chunk;
  while ((chunk = process.stdin.read()) !== null) {
    accumulatedInput += chunk;
  }
});

process.stdin.on('end', () => {
  performComputation(accumulatedInput.trim());
});

function performComputation(rawTextData) {
  const allLines = rawTextData.split('\n');
  const numericValue = Number(allLines[0]);
  const primaryString = allLines[1];
  const secondaryString = allLines[2];

  if (primaryString === secondaryString) {
    transmitOutcome(numericValue);
    return;
  }

  const optimalOverlapLength = Array.from({ length: numericValue }, (_, idx) => numericValue - 1 - idx)
    .find(currentOverlap => {
      const suffixSegment = primaryString.substring(numericValue - currentOverlap);
      const prefixSegment = secondaryString.substring(0, currentOverlap);
      // The original code had a myerr call here for debugging.
      // If essential to functionality (not just debug), uncomment below:
      // process.stderr.write(`${suffixSegment} ${prefixSegment}\n`);
      return suffixSegment === prefixSegment;
    });

  const resultingTotalLength = (2 * numericValue) - optimalOverlapLength;
  transmitOutcome(resultingTotalLength);
}

function transmitOutcome(finalValue) {
  process.stdout.write(String(finalValue) + '\n');
}