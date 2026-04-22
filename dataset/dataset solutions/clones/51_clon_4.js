const fileContent = require('fs').readFileSync('/dev/stdin', 'utf8');
const lines = fileContent.trim().split('\n');

const difference = function(originPoint, terminalPoint) {
  return [terminalPoint[0] - originPoint[0], terminalPoint[1] - originPoint[1]];
};

const scalarCross = function(vectorA, vectorB) {
  return vectorA[0] * vectorB[1] - vectorA[1] * vectorB[0];
};

const processedData = lines.map(function(lineEntry) {
  const numericValues = lineEntry.split(' ').map(Number);
  return {
    firstPoint: [numericValues[0], numericValues[1]],
    secondPoint: [numericValues[2], numericValues[3]],
    thirdPoint: [numericValues[4], numericValues[5]],
    queryPoint: [numericValues[6], numericValues[7]]
  };
});

const calculatedOutcomes = processedData.map(function(coordinateSet) {
  const pointA = coordinateSet.firstPoint;
  const pointB = coordinateSet.secondPoint;
  const pointC = coordinateSet.thirdPoint;
  const pointP = coordinateSet.queryPoint;

  const vectorAB = difference(pointA, pointB);
  const vectorAC = difference(pointA, pointC);
  const vectorAP = difference(pointA, pointP);

  const areaDenominator = scalarCross(vectorAB, vectorAC);

  if (areaDenominator === 0) {
    return 'NO'; // Degenerate triangle (collinear points), point cannot be strictly inside
  }

  const barycentricV = scalarCross(vectorAP, vectorAC) / areaDenominator;
  const barycentricW = scalarCross(vectorAB, vectorAP) / areaDenominator;
  const barycentricU = 1 - barycentricV - barycentricW;

  if (barycentricV > 0 && barycentricW > 0 && barycentricU > 0) {
    return 'YES';
  } else {
    return 'NO';
  }
});

process.stdout.write(calculatedOutcomes.join('\n') + '\n');