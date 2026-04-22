const fullCircleDegrees = 360;

function calculateWholeParts(dividendValue, divisorValue) {
  if (divisorValue === 0) {
    return Infinity;
  }
  if (Number.isNaN(divisorValue)) {
    return NaN;
  }

  let partsCounter = 0;
  let currentRemainder = dividendValue;

  while (currentRemainder >= divisorValue) {
    currentRemainder -= divisorValue;
    partsCounter++;
  }
  return partsCounter;
}

function processIncomingData(streamContent) {
  const numericValue = Number(streamContent);
  const outcome = calculateWholeParts(fullCircleDegrees, numericValue);
  process.stdout.write(String(outcome) + '\n');
}

let accumulatedStream = '';
process.stdin.setEncoding('utf8');

process.stdin.on('data', (dataChunk) => {
  accumulatedStream += dataChunk;
});

process.stdin.on('end', () => {
  const cleanedInput = accumulatedStream.trim();
  processIncomingData(cleanedInput);
});