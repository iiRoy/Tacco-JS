var rawInputBuffer = '';
var inputStream = process.stdin;
inputStream.resume();
inputStream.setEncoding('utf-8');

inputStream.on('data', function(chunk) {
  rawInputBuffer += chunk;
});

inputStream.on('end', function() {
  var allInputLines = rawInputBuffer.split('\n');
  
  var gridDimensions = allInputLines[0].split(' ').map(Number);
  var columnCount = gridDimensions[1];

  var numericDataRows = allInputLines.slice(1).map(function(line) {
    return line.split(' ').map(Number);
  });

  var processedOutputLines = [];

  var rowsWithSums = numericDataRows.map(function(currentRow) {
    var rowTotal = currentRow.reduce(function(accumulator, currentValue) {
      return accumulator + currentValue;
    }, 0);
    return [...currentRow, rowTotal];
  });

  var initialColumnAggregates = Array.from({ length: columnCount }, function() { return 0; });

  var finalColumnAggregates = numericDataRows.reduce(function(accumulator, currentRow) {
    return Array.from({ length: columnCount }, function(_, columnIndex) {
      return accumulator[columnIndex] + currentRow[columnIndex];
    });
  }, initialColumnAggregates);

  var overallGrandTotal = finalColumnAggregates.reduce(function(accumulator, value) {
    return accumulator + value;
  }, 0);

  rowsWithSums.forEach(function(row) {
    processedOutputLines.push(row.join(' '));
  });

  var summaryLine = [...finalColumnAggregates, overallGrandTotal].join(' ');
  processedOutputLines.push(summaryLine);

  console.log(processedOutputLines.join('\n'));
});
