let rawDataBuffer = '';

const inputStream = process.stdin;

inputStream.resume();

inputStream.setEncoding('utf-8');

inputStream.on('data', function(dataFragment) {
  rawDataBuffer += dataFragment;
});

inputStream.on('end', function() {
  const processedLines = rawDataBuffer.split('\n');
  const lineCount = processedLines.length;

  if (lineCount === 0 || processedLines[0].trim() === '') {
    console.error("Error: No input data provided or first line is empty.");
    return;
  }

  const dimensionStrings = processedLines[0].split(' ');
  if (dimensionStrings.length < 2) {
    console.error("Error: Invalid dimension format. Expected 'R C'.");
    return;
  }

  const numRows = Number(dimensionStrings[0]);
  const numCols = Number(dimensionStrings[1]);

  if (isNaN(numRows) || isNaN(numCols) || numRows < 1 || numCols < 1) {
    console.error(`Error: Invalid dimensions provided: Rows=${numRows}, Cols=${numCols}. Must be positive integers.`);
    return;
  }

  const initialAggregateValue = 0;
  const columnAggregates = new Array(numCols + 1).fill(initialAggregateValue);

  const resultLines = [];

  const processMatrixRow = (rowString, expectedCols, colAggregatesRef) => {
    const stringValues = rowString.split(' ');
    const numericValues = stringValues.filter(s => s !== '').map(Number);

    if (numericValues.length < expectedCols || numericValues.some(isNaN)) {
      console.warn(`Warning: Skipping malformed row: '${rowString}'. Expected ${expectedCols} numbers.`);
      return null;
    }

    let currentRowSum = 0;
    const processedRow = [];

    for (let colIndex = 0; colIndex < expectedCols; ++colIndex) {
      const cellValue = numericValues[colIndex];
      currentRowSum += cellValue;
      colAggregatesRef[colIndex] += cellValue;
      processedRow.push(cellValue);
    }

    colAggregatesRef[expectedCols] += currentRowSum;
    processedRow.push(currentRowSum);

    return processedRow.join(' ');
  };

  for (let currentLineIdx = 1; currentLineIdx < lineCount; ++currentLineIdx) {
    const rawRowLine = processedLines[currentLineIdx].trim();

    if (rawRowLine === '') {
      continue;
    }

    const processedRowOutput = processMatrixRow(rawRowLine, numCols, columnAggregates);

    if (processedRowOutput !== null) {
      resultLines.push(processedRowOutput);
    }
  }

  resultLines.push(columnAggregates.join(' '));

  console.log(resultLines.join('\n'));
});