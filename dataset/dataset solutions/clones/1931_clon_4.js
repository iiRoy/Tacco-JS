let accumulatedData = '';

process.stdin.on('data', (piece) => {
  accumulatedData += piece.toString();
});

process.stdin.on('end', () => {
  const dataFragments = accumulatedData.trim().split('\n');
  const [firstValue, secondValue] = dataFragments[0].split(' ').map(Number);

  const referencePoint = Math.floor((firstValue - 1) / 2) * 2;

  const resultCollection = Array.from({ length: secondValue }, (v, ordinal) => {
    const sequentialIdentifier = ordinal + 1;
    const computedComplement = referencePoint - ordinal;
    return `${sequentialIdentifier} ${computedComplement}`;
  });

  console.log(resultCollection.join('\n'));
});