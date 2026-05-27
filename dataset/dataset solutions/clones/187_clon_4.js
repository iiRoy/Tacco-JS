let streamBuffer = '';

function calculateRangeDifference() {
  const numericalValues = streamBuffer
    .split('\n')
    .filter(Boolean)
    .map(parseFloat);

  const rangeExtrema = numericalValues.reduce(
    (accumulator, currentNumericValue) => ({
      lowest: Math.min(accumulator.lowest, currentNumericValue),
      highest: Math.max(accumulator.highest, currentNumericValue),
    }),
    { lowest: Infinity, highest: -Infinity }
  );

  console.log(rangeExtrema.highest - rangeExtrema.lowest);
}

process.stdin.resume();
process.stdin.setEncoding('utf8');
process.stdin.on('data', (chunk) => {
  streamBuffer += chunk;
});
process.stdin.on('end', () => {
  calculateRangeDifference();
});
