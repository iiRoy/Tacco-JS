class CoordVec {
  constructor(valX, valY) {
    this.valX = valX;
    this.valY = valY;
  }

  getDifference(otherVec) {
    return new CoordVec(this.valX - otherVec.valX, this.valY - otherVec.valY);
  }

  computeCrossProduct(otherVec) {
    return this.valX * otherVec.valY - this.valY * otherVec.valX;
  }
}

function areSignsConsistent(numA, numB, numC) {
  const isAllPositive = numA > 0 && numB > 0 && numC > 0;
  const isAllNegative = numA < 0 && numB < 0 && numC < 0;
  return isAllPositive || isAllNegative;
}

function createPointFromShiftedArray(coordinateSource) {
  const xCoord = coordinateSource.shift();
  const yCoord = coordinateSource.shift();
  return new CoordVec(xCoord, yCoord);
}

(function(rawData) {
  const trimmedInput = rawData.replace(/\n$/, '');
  let dataLines = trimmedInput.split('\n');

  while (dataLines.length > 0) {
    const currentCoordsStr = dataLines.shift().split(' ');
    const currentCoords = currentCoordsStr.map(Number);

    const pointA = createPointFromShiftedArray(currentCoords);
    const pointB = createPointFromShiftedArray(currentCoords);
    const pointC = createPointFromShiftedArray(currentCoords);
    const queryPoint = createPointFromShiftedArray(currentCoords);

    const vecAB = pointB.getDifference(pointA);
    const vecBP = queryPoint.getDifference(pointB);
    const vecBC = pointC.getDifference(pointB);
    const vecCP = queryPoint.getDifference(pointC);
    const vecCA = pointA.getDifference(pointC);
    const vecAP = queryPoint.getDifference(pointA);

    const crossProd1 = vecAB.computeCrossProduct(vecBP);
    const crossProd2 = vecBC.computeCrossProduct(vecCP);
    const crossProd3 = vecCA.computeCrossProduct(vecAP);
    
    if (areSignsConsistent(crossProd1, crossProd2, crossProd3)) {
      console.log('YES');
    } else {
      console.log('NO');
    }
  }
})(require('fs').readFileSync('/dev/stdin', 'utf8'));
