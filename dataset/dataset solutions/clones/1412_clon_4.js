let incomingDataChunks = [];

process.stdin.on('data', (dataPiece) => {
  incomingDataChunks.push(dataPiece);
});

process.stdin.on('end', () => {
  let completeInputString = incomingDataChunks.join('');
  let individualLines = completeInputString.split('\n');
  interpretInstructions(individualLines);
});

function interpretInstructions(incomingLines) {
  let terminalIndex = incomingLines.indexOf('0 0');
  let effectiveLines = terminalIndex === -1 ? incomingLines : incomingLines.slice(0, terminalIndex);

  effectiveLines.forEach(currentLine => {
    const numeralStrings = currentLine.split(/\s+/);

    const hDim = parseInt(numeralStrings[0], 10);
    const wDim = parseInt(numeralStrings[1], 10);

    const generatedVisual = produceVisualMatrix(hDim, wDim);
    console.log(generatedVisual);
  });
}

function produceVisualMatrix(verticalExtent, horizontalExtent) {
  const charA = '#';
  const charB = '.';

  const matrixRows = Array.from({ length: verticalExtent }, (_, rIdx) => {
    const rowContent = Array.from({ length: horizontalExtent }, (_, cIdx) => {
      return (rIdx + cIdx) % 2 === 0 ? charA : charB;
    }).join('');
    return rowContent;
  });

  return matrixRows.join('\n') + '\n';
}