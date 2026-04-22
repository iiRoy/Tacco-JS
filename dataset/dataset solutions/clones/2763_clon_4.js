const processCoordinates = function(rawInputText) {
  const allNumberStrings = rawInputText.match(/-?\d+/g);
  const allNumericValues = new Array(allNumberStrings.length);
  for (let i = 0; i < allNumberStrings.length; ++i) {
    allNumericValues[i] = Number(allNumberStrings[i]);
  }

  const pointCount = allNumericValues[0];
  const spaceDimension = allNumericValues[1];

  const allPoints = [];
  let currentNumericIndex = 2;
  for (let i = 0; i < pointCount; ++i) {
    const tempPoint = new Array(spaceDimension);
    for (let j = 0; j < spaceDimension; ++j) {
      tempPoint[j] = allNumericValues[currentNumericIndex + j];
    }
    allPoints.push(tempPoint);
    currentNumericIndex += spaceDimension;
  }

  const calcEuclideanSpan = function(vecOne, vecTwo, dim) {
    let sumSquaredDiff = 0;
    for (let k = 0; k < dim; ++k) {
      let diff = vecOne[k] - vecTwo[k];
      sumSquaredDiff += diff * diff;
    }
    return Math.sqrt(sumSquaredDiff);
  };

  let integerDistancePairs = 0;
  for (let idxP1 = 0; idxP1 < pointCount; ++idxP1) {
    for (let idxP2 = idxP1 + 1; idxP2 < pointCount; ++idxP2) {
      const currentPoint = allPoints[idxP1];
      const otherPoint = allPoints[idxP2];
      const measuredSpan = calcEuclideanSpan(currentPoint, otherPoint, spaceDimension);
      if (Number.isInteger(measuredSpan)) {
        integerDistancePairs++;
      }
    }
  }

  console.log(integerDistancePairs);
};

processCoordinates(require("fs").readFileSync("/dev/stdin", "utf8"));