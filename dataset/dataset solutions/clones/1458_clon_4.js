function processInputBlocks(inputSegments) {
  let segmentCursor = 0;

  while (true) {
    const currentCount = parseInt(inputSegments[segmentCursor++], 10);
    if (currentCount === 0) {
      break;
    }

    const numericalData = inputSegments[segmentCursor++].split(/\s+/).map(parseFloat);
    const dataLength = numericalData.length;

    const aggregateStats = numericalData.reduce((accumulator, value) => {
      accumulator.sumOfValues += value;
      accumulator.sumOfSquaredValues += value * value;
      return accumulator;
    }, { sumOfValues: 0, sumOfSquaredValues: 0 });

    const meanValue = aggregateStats.sumOfValues / dataLength;
    const meanOfSquares = aggregateStats.sumOfSquaredValues / dataLength;

    const dataDispersion = meanOfSquares - (meanValue * meanValue);
    const finalDeviation = Math.sqrt(dataDispersion);

    console.log(finalDeviation.toFixed(6));
  }
}

const inputParts = [];
process.stdin.on('data', (dataChunk) => {
  inputParts.push(dataChunk);
});
process.stdin.on('end', () => {
  const allLines = inputParts.join('').split('\n');
  processInputBlocks(allLines);
});
