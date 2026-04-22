const convertStringToNumber = (textualInput) => Number(textualInput);

const analyzeGridState = (dataInput) => {
  const dataLines = dataInput.split('\n').map(line => line.trim());

  const [areaHeight, areaWidth, propagationCount] = dataLines[0].split(' ').map(convertStringToNumber);

  const originalCellContent = new Map();
  let initialSpreaderLocation = null;

  dataLines.slice(1).forEach((rowContent, rIndex) => {
    rowContent.split('').forEach((charSymbol, cIndex) => {
      const coordId = `${rIndex}_${cIndex}`;
      originalCellContent.set(coordId, charSymbol);
      if (charSymbol === 'S') {
        initialSpreaderLocation = { r: rIndex, c: cIndex };
      }
    });
  });

  const movementDirections = [
    { rowOffset: -1, colOffset: 0 }, { rowOffset: 1, colOffset: 0 },
    { rowOffset: 0, colOffset: -1 }, { rowOffset: 0, colOffset: 1 }
  ];

  const findShortestPaths = (currentQueue, visitedDistances) => {
    if (currentQueue.length === 0) {
      return visitedDistances;
    }

    const { r: currentR, c: currentC, d: currentD } = currentQueue[0];
    const remainingQueue = currentQueue.slice(1);

    const newNeighbors = movementDirections.flatMap(direction => {
      const nextR = currentR + direction.rowOffset;
      const nextC = currentC + direction.colOffset;
      const nextCoordId = `${nextR}_${nextC}`;

      if (nextR >= 0 && nextR < areaHeight &&
          nextC >= 0 && nextC < areaWidth &&
          originalCellContent.get(nextCoordId) === '.' &&
          !visitedDistances.has(nextCoordId)) {
        return [{ r: nextR, c: nextC, d: currentD + 1 }];
      }
      return [];
    });

    const updatedQueue = [...remainingQueue, ...newNeighbors];
    const updatedVisitedDistances = new Map([
      ...visitedDistances.entries(),
      ...newNeighbors.map(n => [`${n.r}_${n.c}`, n.d])
    ]);

    return findShortestPaths(updatedQueue, updatedVisitedDistances);
  };

  const allDistances = findShortestPaths(
    [{ r: initialSpreaderLocation.r, c: initialSpreaderLocation.c, d: 0 }],
    new Map([[`${initialSpreaderLocation.r}_${initialSpreaderLocation.c}`, 0]])
  );

  let minBoundaryProximity = Infinity;
  let hasReachedBoundary = false;

  originalCellContent.forEach((char, coordId) => {
    const [r, c] = coordId.split('_').map(convertStringToNumber);
    const distanceToOrigin = allDistances.has(coordId) ? allDistances.get(coordId) : Infinity;

    if (distanceToOrigin <= propagationCount) {
      const currentCellBoundaryDistance = Math.min(
        r,
        c,
        areaHeight - 1 - r,
        areaWidth - 1 - c
      );

      if (currentCellBoundaryDistance === 0) {
        hasReachedBoundary = true;
      }
      minBoundaryProximity = Math.min(minBoundaryProximity, currentCellBoundaryDistance);
    }
  });

  if (hasReachedBoundary) {
    console.log(1);
  } else {
    console.log(Math.ceil(minBoundaryProximity / propagationCount) + 1);
  }
};

analyzeGridState(require("fs").readFileSync("/dev/stdin", "utf8"));