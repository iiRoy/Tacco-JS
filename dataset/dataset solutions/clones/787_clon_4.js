var inputLinesBuffer = [];

var inputHandler = require('readline').createInterface({
  input: process.stdin,
  output: process.stdout
});

inputHandler.on('line', function (currentLineText) {
  inputLinesBuffer.push(currentLineText);
});

process.stdin.on('end', function () {
  processInputBatches(inputLinesBuffer);
});

var PRECISION_THRESHOLD = Math.pow(10, -10);

function PointCoordinate(xVal, yVal) {
    this.x = xVal;
    this.y = yVal;
}

function LineSegment(startPoint, endPoint) {
    this.initial = startPoint;
    this.final = endPoint;

    this.coefficientA = this.final.y - this.initial.y;
    this.coefficientB = this.initial.x - this.final.x;
    this.coefficientC = this.coefficientA * this.initial.x + this.coefficientB * this.initial.y;
}

function determineIntersectionPoint(segmentOne, segmentTwo) {
    const determinant = segmentOne.coefficientA * segmentTwo.coefficientB - segmentTwo.coefficientA * segmentOne.coefficientB;

    if (Math.abs(determinant) < PRECISION_THRESHOLD) {
        return null;
    }

    const intersectionX = (segmentOne.coefficientC * segmentTwo.coefficientB - segmentTwo.coefficientC * segmentOne.coefficientB) / determinant;
    const intersectionY = (segmentOne.coefficientA * segmentTwo.coefficientC - segmentTwo.coefficientA * segmentOne.coefficientC) / determinant;

    if (intersectionX < -100 || intersectionX > 100 || intersectionY < -100 || intersectionY > 100) {
        return null;
    }

    return new PointCoordinate(intersectionX, intersectionY);
}

function calculatePlanarRegions(segmentCollection) {
    const initialAccumulatorState = {
        regionCount: 1,
        processedSegments: []
    };

    const finalAccumulatorState = segmentCollection.reduce((accumulator, currentSegment) => {
        accumulator.regionCount += 1;

        const uniqueIntersectionsForCurrentSegment = new Set();

        accumulator.processedSegments.forEach(previousSegment => {
            const intersectionPoint = determineIntersectionPoint(currentSegment, previousSegment);
            if (intersectionPoint) {
                const pointKey = `${intersectionPoint.x.toFixed(10)},${intersectionPoint.y.toFixed(10)}`;
                uniqueIntersectionsForCurrentSegment.add(pointKey);
            }
        });

        accumulator.regionCount += uniqueIntersectionsForCurrentSegment.size;

        accumulator.processedSegments.push(currentSegment);

        return accumulator;
    }, initialAccumulatorState);

    return finalAccumulatorState.regionCount;
}

function processInputBatches(rawInputLines) {
  let currentLineIndex = 0;
  let segmentCount;

  while ((segmentCount = +rawInputLines[currentLineIndex++]) !== 0) {
    const currentSegments = [];
    for (let k = 0; k < segmentCount; k++) {
      const coords = rawInputLines[currentLineIndex++].split(' ').map(Number);
      currentSegments.push(
        new LineSegment(
          new PointCoordinate(coords[0], coords[1]),
          new PointCoordinate(coords[2], coords[3])
        )
      );
    }
    console.log(calculatePlanarRegions(currentSegments));
  }
}
