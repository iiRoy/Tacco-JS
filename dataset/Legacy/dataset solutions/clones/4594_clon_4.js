function processInput(inputLines) {
  const [heightVal, widthVal, maxSteps] = inputLines[0].split(' ').map(Number);

  const initialMap = inputLines.slice(1).map(lineContent => lineContent.split(''));

  const distanceGrid = Array.from({ length: heightVal }, () => Array(widthVal).fill(Infinity));

  let startRow, startCol;
  initialMap.some((rowArr, rIdx) =>
    rowArr.some((cellChar, cIdx) => {
      if (cellChar === 'S') {
        startRow = rIdx;
        startCol = cIdx;
        return true;
      }
      return false;
    })
  );

  const traversalQueue = [{ r: startRow, c: startCol, d: 0 }];
  distanceGrid[startRow][startCol] = 0;

  const rowOffsets = [-1, 1, 0, 0];
  const colOffsets = [0, 0, -1, 1];

  let queueHead = 0;
  while (queueHead < traversalQueue.length) {
    const { r: currentR, c: currentC, d: currentD } = traversalQueue[queueHead++];

    if (currentD >= maxSteps) continue;

    for (let i = 0; i < 4; i++) {
      const nextR = currentR + rowOffsets[i];
      const nextC = currentC + colOffsets[i];
      const nextD = currentD + 1;

      if (
        nextR >= 0 && nextR < heightVal &&
        nextC >= 0 && nextC < widthVal &&
        initialMap[nextR][nextC] !== '#' &&
        nextD < distanceGrid[nextR][nextC]
      ) {
        distanceGrid[nextR][nextC] = nextD;
        traversalQueue.push({ r: nextR, c: nextC, d: nextD });
      }
    }
  }

  const finalCalculationResult = distanceGrid.reduce((currentMinState, rowArr, rIdx) => {
    if (currentMinState.borderFound) {
      return currentMinState;
    }

    return rowArr.reduce((innerMinState, cellDistance, cIdx) => {
      if (innerMinState.borderFound) {
        return innerMinState;
      }

      if (cellDistance !== Infinity) {
        const distanceToBorder = Math.min(
          (heightVal - 1) - rIdx,
          rIdx,
          (widthVal - 1) - cIdx,
          cIdx
        );

        if (distanceToBorder === 0) {
          return { minVal: 1, borderFound: true };
        }
        return {
          minVal: Math.min(innerMinState.minVal, Math.ceil(distanceToBorder / maxSteps) + 1),
          borderFound: false
        };
      }
      return innerMinState;
    }, currentMinState);
  }, { minVal: Infinity, borderFound: false });

  if (finalCalculationResult.borderFound) {
    console.log(1);
  } else {
    console.log(finalCalculationResult.minVal);
  }
}

processInput(require("fs").readFileSync("/dev/stdin", "utf8").split('\n').map(l => l.trim()));
