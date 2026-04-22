const DECIMAL_PRECISION = 8;
const INITIAL_X_VAL = 0.0;
const INITIAL_Y_VAL = 0.0;
const END_X_VAL = 100.0;
const END_Y_VAL = 0.0;
const ROTATION_ANGLE_DEGREES = 60.0;
const ONE_THIRD_FRACTION = 1.0 / 3.0;
const TWO_THIRDS_FRACTION = 2.0 / 3.0;
const DEGREES_TO_RADIANS_FACTOR = Math.PI / 180.0;

/**
 * Represents a 2D vector or point with an abscissa (x-coordinate) and an ordinate (y-coordinate).
 * This class provides basic point manipulation and output capabilities.
 */
class Vector2D {
  /**
   * Constructs a new Vector2D instance.
   * @param {number} abscissaValue - The x-coordinate of the vector.
   * @param {number} ordinateValue - The y-coordinate of the vector.
   */
  constructor(abscissaValue, ordinateValue) {
    this.abscissa = abscissaValue; // Storing the x-component
    this.ordinate = ordinateValue; // Storing the y-component
  }

  /**
   * Creates a new Vector2D object from given x and y coordinates.
   * This acts as a factory method for clarity.
   * @param {number} xCoord - The x-coordinate.
   * @param {number} yCoord - The y-coordinate.
   * @returns {Vector2D} A new Vector2D instance.
   */
  static createFromCoordinates(xCoord, yCoord) {
    return new Vector2D(xCoord, yCoord);
  }

  /**
   * Outputs the coordinates of the vector to the console, formatted to a specific precision.
   * Prepends "P: " for identification.
   */
  outputPosition() {
    const formattedAbscissa = this.abscissa.toFixed(DECIMAL_PRECISION);
    const formattedOrdinate = this.ordinate.toFixed(DECIMAL_PRECISION);
    console.log(`P: ${formattedAbscissa} ${formattedOrdinate}`);
  }
}

/**
 * The main entry point for the Koch curve generation program.
 * It reads the recursion depth, initializes the base segment, and orchestrates the fractal generation.
 */
(function initiateFractalGeneration() {
  // Attempt to read the recursion depth from standard input.
  // The input is expected to be a single integer representing the number of iterations.
  const inputData = require('fs').readFileSync('/dev/stdin', 'utf8').trim();
  const recursionDepth = Number(inputData);

  // Validate the input recursion depth. It must be a non-negative integer.
  if (isNaN(recursionDepth) || !Number.isInteger(recursionDepth) || recursionDepth < 0) {
    console.error("Error: Invalid recursion depth provided. Please enter a non-negative integer.");
    process.exit(1); // Exit with an error code
  }

  // Define the initial segment endpoints for the Koch curve.
  // The first point is at (0,0).
  const initialVertex = Vector2D.createFromCoordinates(INITIAL_X_VAL, INITIAL_Y_VAL);
  // The second point is at (100,0).
  const finalVertex = Vector2D.createFromCoordinates(END_X_VAL, END_Y_VAL);

  // Output the starting point of the initial segment.
  initialVertex.outputPosition();

  // Begin the recursive fractal generation process.
  // This function will subdivide the segment and print intermediate points.
  fractalGenerator(recursionDepth, initialVertex, finalVertex);

  // Output the ending point of the initial segment after all subdivisions are complete.
  finalVertex.outputPosition();
})();

/**
 * Orchestrates the generation of the Koch curve segments.
 * This function calculates the constant trigonometric values and then
 * delegates the recursive subdivision to a helper function.
 * @param {number} currentIterationCount - The current recursion depth.
 * @param {Vector2D} segmentStartPoint - The starting point of the current segment.
 * @param {Vector2D} segmentEndPoint - The ending point of the current segment.
 */
