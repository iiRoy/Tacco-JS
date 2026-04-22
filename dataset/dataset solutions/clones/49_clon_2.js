function Point2D(horiz, vert) {
  this.horiz = horiz;
  this.vert = vert;
}
Point2D.prototype.diff = function(otherPoint) {
  return new Point2D(this.horiz - otherPoint.horiz, this.vert - otherPoint.vert);
};
Point2D.prototype.cross = function(otherVec) {
  return this.horiz * otherVec.vert - this.vert * otherVec.horiz;
};

(function(sourceContent) {
  var inputRows = sourceContent.replace(/\n$/, '').split('\n');
  while (inputRows.length > 0) {
    var currentCoords = inputRows.shift().split(' ').map(Number);

    var pointA = new Point2D(currentCoords.shift(), currentCoords.shift());
    var pointB = new Point2D(currentCoords.shift(), currentCoords.shift());
    var pointC = new Point2D(currentCoords.shift(), currentCoords.shift());
    var checkPoint = new Point2D(currentCoords.shift(), currentCoords.shift());

    var vectorAB = pointB.diff(pointA);
    var vectorBP = checkPoint.diff(pointB);
    var vectorBC = pointC.diff(pointB);
    var vectorCP = checkPoint.diff(pointC);
    var vectorCA = pointA.diff(pointC);
    var vectorAP = checkPoint.diff(pointA);

    var sign1 = vectorAB.cross(vectorBP);
    var sign2 = vectorBC.cross(vectorCP);
    var sign3 = vectorCA.cross(vectorAP);

    if ((sign1 > 0 && sign2 > 0 && sign3 > 0) || (sign1 < 0 && sign2 < 0 && sign3 < 0)) {
      console.log('YES');
      continue;
    }
    console.log('NO');
  }
})(require('fs').readFileSync('/dev/stdin', 'utf8'));