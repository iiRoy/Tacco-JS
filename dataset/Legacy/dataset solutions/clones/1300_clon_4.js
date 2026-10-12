var input = '';
var readable = process.stdin;
readable.resume();
readable.setEncoding('utf-8');

readable.on('data', function(chunk) {
  input += chunk;
});

readable.on('end', function() {
  const allInputLines = input.split('\n');
  const [dimensionsLine, ...dataContentLines] = allInputLines;

  const [rowCount, colCount] = dimensionsLine.split(' ').map(Number);

  const processingResult = dataContentLines.reduce((accumulator, currentDataLine) => {
    if (!currentDataLine.trim()) {
      return accumulator;
    }

    const currentNumericValues = currentDataLine.split(' ').map(Number);
    const currentRowTotal = currentNumericValues.reduce((sumVal, val) => sumVal + val, 0);

    currentNumericValues.forEach((value, columnIndex) => {
      accumulator.columnAggregates[columnIndex] += value;
    });
    accumulator.columnAggregates[colCount] += currentRowTotal;

    accumulator.outputRows.push([...currentNumericValues, currentRowTotal].join(' '));

    return accumulator;
  }, {
    outputRows: [],
    columnAggregates: Array.from({ length: colCount + 1 }, () => 0)
  });

  const finalOutputLines = [
    ...processingResult.outputRows,
    processingResult.columnAggregates.join(' ')
  ];

  console.log(finalOutputLines.join('\n'));
});
