let rawDataBuffer = '';
const inputSource = process.stdin;

inputSource.resume();
inputSource.setEncoding('utf-8');

inputSource.on('data', (dataChunk) => {
  rawDataBuffer += dataChunk;
});

inputSource.on('end', () => {
  const processedLines = rawDataBuffer.split('\n');
  
  const [numRowsStr, numColsStr] = processedLines[0].split(' ');
  const numRows = Number(numRowsStr);
  const numCols = Number(numColsStr);

  const columnTotals = new Array(numCols + 1).fill(0);
  
  const resultLines = [];
  const totalLines = processedLines.length;

  const processSingleDataRow = (lineContent, columnCount, currentRunningTotals) => {
    const currentNumbers = lineContent.split(' ').map(Number);
    let rowSum = 0;
    
    for (let colIndex = 0; colIndex < columnCount; colIndex++) {
      const currentVal = currentNumbers[colIndex];
      rowSum += currentVal;
      currentRunningTotals[colIndex] += currentVal;
    }
    
    currentRunningTotals[columnCount] += rowSum; 
    
    currentNumbers.push(rowSum);
    
    return currentNumbers.join(' ');
  };

  for (let lineIndex = 1; lineIndex < totalLines; lineIndex++) {
    const currentLine = processedLines[lineIndex];
    
    const formattedRow = processSingleDataRow(currentLine, numCols, columnTotals);
    resultLines.push(formattedRow);
  }

  resultLines.push(columnTotals.join(' '));
  
  console.log(resultLines.join('\n'));
});
