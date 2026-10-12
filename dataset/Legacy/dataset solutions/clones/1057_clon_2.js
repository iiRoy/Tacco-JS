class Coord {
  constructor(coordX, coordY) {
    this.coordX = coordX;
    this.coordY = coordY;
  }

  // Outputs the coordinates to the console, formatted to 8 decimal places.
  outputPosition() {
    console.log(this.coordX.toFixed(8) + ' ' + this.coordY.toFixed(8));
  }
}

(function executeFractalGeneration() {
  // Read the iteration count from standard input.
  const iterationCount = Number(require('fs').readFileSync('/dev/stdin', 'utf8').trim());

  // Define the initial segment points for the Koch curve.
  let startPoint = new Coord(0.0, 0.0);
  let endPoint = new Coord(100.0, 0.0);

  // Display the starting point.
  startPoint.outputPosition();

  // Initiate the recursive Koch fractal generation.
  generateKochFractal(iterationCount, startPoint, endPoint);

  // Display the ending point.
  endPoint.outputPosition();
})();

// Global variables for coordinate differences, used in the recursive step.
// These are intentionally undeclared to match the original's implicit global scope.
deltaX = 0;
deltaY = 0;

/**
 * Recursively generates segments of the Koch curve.
 * @param {number} currentIteration - The current recursion depth.
 * @param {Coord} segmentStart - The starting point of the current segment.
 * @param {Coord} segmentEnd - The ending point of the current segment.
 */
function generateKochFractal(currentIteration, segmentStart, segmentEnd) {
  // Pre-calculate sine and cosine for 60 degrees (PI/3 radians).
  const sineValue60Deg = Math.sin(60 * Math.PI / 180);
  const cosineValue60Deg = Math.cos(60 * Math.PI / 180);

  /**
   * The core recursive function for the Koch curve.
   * @param {number} depth - The remaining recursion depth.
   * @param {Coord} segA - The first point of the current segment.
   * @param {Coord} segB - The second point of the current segment.
   */
  function processSegment(depth, segA, segB) {
    // Base case: if depth is zero, stop recursion.
    if (!depth) {
      return;
    }

    // Calculate the difference in x and y coordinates for the current segment.
    deltaX = segB.coordX - segA.coordX;
    deltaY = segB.coordY - segA.coordY;

    // Calculate point 's' (one-third along the segment).
    let pointS = new Coord(segA.coordX + deltaX / 3.0, segA.coordY + deltaY / 3.0);

    // Calculate point 't' (two-thirds along the segment).
    let pointT = new Coord(pointS.coordX + deltaX / 3.0, pointS.coordY + deltaY / 3.0);

    // Calculate point 'u' (the apex of the equilateral triangle).
    // This involves rotating the vector (t-s) by 60 degrees.
    let pointU = new Coord(
      (pointT.coordX - pointS.coordX) * cosineValue60Deg - (pointT.coordY - pointS.coordY) * sineValue60Deg + pointS.coordX,
      (pointT.coordX - pointS.coordX) * sineValue60Deg + (pointT.coordY - pointS.coordY) * cosineValue60Deg + pointS.coordY
    );

    // Recursively call for the first segment (A to S).
    generateKochFractal(depth - 1, segA, pointS);
    // Output point S.
    pointS.outputPosition();

    // Recursively call for the second segment (S to U).
    generateKochFractal(depth - 1, pointS, pointU);
    // Output point U.
    pointU.outputPosition();

    // Recursively call for the third segment (U to T).
    generateKochFractal(depth - 1, pointU, pointT);
    // Output point T.
    pointT.outputPosition();

    // Recursively call for the fourth segment (T to B).
    generateKochFractal(depth - 1, pointT, segB);
  }

  // Start the recursive process for the current segment.
  processSegment(currentIteration, segmentStart, segmentEnd);
}
