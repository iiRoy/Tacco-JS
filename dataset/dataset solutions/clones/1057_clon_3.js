class Coord {
  constructor(xVal, yVal) {
    this.coordX = xVal;
    this.coordY = yVal;
  }

  getFormattedCoords() {
    return this.coordX.toFixed(8) + ' ' + this.coordY.toFixed(8);
  }

  display() {
    console.log(this.getFormattedCoords());
  }

  static create(x, y) {
    return new Coord(x, y);
  }
}

function readInputLevel() {
  return Number(require('fs').readFileSync('/dev/stdin', 'utf8').trim());
}

function generateKock(currentLevel, segmentStart, segmentEnd) {
  const localSineVal = Math.sin(60 * Math.PI / 180);
  const localCosineVal = Math.cos(60 * Math.PI / 180);

  function recursiveKockStep(currentLevel, segmentStart, segmentEnd) {
    if (currentLevel === 0) {
      return;
    }

    const ONE_THIRD_FACTOR = 1 / 3;

    const deltaX = segmentEnd.coordX - segmentStart.coordX;
    const deltaY = segmentEnd.coordY - segmentStart.coordY;

    const seg1End = Coord.create(
      segmentStart.coordX + deltaX * ONE_THIRD_FACTOR,
      segmentStart.coordY + deltaY * ONE_THIRD_FACTOR
    );

    const seg2End = Coord.create(
      segmentStart.coordX + deltaX * (2 * ONE_THIRD_FACTOR),
      segmentStart.coordY + deltaY * (2 * ONE_THIRD_FACTOR)
    );

    const vectorXComponent = seg2End.coordX - seg1End.coordX;
    const vectorYComponent = seg2End.coordY - seg1End.coordY;

    const rotatedVectorX = vectorXComponent * localCosineVal - vectorYComponent * localSineVal;
    const rotatedVectorY = vectorXComponent * localSineVal + vectorYComponent * localCosineVal;

    const peakPt = Coord.create(
      seg1End.coordX + rotatedVectorX,
      seg1End.coordY + rotatedVectorY
    );

    recursiveKockStep(currentLevel - 1, segmentStart, seg1End);
    seg1End.display();
    recursiveKockStep(currentLevel - 1, seg1End, peakPt);
    peakPt.display();
    recursiveKockStep(currentLevel - 1, peakPt, seg2End);
    seg2End.display();
    recursiveKockStep(currentLevel - 1, seg2End, segmentEnd);
  }

  generateKock = recursiveKockStep;
  generateKock(currentLevel, segmentStart, segmentEnd);
}

(function executeFractal() {
  const fractalLevel = readInputLevel();
  let initialStart = Coord.create(0, 0);
  let initialEnd = Coord.create(100, 0);
  initialStart.display();
  generateKock(fractalLevel, initialStart, initialEnd);
  initialEnd.display();
})();
