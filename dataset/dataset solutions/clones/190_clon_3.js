let accumulatorValue = 'A';
const inputDelimiter = ',';

process.stdin.resume();
process.stdin.setEncoding('utf8');

process.stdin.on('data', function(receivedData) {
  const dataParts = receivedData.split(inputDelimiter);

  const firstSegment = dataParts[0];
  const secondSegment = dataParts[1];

  let potentialNewValue = null;

  if (firstSegment === accumulatorValue) {
    potentialNewValue = secondSegment;
  } else if (secondSegment === accumulatorValue) {
    potentialNewValue = firstSegment;
  }

  if (potentialNewValue !== null) {
    accumulatorValue = potentialNewValue;
  }
});

process.stdin.on('end', function() {
  console.log(accumulatorValue);
});
