let rawInputString = '';

const inputStream = process.stdin;

inputStream.resume();

inputStream.setEncoding('utf-8');

inputStream.on('data', function(dataChunk) {
  rawInputString += dataChunk;
});

inputStream.on('end', function() {
  const parsedLines = rawInputString.split('\n');
  const dimensionsStr = parsedLines[0].split(' ');
  const numRows = parseInt(dimensionsStr[0], 10);
  const numCols = parseInt(dimensionsStr[1], 10);
  
  const matrixA = new Array(numRows);
  let currentRowIndex = 0;
  for (let lineIdx = 1; lineIdx <= numRows; lineIdx++) {
    const currentLineNumbers = parsedLines[lineIdx].split(' ').map(Number);
    matrixA[currentRowIndex] = new Array();
    for (let colIdx = 0; colIdx < numCols; colIdx++) {
      matrixA[currentRowIndex][colIdx] = currentLineNumbers[colIdx];
    }
    currentRowIndex++;
  }

  const vectorB = new Array(numCols);
  let currentVectorElementIndex = 0;
  for (let lineIdx = numRows + 1; lineIdx <= numRows + numCols; lineIdx++) {
    const elementValues = parsedLines[lineIdx].split(' ').map(Number);
    vectorB[currentVectorElementIndex++] = elementValues;
  }

  const resultVector = new Array(numRows);
  for (let r = 0; r < numRows; r++) {
    resultVector[r] = 0;
    for (let c = 0; c < numCols; c++) {
      resultVector[r] += matrixA[r][c] * vectorB[c];
    }
  }
  console.log(resultVector.join('\n'));
});
