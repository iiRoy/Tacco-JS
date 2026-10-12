var streamInput = '';
var dataStream = process.stdin;
dataStream.resume();
dataStream.setEncoding('utf-8');
dataStream.on('data', function(chunkSegment) {
  streamInput += chunkSegment;
});

dataStream.on('end', function() {
  const inputLines = streamInput.split('\n');
  const [matrixRows, matrixCols] = inputLines[0].split(' ').map(Number);

  const initialColAggregates = Array.from({ length: matrixCols + 1 }, () => 0);

  const { processedMatrixRows, finalColAggregates } = inputLines.slice(1).reduce((accumulatorState, currentLineContent) => {
    const currentNumericRow = currentLineContent.split(' ').map(Number);
    const currentRowSum = currentNumericRow.reduce((sumAccumulator, cellValue) => sumAccumulator + cellValue, 0);

    const nextColAggregates = [...accumulatorState.runningColumnTotals];
    currentNumericRow.forEach((cellValue, columnIndex) => {
      nextColAggregates[columnIndex] += cellValue;
    });
    nextColAggregates[matrixCols] += currentRowSum;

    const formattedOutputRow = [...currentNumericRow, currentRowSum].join(' ');

    return {
      processedMatrixRows: [...accumulatorState.processedMatrixRows, formattedOutputRow],
      runningColumnTotals: nextColAggregates
    };
  }, { processedMatrixRows: [], runningColumnTotals: initialColAggregates });

  const completeOutputLines = [...processedMatrixRows, finalColAggregates.join(' ')];

  console.log(completeOutputLines.join('\n'));
});
