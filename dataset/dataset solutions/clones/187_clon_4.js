let collectedText = '';

process.stdin.resume();
process.stdin.setEncoding('utf8');
process.stdin.on('data', (dataPiece) => {
  collectedText += dataPiece;
});

process.stdin.on('end', () => {
  const lineSeries = collectedText.split('\n');
  const numericRepresentations = lineSeries
    .filter(segment => segment.trim() !== '')
    .map(segment => parseFloat(segment));

  if (numericRepresentations.length === 0) {
    console.log(-Infinity);
    return;
  }

  const sortedValues = [...numericRepresentations].sort((valA, valB) => valA - valB);

  const minimumValue = sortedValues[0];
  const maximumValue = sortedValues[sortedValues.length - 1];

  console.log(maximumValue - minimumValue);
});