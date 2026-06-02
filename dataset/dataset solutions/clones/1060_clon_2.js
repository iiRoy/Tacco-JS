class Vertex {
  // Constructor for initializing a new point with its coordinates.
  constructor(coordX, coordY) {
    this.coordX = coordX;
    this.coordY = coordY;
  }

  // Method to output the point's coordinates to the console.
  displayCoordinates() {
    console.log(this.coordX.toFixed(8) + ' ' + this.coordY.toFixed(8));
  }
}

(function executeFractalGeneration() {
  // Read the recursion depth from standard input.
  const recursionDepth = Number(require('fs').readFileSync('/dev/stdin', 'utf8').trim());

  // Define the initial segment's start and end points.
  let startPoint = new Vertex(0, 0);
  let endPoint = new Vertex(100, 0);

  // Display the initial start point.
  startPoint.displayCoordinates();

  // Begin the Koch curve generation process.
  generateKochCurve(recursionDepth, startPoint, endPoint);

  // Display the final end point.
  endPoint.displayCoordinates();
})();

function generateKochCurve(recursionDepth, startPoint, endPoint) {
  // Pre-calculate sine and cosine of 60 degrees for rotation.
  const sineValueSixty = Math.sin(60 * Math.PI / 180);
  const cosineValueSixty = Math.cos(60 * Math.PI / 180);

  // This nested function performs the actual recursive steps of the Koch curve.
  function recursiveKochStep(currentDepth, currentStart, currentEnd) {
    // Base case: if recursion depth is zero, stop.
    if (!currentDepth) {
      return;
    }

    // Calculate differences in coordinates.
    let deltaX = currentEnd.coordX - currentStart.coordX;
    let deltaY = currentEnd.coordY - currentStart.coordY;

    // Calculate the first intermediate point (1/3 of the way).
    let segmentStart = new Vertex(currentStart.coordX + deltaX / 3, currentStart.coordY + deltaY / 3);

    // Calculate the second intermediate point (2/3 of the way).
    let segmentEnd = new Vertex(segmentStart.coordX + deltaX / 3, segmentStart.coordY + deltaY / 3);

    // Calculate the rotated point for the peak of the triangle.
    let rotatedPoint = new Vertex(
      (segmentEnd.coordX - segmentStart.coordX) * cosineValueSixty - (segmentEnd.coordY - segmentStart.coordY) * sineValueSixty + segmentStart.coordX,
      (segmentEnd.coordX - segmentStart.coordX) * sineValueSixty + (segmentEnd.coordY - segmentStart.coordY) * cosineValueSixty + segmentStart.coordY
    );

    // Recursively generate the first segment.
    generateKochCurve(currentDepth - 1, currentStart, segmentStart);
    // Display the first intermediate point.
    segmentStart.displayCoordinates();

    // Recursively generate the second segment (left side of the triangle).
    generateKochCurve(currentDepth - 1, segmentStart, rotatedPoint);
    // Display the rotated point.
    rotatedPoint.displayCoordinates();

    // Recursively generate the third segment (right side of the triangle).
    generateKochCurve(currentDepth - 1, rotatedPoint, segmentEnd);
    // Display the second intermediate point.
    segmentEnd.displayCoordinates();

    // Recursively generate the fourth segment.
    generateKochCurve(currentDepth - 1, segmentEnd, currentEnd);
  }

  // On the first call, reassign the outer function to the inner recursive one.
  // This ensures subsequent calls (including recursive ones) use the inner logic.
  generateKochCurve = recursiveKochStep;

  // Execute the initial recursive step.
  recursiveKochStep(recursionDepth, startPoint, endPoint);
}
