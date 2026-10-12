function processInput(rawData) {
  const lines = rawData.split("\n");
  const pointCount = parseInt(lines[0], 10);
  const coordinates = lines.slice(1, pointCount + 1).map(line => line.split(" ").map(valStr => parseFloat(valStr)));

  const distanceCache = new Map();

  const storeDistance = (p1Idx, p2Idx, distVal) => {
    distanceCache.set(`${p1Idx}_${p2Idx}`, distVal);
    distanceCache.set(`${p2Idx}_${p1Idx}`, distVal);
  };

  for (let idxA = 0; idxA < pointCount; idxA++) {
    for (let idxB = idxA + 1; idxB < pointCount; idxB++) {
      const currentDistance = calculateEuclideanDistance(coordinates[idxA], coordinates[idxB]);
      storeDistance(idxA, idxB, currentDistance);
    }
  }

  const allPermutations = generateAllPermutations(pointCount);
  let totalPathLengthSum = 0;

  for (const pathSequence of allPermutations) {
    totalPathLengthSum += calculatePathLength(distanceCache, pathSequence);
  }

  const averagePathLength = totalPathLengthSum / allPermutations.length;
  console.log(averagePathLength);
}

function calculatePathLength(distMap, pathSequence) {
  return pathSequence.slice(1).reduce((currentPathSum, currentPointIdx, index) => {
    const previousPointIdx = pathSequence[index];
    const key = `${previousPointIdx}_${currentPointIdx}`;
    return currentPathSum + distMap.get(key);
  }, 0);
}

function calculateEuclideanDistance(point1, point2) {
  const deltaX = point1[0] - point2[0];
  const deltaY = point1[1] - point2[1];
  const squaredDistance = Math.pow(deltaX, 2) + Math.pow(deltaY, 2);
  return Math.sqrt(squaredDistance);
}

function generateAllPermutations(numPoints) {
  if (numPoints === 1) {
    return [[0]];
  }

  const subPermutations = generateAllPermutations(numPoints - 1);
  const permutations = [];
  const pointToInsert = numPoints - 1;

  for (let insertIdx = 0; insertIdx < numPoints; insertIdx++) {
    for (const basePermutation of subPermutations) {
      const currentPermutation = [...basePermutation];
      currentPermutation.splice(insertIdx, 0, pointToInsert);
      permutations.push(currentPermutation);
    }
  }
  return permutations;
}

processInput(require('fs').readFileSync('/dev/stdin', 'utf8'));
