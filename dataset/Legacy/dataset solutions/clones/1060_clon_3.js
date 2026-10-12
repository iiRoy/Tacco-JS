class Coord {
  constructor(coordX, coordY) {
    this.coordX = coordX;
    this.coordY = coordY;
  }

  static create(xVal, yVal) {
    return new Coord(xVal, yVal);
  }

  display() {
    console.log(this.coordX.toFixed(8) + ' ' + this.coordY.toFixed(8));
  }
}

(function executeKoch(){
  const readInputLevel = () => {
    const fileContent = require('fs').readFileSync('/dev/stdin', 'utf8').trim();
    return Number(fileContent);
  };

  const level = readInputLevel();
  let startPoint = Coord.create(0, 0);
  let endPoint = Coord.create(100, 0);

  startPoint.display();
  generateKoch(level, startPoint, endPoint);
  endPoint.display();
})();

function generateKoch(level, startPoint, endPoint) {
  const rotationAngleRad = 60 * Math.PI / 180;
  const sineVal = Math.sin(rotationAngleRad);
  const cosineVal = Math.cos(rotationAngleRad);

  function recursiveKochStep(currentLevel, currentStart, currentEnd) {
    if (currentLevel === 0) {
      return;
    }

    const oneThird = 1.0 / 3.0;
    const twoThirds = 2.0 / 3.0;

    const deltaX = currentEnd.coordX - currentStart.coordX;
    const deltaY = currentEnd.coordY - currentStart.coordY;

    const segmentStartX = currentStart.coordX + deltaX * oneThird;
    const segmentStartY = currentStart.coordY + deltaY * oneThird;
    let segmentStart = Coord.create(segmentStartX, segmentStartY);

    const segmentEndX = currentStart.coordX + deltaX * twoThirds;
    const segmentEndY = currentStart.coordY + deltaY * twoThirds;
    let segmentEnd = Coord.create(segmentEndX, segmentEndY);

    const vecX = segmentEnd.coordX - segmentStart.coordX;
    const vecY = segmentEnd.coordY - segmentStart.coordY;

    const rotatedVecX = vecX * cosineVal - vecY * sineVal;
    const rotatedVecY = vecX * sineVal + vecY * cosineVal;

    let peakPoint = Coord.create(segmentStart.coordX + rotatedVecX, segmentStart.coordY + rotatedVecY);

    generateKoch(currentLevel - 1, currentStart, segmentStart);
    segmentStart.display();
    generateKoch(currentLevel - 1, segmentStart, peakPoint);
    peakPoint.display();
    generateKoch(currentLevel - 1, peakPoint, segmentEnd);
    segmentEnd.display();
    generateKoch(currentLevel - 1, segmentEnd, currentEnd);
  }
  generateKoch = recursiveKochStep;
  recursiveKochStep(level, startPoint, endPoint);
}
