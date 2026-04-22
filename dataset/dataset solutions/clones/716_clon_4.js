(function() {
  const inputSource = process.stdin;
  inputSource.setEncoding('utf8');

  let fullInputBuffer = '';

  inputSource.on('data', (dataChunk) => {
    fullInputBuffer += dataChunk;
  });

  inputSource.on('end', () => {
    const allTextLines = fullInputBuffer.split('\n');
    let currentLineIndex = 0;

    const neighborOffsets = [
      [-1, -1], [-1, 0], [-1, 1],
      [0, -1],           [0, 1],
      [1, -1], [1, 0], [1, 1]
    ];

    while (currentLineIndex < allTextLines.length) {
      const dimensionLine = allTextLines[currentLineIndex].trim();
      if (dimensionLine === '') {
        currentLineIndex++;
        continue;
      }

      const parsedDimensions = dimensionLine.split(' ').map(Number);
      const matrixColumns = parsedDimensions[0];
      const matrixRows = parsedDimensions[1];
      currentLineIndex++;

      if (matrixRows === 0) {
        break;
      }

      const currentMap = [];
      for (let r = 0; r < matrixRows; r++) {
        const rowValues = allTextLines[currentLineIndex + r].trim().split(' ').map(Number);
        currentMap.push(rowValues);
      }
      currentLineIndex += matrixRows;

      let detectedClusters = 0;
      const cellsVisited = Array(matrixRows).fill(0).map(() => Array(matrixColumns).fill(false));

      for (let rowScan = 0; rowScan < matrixRows; rowScan++) {
        for (let colScan = 0; colScan < matrixColumns; colScan++) {
          if (currentMap[rowScan][colScan] === 1 && !cellsVisited[rowScan][colScan]) {
            detectedClusters++;
            const processingQueue = [[rowScan, colScan]];
            cellsVisited[rowScan][colScan] = true;

            let queuePointer = 0;

            while (queuePointer < processingQueue.length) {
              const [activeRow, activeCol] = processingQueue[queuePointer++];

              for (const [rowOffset, colOffset] of neighborOffsets) {
                const nextRow = activeRow + rowOffset;
                const nextCol = activeCol + colOffset;

                const withinBounds = nextRow >= 0 && nextRow < matrixRows &&
                                     nextCol >= 0 && nextCol < matrixColumns;

                if (withinBounds &&
                    currentMap[nextRow][nextCol] === 1 &&
                    !cellsVisited[nextRow][nextCol]) {

                  cellsVisited[nextRow][nextCol] = true;
                  processingQueue.push([nextRow, nextCol]);
                }
              }
            }
          }
        }
      }
      console.log(detectedClusters);
    }
  });
}).call(this);