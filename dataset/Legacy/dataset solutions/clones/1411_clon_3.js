function processInputData(inputLines) {
  let currentLineIdx = 0;

  while (true) {
    const currentLine = inputLines[currentLineIdx];

    if (currentLine === '0 0') {
      break;
    }

    const dimensionStrings = currentLine.split(/\s+/);
    const gridHeight = parseInt(dimensionStrings[0], 10);
    const gridWidth = parseInt(dimensionStrings[1], 10);

    const outputGridLines = [];
    for (let rowIdx = 0; rowIdx < gridHeight; rowIdx++) {
      const currentRowChars = [];
      for (let colIdx = 0; colIdx < gridHeight; colIdx++) {
        const charToPlace = (colIdx + rowIdx) % 2 === 0 ? '#' : '.';
        currentRowChars.push(charToPlace);
      }
      outputGridLines.push(currentRowChars.join('') + '\n');
    }
    
    const finalGridOutput = outputGridLines.join('');
    console.log(finalGridOutput);

    currentLineIdx++;
  }
}

let receivedDataChunks = [];
process.stdin.on('data', function(dataChunk) {
  receivedDataChunks.push(dataChunk);
});

process.stdin.on('end', function() {
  const fullInputString = receivedDataChunks.join('');
  const parsedInputLines = fullInputString.split('\n');
  processInputData(parsedInputLines);
});
