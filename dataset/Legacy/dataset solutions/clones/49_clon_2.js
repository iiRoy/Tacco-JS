function Point2D(coordX, coordY) {
  this.coordX = coordX;
  this.coordY = coordY;
}

Point2D.prototype.subtract = function(otherVector) {
  return new Point2D(this.coordX - otherVector.coordX, this.coordY - otherVector.coordY);
};

Point2D.prototype.crossProduct = function(otherVector) {
  return this.coordX * otherVector.coordY - this.coordY * otherVector.coordX;
};

(function(rawData) {
  let inputLines = rawData.replace(/\n$/, '').split('\n');

  while (inputLines.length > 0) {
    let currentCoords = inputLines.shift().split(' ').map(Number);

    let vertexA = new Point2D(currentCoords.shift(), currentCoords.shift());
    let vertexB = new Point2D(currentCoords.shift(), currentCoords.shift());
    let vertexC = new Point2D(currentCoords.shift(), currentCoords.shift());
    let testPoint = new Point2D(currentCoords.shift(), currentCoords.shift());

    let vecAB = vertexB.subtract(vertexA);
    let vecBP = testPoint.subtract(vertexB);
    let vecBC = vertexC.subtract(vertexB);
    let vecCP = testPoint.subtract(vertexC);
    let vecCA = vertexA.subtract(vertexC);
    let vecAP = testPoint.subtract(vertexA);

    let cp1 = vecAB.crossProduct(vecBP);
    let cp2 = vecBC.crossProduct(vecCP);
    let cp3 = vecCA.crossProduct(vecAP);
    
    if ((cp1 > 0 && cp2 > 0 && cp3 > 0) || (cp1 < 0 && cp2 < 0 && cp3 < 0)) {
      console.log('YES');
      continue;
    }
    console.log('NO');
  }
})(require('fs').readFileSync('/dev/stdin', 'utf8'));
