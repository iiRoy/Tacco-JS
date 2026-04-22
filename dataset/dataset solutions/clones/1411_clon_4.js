const inputBuffer = [];
process.stdin.on('data', (dataPiece) => {
  inputBuffer.push(dataPiece);
});

process.stdin.on('end', () => {
  const allText = Buffer.concat(inputBuffer).toString();
  const rawSegments = allText.split('\n').filter(Boolean);

  const buildAndDisplayGrids = (segmentIndex) => {
    if (segmentIndex >= rawSegments.length) {
      return;
    }

    const currentSegment = rawSegments[segmentIndex].trim();
    if (currentSegment === '0 0') {
      return;
    }

    const dimensionValues = currentSegment.match(/\d+/g);
    if (!dimensionValues || dimensionValues.length < 2) {
      buildAndDisplayGrids(segmentIndex + 1);
      return;
    }

    const heightVal = Number(dimensionValues[0]);
    const widthVal = Number(dimensionValues[1]); // This value is parsed but not used for grid width, replicating original behavior.

    const actualDimension = heightVal; // Grid will be heightVal x heightVal

    const matrixElements = Array.from({ length: actualDimension }, (_, rowIdx) =>
      Array.from({ length: actualDimension }, (_, colIdx) =>
        String.fromCharCode(35 + ((rowIdx + colIdx) & 1) * 11)
      ).join('')
    ).join('\n');

    process.stdout.write(matrixElements + '\n');

    buildAndDisplayGrids(segmentIndex + 1);
  };

  buildAndDisplayGrids(0);
});