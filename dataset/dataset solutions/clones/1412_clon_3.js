function processInputData(inputLines) {
  let currentLineIndex = 0;

  const determineCellPattern = (colPosition, rowPosition) => {
    return (colPosition + rowPosition) % 2 === 0 ? '#' : '.';
  };

  while (true) {
    const currentInputLine = inputLines[currentLineIndex];

    if (currentInputLine === '0 0') {
      break;
    }

    const dimensionParts = currentInputLine.split(/\s+/);

    const gridHeight = parseInt(dimensionParts[0], 10);
    const gridWidth = parseInt(dimensionParts[1], 10);

    const constructedGridLines = Array.from({ length: gridHeight }, (_, rowIndex) => {
      const rowCharacters = Array.from({ length: gridWidth }, (_, colIndex) =>
        determineCellPattern(colIndex, rowIndex)
      );
      return rowCharacters.join('');
    });

    const formattedGridOutput = constructedGridLines.map(row => row + '\n').join('');

    console.log(formattedGridOutput);

    currentLineIndex++;
  }
}

let inputBufferParts = [];

process.stdin.on('data', function(dataChunk) {
  inputBufferParts.push(dataChunk);
});

process.stdin.on('end', function() {
  const allInputContent = inputBufferParts.join('');
  const processedLines = allInputContent.split('\n');
  processInputData(processedLines);
});