function fractalGenerator(currentIterationCount, segmentStartPoint, segmentEndPoint) {
  // Pre-calculate sine and cosine values for the 60-degree rotation.
  // These are constant for all rotations in the Koch curve generation.
  const sineComponent = Math.sin(ROTATION_ANGLE_DEGREES * DEGREES_TO_RADIANS_FACTOR);
  const cosineComponent = Math.cos(ROTATION_ANGLE_DEGREES * DEGREES_TO_RADIANS_FACTOR);

  /**
   * Recursively subdivides a given line segment into four smaller segments,
   * forming the characteristic Koch curve pattern.
   * @param {number} depthRemaining - The remaining recursion depth.
   * @param {Vector2D} startPt - The starting point of the segment.
   * @param {Vector2D} endPt - The ending point of the segment.
   * @param {number} sinVal - Pre-calculated sine of the rotation angle.
   * @param {number} cosVal - Pre-calculated cosine of the rotation angle.
   */
  const subdivideSegment = (depthRemaining, startPt, endPt, sinVal, cosVal) => {
    // Base case for the recursion: if no more iterations are needed, stop.
    if (depthRemaining <= 0) {
      return;
    }

    // Input validation: Ensure segment points are valid Vector2D objects.
    if (!(startPt instanceof Vector2D) || !(endPt instanceof Vector2D)) {
      console.warn("Warning: Invalid point type passed to subdivideSegment. Skipping.");
      return;
    }

    // Calculate the difference in coordinates for the current segment.
    const deltaAbscissa = endPt.abscissa - startPt.abscissa;
    const deltaOrdinate = endPt.ordinate - startPt.ordinate;

    // Calculate the coordinates of the first point (Q) at 1/3 of the segment.
    const pointQ = Vector2D.createFromCoordinates(
      startPt.abscissa + deltaAbscissa * ONE_THIRD_FRACTION,
      startPt.ordinate + deltaOrdinate * ONE_THIRD_FRACTION
    );

    // Calculate the coordinates of the second point (R) at 2/3 of the segment.
    const pointR = Vector2D.createFromCoordinates(
      startPt.abscissa + deltaAbscissa * TWO_THIRDS_FRACTION,
      startPt.ordinate + deltaOrdinate * TWO_THIRDS_FRACTION
    );

    // Calculate the coordinates of the middle point (M) formed by rotating the segment QR.
    // This involves rotating the vector from Q to R by 60 degrees.
    const vectorQR_X = pointR.abscissa - pointQ.abscissa;
    const vectorQR_Y = pointR.ordinate - pointQ.ordinate;

    // Apply the 2D rotation matrix:
    // x' = x * cos(theta) - y * sin(theta)
    // y' = x * sin(theta) + y * cos(theta)
    const rotatedVector_X = vectorQR_X * cosVal - vectorQR_Y * sinVal;
    const rotatedVector_Y = vectorQR_X * sinVal + vectorQR_Y * cosVal;

    // The rotated point M is found by adding the rotated vector to point Q.
    const pointM = Vector2D.createFromCoordinates(
      pointQ.abscissa + rotatedVector_X,
      pointQ.ordinate + rotatedVector_Y
    );

    // Recursively call subdivideSegment for the four new segments,
    // and print the intermediate points.
    // 1. Segment P-Q
    subdivideSegment(depthRemaining - 1, startPt, pointQ, sinVal, cosVal);
    pointQ.outputPosition(); // Output point Q

    // 2. Segment Q-M
    subdivideSegment(depthRemaining - 1, pointQ, pointM, sinVal, cosVal);
    pointM.outputPosition(); // Output point M

    // 3. Segment M-R
    subdivideSegment(depthRemaining - 1, pointM, pointR, sinVal, cosVal);
    pointR.outputPosition(); // Output point R

    // 4. Segment R-P2 (original end point)
    subdivideSegment(depthRemaining - 1, pointR, endPt, sinVal, cosVal);
  };

  // Initiate the recursive subdivision process with the calculated constants.
  subdivideSegment(currentIterationCount, segmentStartPoint, segmentEndPoint, sineComponent, cosineComponent);
}