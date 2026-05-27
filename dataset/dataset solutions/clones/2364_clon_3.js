function processInput(inputString) {
  const lineSegments = inputString.split(/\r\n|\r|\n/);

  const parsedNumericMatrix = lineSegments.map(currentLine => {
    const numericElements = currentLine.split(' ').map(Number);
    return numericElements;
  });

  const secondRowData = parsedNumericMatrix[1];
  const specificElementValue = secondRowData[1];

  const resultToLog = (specificElementValue === 1) ? 1 : 0;
  console.log(resultToLog);
}
