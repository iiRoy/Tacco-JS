let inputBuffer = '';
const dataStream = process.stdin;

const SPACE_DELIMITER = ' ';
const NEWLINE_DELIMITER = '\n';

const parseLineToNumbers = (lineString) => {
  return lineString.split(SPACE_DELIMITER).map(Number);
};

dataStream.resume();
dataStream.setEncoding('utf-8');

dataStream.on('data', (receivedChunk) => {
  inputBuffer += receivedChunk;
});

dataStream.on('end', () => {
  const inputLines = inputBuffer.split(NEWLINE_DELIMITER);

  const dimensionsString = inputLines[0];
  const dimensionsArray = parseLineToNumbers(dimensionsString);

  const numRows = dimensionsArray[0];
  const numCols = dimensionsArray[1];

  const columnTotals = Array.from({ length: numCols + 1 }, () => 0);

  const formattedOutputLines = [];

  const finalColumnForSumsIndex = numCols;

  for (let lineIndex = 1; lineIndex < inputLines.length; lineIndex++) {
    const currentLineString = inputLines[lineIndex];

    const currentLineValues = parseLineToNumbers(currentLineString);

    let currentRowSum = 0;

    for (let colIdx = 0; colIdx < numCols; colIdx++) {
      currentRowSum = currentRowSum + currentLineValues[colIdx];
      columnTotals[colIdx] = columnTotals[colIdx] + currentLineValues[colIdx];
    }

    columnTotals[finalColumnForSumsIndex] = columnTotals[finalColumnForSumsIndex] + currentRowSum;

    const lineValuesWithSum = [...currentLineValues, currentRowSum];

    formattedOutputLines.push(lineValuesWithSum.join(SPACE_DELIMITER));
  }

  formattedOutputLines.push(columnTotals.join(SPACE_DELIMITER));

  console.log(formattedOutputLines.join(NEWLINE_DELIMITER));
});
