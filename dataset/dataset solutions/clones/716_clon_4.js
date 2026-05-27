#!/usr/bin/node
(function() {
  let rawDataSegments = [];
  let partialLineBuffer = "";
  const inputSource = process.openStdin();
  inputSource.setEncoding('utf8');

  const traverseRegion = (startX, startY, activeMatrix, visitedCoordinates) => {
    const processingQueue = [[startX, startY]];
    const matrixHeight = activeMatrix.length;
    const matrixWidth = activeMatrix[0].length;

    visitedCoordinates.add(`${startX}_${startY}`);

    const directionalOffsets = [
      [-1, -1], [-1, 0], [-1, 1],
      [0, -1],           [0, 1],
      [1, -1], [1, 0], [1, 1]
    ];

    while (processingQueue.length > 0) {
      const [currentX, currentY] = processingQueue.shift();

      for (const [deltaX, deltaY] of directionalOffsets) {
        const nextX = currentX + deltaX;
        const nextY = currentY + deltaY;
        const coordinateKey = `${nextX}_${nextY}`;

        if (nextX >= 0 && nextX < matrixWidth && nextY >= 0 && nextY < matrixHeight) {
          if (activeMatrix[nextY][nextX] === 1 && !visitedCoordinates.has(coordinateKey)) {
            visitedCoordinates.add(coordinateKey);
            processingQueue.push([nextX, nextY]);
          }
        }
      }
    }
  };

  inputSource.on('data', (incomingData) => {
    const currentBuffer = partialLineBuffer + incomingData;
    const lines = currentBuffer.split("\n");
    partialLineBuffer = lines.pop();

    for (const lineContent of lines) {
      if (lineContent === '') continue;
      const parsedRow = lineContent.split(" ").map(Number);
      rawDataSegments.push(parsedRow);
    }
  });

  inputSource.on('end', (_) => {
    let currentSegmentOffset = 0;
    while (currentSegmentOffset < rawDataSegments.length) {
      const headerRow = rawDataSegments[currentSegmentOffset];
      if (!headerRow || headerRow.length < 2) break;
      const gridHeight = headerRow[1];

      if (!gridHeight) break;

      const activeMatrix = rawDataSegments.slice(currentSegmentOffset + 1, currentSegmentOffset + 1 + gridHeight);

      let componentCount = 0;
      const visitedCoordinates = new Set();

      if (activeMatrix.length > 0 && activeMatrix[0].length > 0) {
          const matrixWidth = activeMatrix[0].length;
          const matrixHeight = activeMatrix.length;

          for (let rowIdx = 0; rowIdx < matrixHeight; rowIdx++) {
            for (let colIdx = 0; colIdx < matrixWidth; colIdx++) {
              const currentCellKey = `${colIdx}_${rowIdx}`;
              if (activeMatrix[rowIdx][colIdx] === 1 && !visitedCoordinates.has(currentCellKey)) {
                componentCount++;
                traverseRegion(colIdx, rowIdx, activeMatrix, visitedCoordinates);
              }
            }
          }
      }
      console.log(componentCount);

      currentSegmentOffset += (gridHeight + 1);
    }
  });
}).call(this);
