var inputBuffer = '';
var streamReader = process.stdin;
streamReader.resume();
streamReader.setEncoding('utf-8');
streamReader.on('data', function(chunk) {
  inputBuffer += chunk;
});

streamReader.on('end', function() {
  const allLines = inputBuffer.split('\n');
  const [gridRows, gridCols] = allLines[0].split(' ').map(Number);

  const numericMatrix = allLines.slice(1).map(line => line.split(' ').map(Number));

  const rowsWithSums = numericMatrix.map(row => {
    const currentSum = row.reduce((accumulator, value) => accumulator + value, 0);
    return [...row, currentSum];
  });

  const aggregatedColumnTotals = rowsWithSums.reduce((columnAccumulators, currentRowData) => {
    currentRowData.forEach((cellValue, columnIndex) => {
      columnAccumulators[columnIndex] = (columnAccumulators[columnIndex] || 0) + cellValue;
    });
    return columnAccumulators;
  }, Array(gridCols + 1).fill(0));

  const formattedOutputRows = rowsWithSums.map(row => row.join(' '));
  const formattedTotalRow = aggregatedColumnTotals.join(' ');

  console.log([...formattedOutputRows, formattedTotalRow].join('\n'));
});
