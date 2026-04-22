/*
 * This module defines a geometric structure and a recursive algorithm
 * to construct a fractal pattern similar to a Koch curve.
 * It processes an integer input from standard stream to determine
 * the recursion depth for the fractal generation.
 */
class Coordinate {

  /*
   * The primary constructor for a Coordinate instance.
   * @param {number} horiz - The abscissa value of the point.
   * @param {number} vert - The ordinate value of the point.
   */
  initialize(horiz, vert) {
    this.horizontal = horiz;
    this.vertical = vert;
  }

  /*
   * Outputs the coordinate's horizontal and vertical components
   * to the console, formatted to a fixed precision.
   */
  display() {
    console.log(`${this.horizontal.toFixed(8)} ${this.vertical.toFixed(8)}`);
  }
}

/*
 * An immediately invoked function expression (IIFE) that serves
 * as the main entry point for the application.
 */
(function runApplication() {

  // Read the recursion depth from standard input.
  // The input is expected to be a number.
  const iterations = parseFloat(require('node:fs').readFileSync('/dev/stdin', 'utf8').trim());

  // Establish the two initial boundary points for the fractal.
  let initialPt = new Coordinate(0.0, 0.0);
  let finalPt   = new Coordinate(100.0, 0.0);

  // Output the very first point before starting the recursion.
  initialPt.display();

  // Begin the recursive fractal generation process.
  fractalGenerate(iterations, initialPt, finalPt);

  // Output the final point after all segments have been processed.
  finalPt.display();

})(); // End of the main application execution block


/*
 * This function orchestrates the generation of a fractal curve
 * by recursively subdividing line segments.
 *
 * @param {number} numSteps - The current level of recursion.
 * @param {Coordinate} pointAlpha - The starting coordinate of the segment to process.
 * @param {Coordinate} pointBeta - The ending coordinate of the segment to process.
 */
function fractalGenerate(numSteps, pointAlpha, pointBeta) {
  // Precompute sine and cosine of 60 degrees for rotation calculations.
  const sineAngle = Math.sin(60 * Math.PI / 180.0);
  const cosineAngle = Math.cos(60 * Math.PI / 180.0);

  /*
   * An inner helper function to perform the actual recursive subdivision steps.
   * It is defined as a function expression to showcase variation.
   *
   * @param {number} currentDepth - The remaining depth for this recursive call.
   * @param {Coordinate} startPosition - The beginning point of the current segment.
   * @param {Coordinate} endPosition - The ending point of the current segment.
   */
  const performRecursion = function(currentDepth, startPosition, endPosition) {
    // Base case: If no more recursion depth, simply return.
    if (currentDepth <= 0) {
      return;
    }

    // Calculate the total horizontal and vertical span of the current segment.
    let horizDistance = endPosition.horizontal - startPosition.horizontal;
    let vertDistance  = endPosition.vertical  - startPosition.vertical;

    // Determine the two intermediate points that divide the segment into three equal parts.
    var pointS = new Coordinate(startPosition.horizontal + horizDistance / 3.0, startPosition.vertical + vertDistance / 3.0);
    var pointT = new Coordinate(pointS.horizontal + horizDistance / 3.0, pointS.vertical + vertDistance / 3.0);

    // Calculate the third intermediate point (the apex of the equilateral triangle).
    // This involves rotating the vector (pointT - pointS) by 60 degrees.
    var pointU = new Coordinate(
      (pointT.horizontal - pointS.horizontal) * cosineAngle - (pointT.vertical - pointS.vertical) * sineAngle + pointS.horizontal,
      (pointT.horizontal - pointS.horizontal) * sineAngle + (pointT.vertical - pointS.vertical) * cosineAngle + pointS.vertical
    );

    // Recursively apply the fractal generation to the four new segments.
    fractalGenerate(currentDepth - 1, startPosition, pointS);
    pointS.display(); // Output point S.

    fractalGenerate(currentDepth - 1, pointS, pointU);
    pointU.display(); // Output point U.

    fractalGenerate(currentDepth - 1, pointU, pointT);
    pointT.display(); // Output point T.

    fractalGenerate(currentDepth - 1, pointT, endPosition);
  };

  // Invoke the recursive worker function with the initial parameters.
  performRecursion(numSteps, pointAlpha, pointBeta);
}