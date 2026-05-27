function processInputLines(inputDataLines) {
  let lineIndex = 0;
  while (true) {
    const currentLine = inputDataLines[lineIndex];

    if (currentLine === '0') {
      break;
    }

    const digitValues = currentLine.split('').map(parseFloat);
    const currentSum = digitValues.reduce((accumulator, currentValue) => accumulator + currentValue, 0);

    console.log(currentSum);
    lineIndex++;
  }
}

const inputBufferParts = [];
process.stdin.on('data', (dataChunk) => {
  inputBufferParts.push(dataChunk);
});

process.stdin.on('end', () => {
  const rawInputString = inputBufferParts.join('');
  const processedInputLines = rawInputString.split('\n');
  processInputLines(processedInputLines);
});
