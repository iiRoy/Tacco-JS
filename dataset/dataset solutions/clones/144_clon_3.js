class Point2D {
  constructor(coordX, coordY) {
    this.coordX = coordX;
    this.coordY = coordY;
  }

  subtract(otherPoint) {
    return new Point2D(this.coordX - otherPoint.coordX, this.coordY - otherPoint.coordY);
  }

  crossProductMagnitude(otherPoint) {
    return this.coordX * otherPoint.coordY - this.coordY * otherPoint.coordX;
  }
}

(function(rawData) {
  const inputLines = rawData.replace(/\n$/, '').split('\n');
  const lineCount = inputLines.length;

  const parseCoordinates = (lineStr) => {
    return lineStr.split(',').map(Number);
  };

  for (let idx = 0; idx < lineCount; idx++) {
    const currentCoords = parseCoordinates(inputLines[idx]);
    console.log(checkConvexity.apply(null, currentCoords));
  }
})(require('fs').readFileSync('/dev/stdin', 'utf8'));

function checkConvexity(xa, ya, xb, yb, xc, yc, xd, yd) {
  const createPoint = (x, y) => new Point2D(x, y);

  const ptA = createPoint(xa, ya);
  const ptB = createPoint(xb, yb);
  const ptC = createPoint(xc, yc);
  const ptD = createPoint(xd, yd);

  const vecBA = ptB.subtract(ptA);
  const vecCB = ptC.subtract(ptB);
  const vecDC = ptD.subtract(ptC);
  const vecAD = ptA.subtract(ptD);

  const cp1 = vecBA.crossProductMagnitude(vecCB);
  const cp2 = vecCB.crossProductMagnitude(vecDC);
  const cp3 = vecDC.crossProductMagnitude(vecAD);
  const cp4 = vecAD.crossProductMagnitude(vecBA);

  const allPositive = (cp1 > 0 && cp2 > 0 && cp3 > 0 && cp4 > 0);
  const allNegative = (cp1 < 0 && cp2 < 0 && cp3 < 0 && cp4 < 0);

  if (allPositive || allNegative) {
    return 'YES';
  }
  return 'NO';
}
