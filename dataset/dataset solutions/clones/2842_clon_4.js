function analyzeGeometricData(rawData) {
  const inputLines = rawData.split("\n").slice(0, -1);
  const pointCount = Number(inputLines.shift());

  const coordinates = inputLines.map(line => {
    const [xCoordStr, yCoordStr] = line.split(' ');
    return { x: Number(xCoordStr), y: Number(yCoordStr) };
  });

  coordinates.sort((ptA, ptB) => {
    if (ptA.x === ptB.x) {
      return ptA.y - ptB.y;
    }
    return ptA.x - ptB.x;
  });

  const displacementFrequencies = new Map();

  for (let sourceIdx = 0; sourceIdx < pointCount; ++sourceIdx) {
    for (let targetIdx = 0; targetIdx < pointCount; ++targetIdx) {
      if (sourceIdx === targetIdx) continue;

      const sourcePoint = coordinates[sourceIdx];
      const targetPoint = coordinates[targetIdx];

      const diffX = sourcePoint.x - targetPoint.x;
      const diffY = sourcePoint.y - targetPoint.y;
      const vectorIdentifier = `${diffX},${diffY}`;

      displacementFrequencies.set(vectorIdentifier, (displacementFrequencies.get(vectorIdentifier) || 0) + 1);
    }
  }

  let maxFrequency = 0;
  let dominantVectorIdentifier = '0,0';

  for (const [identifier, count] of displacementFrequencies.entries()) {
    if (count > maxFrequency) {
      maxFrequency = count;
      dominantVectorIdentifier = identifier;
    }
  }

  const [deltaXStr, deltaYStr] = dominantVectorIdentifier.split(',');
  const deltaX = Number(deltaXStr);
  const deltaY = Number(deltaYStr);

  let minimumLines = 0;
  const unvisitedPointIndices = new Set(Array.from({ length: pointCount }, (_, k) => k));

  const checkAlignment = (point1, point2, dx, dy) => {
    const currentDiffX = point2.x - point1.x;
    const currentDiffY = point2.y - point1.y;

    const xAligned = (dx === 0 && currentDiffX === 0) || (dx !== 0 && currentDiffX % dx === 0);
    const yAligned = (dy === 0 && currentDiffY === 0) || (dy !== 0 && currentDiffY % dy === 0);

    return xAligned && yAligned;
  };

  for (let currentPointIdx = 0; currentPointIdx < pointCount; ++currentPointIdx) {
    if (unvisitedPointIndices.has(currentPointIdx)) {
      minimumLines++;
      const referencePoint = coordinates[currentPointIdx];
      unvisitedPointIndices.delete(currentPointIdx);

      const indicesToMarkVisited = [];
      for (const otherPointIdx of unvisitedPointIndices) {
        const candidatePoint = coordinates[otherPointIdx];
        if (checkAlignment(referencePoint, candidatePoint, deltaX, deltaY)) {
          indicesToMarkVisited.push(otherPointIdx);
        }
      }
      indicesToMarkVisited.forEach(idx => unvisitedPointIndices.delete(idx));
    }
  }
  console.log(minimumLines);
}

analyzeGeometricData(require("fs").readFileSync("/dev/stdin", "utf8"));
