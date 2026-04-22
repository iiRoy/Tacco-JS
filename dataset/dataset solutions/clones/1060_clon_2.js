class CartesianCoord {
  /*
   * Initializes a new CartesianCoord instance.
   * @param {number} horizontal - The horizontal coordinate.
   * @param {number} vertical - The vertical coordinate.
   */
  constructor (horizontal, vertical) {
    this.horizontal = horizontal;
    this.vertical = vertical;
  }

  // Outputs the coordinate values to the console.
  showLocation () {
    console.log(
      this.horizontal.toFixed(8) + ' ' + this.vertical.toFixed(8)
    );
  }
}

(function performFractalGeneration () {
  // Read the iteration count from standard input.
  const iterationCount = Number(require('fs').readFileSync('/dev/stdin', 'utf8').trim());
  
  let initialPoint = new CartesianCoord(0, 0);
  let finalPoint = new CartesianCoord(100, 0);

  initialPoint.showLocation();
  generateKochCurve(iterationCount, initialPoint, finalPoint);
  finalPoint.showLocation();
})();

/**
 * Recursively generates segments of a Koch curve.
 * @param {number} iterationCount - The current iteration level.
 * @param {CartesianCoord} initialPoint - The starting point of the segment.
 * @param {CartesianCoord} finalPoint - The ending point of the segment.
 */
function generateKochCurve (iterationCount, initialPoint, finalPoint) {
  // Pre-calculate trigonometric values for 60 degrees.
  const sineValue = Math.sin(60 * Math.PI / 180);
  const cosineValue = Math.cos(60 * Math.PI / 180);

  // Define an internal function for the recursive transformations.
  function recursiveSegmentTransform (iterationCount, initialPoint, finalPoint) {
    if (!iterationCount) {
      return;
    }

    // Calculate differences in coordinates.
    deltaX = finalPoint.horizontal - initialPoint.horizontal;
    deltaY = finalPoint.vertical - initialPoint.vertical;

    // Calculate the first point of the middle segment.
    let segmentOneEnd = new CartesianCoord(
      initialPoint.horizontal + deltaX / 3,
      initialPoint.vertical + deltaY / 3
    );
    // Calculate the second point of the middle segment.
    let segmentTwoEnd = new CartesianCoord(
      segmentOneEnd.horizontal + deltaX / 3,
      segmentOneEnd.vertical + deltaY / 3
    );

    // Calculate the peak point of the triangular segment after rotation.
    let rotatedPoint = new CartesianCoord(
      (segmentTwoEnd.horizontal - segmentOneEnd.horizontal) * cosineValue - (segmentTwoEnd.vertical - segmentOneEnd.vertical) * sineValue + segmentOneEnd.horizontal,
      (segmentTwoEnd.horizontal - segmentOneEnd.horizontal) * sineValue + (segmentTwoEnd.vertical - segmentOneEnd.vertical) * cosineValue + segmentOneEnd.vertical
    );

    // Recursively call for the first segment.
    generateKochCurve(iterationCount - 1, initialPoint, segmentOneEnd);
    // Display the first intermediate point.
    segmentOneEnd.showLocation();

    // Recursively call for the second segment (rotated).
    generateKochCurve(iterationCount - 1, segmentOneEnd, rotatedPoint);
    // Display the peak point.
    rotatedPoint.showLocation();

    // Recursively call for the third segment.
    generateKochCurve(iterationCount - 1, rotatedPoint, segmentTwoEnd);
    // Display the second intermediate point.
    segmentTwoEnd.showLocation();

    // Recursively call for the fourth segment.
    generateKochCurve(iterationCount - 1, segmentTwoEnd, finalPoint);
  }

  // Replace the outer function with the inner recursive one for subsequent calls.
  generateKochCurve = recursiveSegmentTransform;
  recursiveSegmentTransform(iterationCount, initialPoint, finalPoint);
}