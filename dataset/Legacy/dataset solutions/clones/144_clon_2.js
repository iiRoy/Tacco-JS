function Point2D(coordX, coordY) {
  this.coordX = coordX;
  this.coordY = coordY;
}

Point2D.prototype.subtractPoints = function(otherPoint) {
  return new Point2D(this.coordX - otherPoint.coordX, this.coordY - otherPoint.coordY);
};

Point2D.prototype.calculateCrossProductScalar = function(otherPoint) {
  return this.coordX * otherPoint.coordY - this.coordY * otherPoint.coordX;
};

(function(rawDataInput) {
  var processedLines = rawDataInput.replace(/\n$/, '').split('\n');
  var totalLines = processedLines.length;

  for (var lineIndex = 0; lineIndex < totalLines; lineIndex++) {
    var currentCoordinates = processedLines.shift().split(',').map(Number);
    console.log(determineConvexPolygon.apply(null, currentCoordinates));
  }
})(require('fs').readFileSync('/dev/stdin', 'utf8'));

function determineConvexPolygon(p1x, p1y, p2x, p2y, p3x, p3y, p4x, p4y) {
  var vertexA = new Point2D(p1x, p1y);
  var vertexB = new Point2D(p2x, p2y);
  var vertexC = new Point2D(p3x, p3y);
  var vertexD = new Point2D(p4x, p4y);

  var vectorBA = vertexB.subtractPoints(vertexA);
  var vectorCB = vertexC.subtractPoints(vertexB);
  var vectorDC = vertexD.subtractPoints(vertexC);
  var vectorAD = vertexA.subtractPoints(vertexD);

  var crossProd1 = vectorBA.calculateCrossProductScalar(vectorCB);
  var crossProd2 = vectorCB.calculateCrossProductScalar(vectorDC);
  var crossProd3 = vectorDC.calculateCrossProductScalar(vectorAD);
  var crossProd4 = vectorAD.calculateCrossProductScalar(vectorBA);

  if ((crossProd1 > 0 && crossProd2 > 0 && crossProd3 > 0 && crossProd4 > 0) ||
    (crossProd1 < 0 && crossProd2 < 0 && crossProd3 < 0 && crossProd4 < 0)) {
    return 'YES';
  }
  return 'NO';
}

function compute2DCrossProduct(componentAX, componentAY, componentBX, componentBY) {
  return componentAX * componentBY - componentBX * componentAY;
}
