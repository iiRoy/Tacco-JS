const inputLineReader = require('readline').createInterface({
  input: process.stdin,
  output: process.stdout,
  terminal: false
});

let accumulatedInput = [];
inputLineReader.on('line', (individualEntry) => {
  accumulatedInput.push(individualEntry);
});

inputLineReader.on('close', () => {
  processDataSegments(accumulatedInput, 0);
});

function processDataSegments(allEntries, currentOffset) {
  const numberOfElements = parseInt(allEntries[currentOffset], 10);

  if (numberOfElements === 0) {
    return;
  }

  const valueString = allEntries[currentOffset + 1];
  const numericalSeries = valueString.split(/\s+/).map(Number);

  const { totalSummation, totalSquareSummation } = numericalSeries.reduce(
    (accumulator, presentValue) => ({
      totalSummation: accumulator.totalSummation + presentValue,
      totalSquareSummation: accumulator.totalSquareSummation + (presentValue * presentValue)
    }),
    { totalSummation: 0, totalSquareSummation: 0 }
  );

  const seriesSize = numericalSeries.length;
  const meanValue = totalSummation / seriesSize;
  const meanOfSquares = totalSquareSummation / seriesSize;
  const spreadMeasure = meanOfSquares - (meanValue * meanValue);

  const dispersionCoefficient = Math.sqrt(spreadMeasure);

  console.log(dispersionCoefficient.toFixed(6));

  processDataSegments(allEntries, currentOffset + 2);
}