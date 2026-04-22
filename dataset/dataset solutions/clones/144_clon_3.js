class GeometryPoint {
  /**
   * Initializes a new 2D point or vector.
   * @param {number} xCoord - The horizontal coordinate.
   * @param {number} yCoord - The vertical coordinate.
   */
  constructor(xCoord, yCoord) {
    // Basic type validation for robustness.
    if (typeof xCoord !== 'number' || typeof yCoord !== 'number' || isNaN(xCoord) || isNaN(yCoord)) {
      throw new Error('Coordinates must be valid numbers for GeometryPoint.');
    }
    this.x = xCoord;
    this.y = yCoord;
  }

  /**
   * Calculates the difference vector between this point and another.
   * @param {GeometryPoint} otherPoint - The point to subtract.
   * @returns {GeometryPoint} A new vector representing the difference (this - otherPoint).
   */
  getVectorDifference(otherPoint) {
    return new GeometryPoint(this.x - otherPoint.x, this.y - otherPoint.y);
  }

  /**
   * Returns a string representation of the point.
   * @returns {string}
   */
  toString() {
    return `Coord(${this.x}, ${this.y})`;
  }
}

/**
 * Calculates the scalar 2D cross product of two vectors (v1.x * v2.y - v1.y * v2.x).
 * This is equivalent to the Z-component of the 3D cross product if vectors are in XY plane.
 * @param {GeometryPoint} vec1 - The first vector.
 * @param {GeometryPoint} vec2 - The second vector.
 * @returns {number} The scalar cross product.
 */
const calculateScalarCrossProduct = (vec1, vec2) => {
  return vec1.x * vec2.y - vec1.y * vec2.x;
};

/**
 * Determines if a quadrilateral defined by four points is convex.
 * A quadrilateral is convex if all internal angles are less than 180 degrees.
 * This is checked by verifying that all cross products of consecutive edge vectors
 * (taken in order) have the same sign.
 *
 * @param {number[]} coordsArray - An array of 8 numbers: [p1x, p1y, p2x, p2y, p3x, p3y, p4x, p4y].
 * @returns {string} 'YES' if the quadrilateral is convex, 'NO' otherwise.
 */
function checkQuadrilateralConvexity(coordsArray) {
  // Input validation: Ensure exactly 8 numeric coordinates are provided.
  if (!Array.isArray(coordsArray) || coordsArray.length !== 8 || coordsArray.some(isNaN)) {
    // console.warn('Debug: Invalid input array for convexity check.');
    return 'NO (Invalid Coordinates)';
  }

  // Extract points from the flat coordinate array.
  const vertexA = new GeometryPoint(coordsArray[0], coordsArray[1]);
  const vertexB = new GeometryPoint(coordsArray[2], coordsArray[3]);
  const vertexC = new GeometryPoint(coordsArray[4], coordsArray[5]);
  const vertexD = new GeometryPoint(coordsArray[6], coordsArray[7]);

  // Define edge vectors from one point to the next in sequence (e.g., BA, CB, DC, AD).
  // The order (B-A), (C-B), (D-C), (A-D) is crucial for consistent orientation checking.
  const vectorFromAToB = vertexB.getVectorDifference(vertexA); // B - A
  const vectorFromBToC = vertexC.getVectorDifference(vertexB); // C - B
  const vectorFromCToD = vertexD.getVectorDifference(vertexC); // D - C
  const vectorFromDToA = vertexA.getVectorDifference(vertexD); // A - D

  // Calculate the Z-component of the cross product for consecutive edge vectors.
  // These values indicate the "turn" direction at each vertex.
  const crossProductResult1 = calculateScalarCrossProduct(vectorFromAToB, vectorFromBToC);
  const crossProductResult2 = calculateScalarCrossProduct(vectorFromBToC, vectorFromCToD);
  const crossProductResult3 = calculateScalarCrossProduct(vectorFromCToD, vectorFromDToA);
  const crossProductResult4 = calculateScalarCrossProduct(vectorFromDToA, vectorFromAToB);

  // Helper function to determine the sign, treating zero as a distinct case.
  const getSignValue = (val) => {
    if (val === 0) return 0;
    return val > 0 ? 1 : -1;
  };

  const signVal1 = getSignValue(crossProductResult1);
  const signVal2 = getSignValue(crossProductResult2);
  const signVal3 = getSignValue(crossProductResult3);
  const signVal4 = getSignValue(crossProductResult4);

  // If any cross product is zero, it implies collinear points,
  // which generally means a degenerate or non-strictly convex quadrilateral.
  if (signVal1 === 0 || signVal2 === 0 || signVal3 === 0 || signVal4 === 0) {
    return 'NO';
  }

  // For a convex quadrilateral, all cross products must have the same non-zero sign.
  // This means all turns are consistently in the same direction (e.g., all left turns or all right turns).
  const areAllSignsPositive = (signVal1 === 1 && signVal2 === 1 && signVal3 === 1 && signVal4 === 1);
  const areAllSignsNegative = (signVal1 === -1 && signVal2 === -1 && signVal3 === -1 && signVal4 === -1);

  // console.debug(`Debug: Signs - [${signVal1}, ${signVal2}, ${signVal3}, ${signVal4}]`);

  return (areAllSignsPositive || areAllSignsNegative) ? 'YES' : 'NO';
}

// Anonymous function for processing standard input, wrapped in a try-catch for robustness.
(function processInputData() {
  let fileContent;
  try {
    fileContent = require('fs').readFileSync('/dev/stdin', 'utf8');
  } catch (readError) {
    console.error('Error encountered while reading from /dev/stdin:', readError.message);
    return; // Terminate execution if input file cannot be read.
  }

  // Remove leading/trailing whitespace and split into individual lines.
  // Using trim() is more robust for various newline types (LF, CRLF).
  const rawInputLines = fileContent.trim().split(/\r?\n/);

  // Filter out any completely empty lines that might result from splitting.
  const validDataLines = rawInputLines.filter(line => line.length > 0);

  // Iterate over each valid line to process quadrilateral data.
  for (const currentInputLine of validDataLines) {
    // Parse numeric coordinates from the comma-separated string.
    const parsedNumericValues = currentInputLine.split(',').map(Number);

    // Perform basic validation on the parsed coordinate array.
    // We expect exactly 8 numbers, and all should be valid numbers.
    if (parsedNumericValues.length !== 8 || parsedNumericValues.some(isNaN)) {
      console.log('NO (Malformed Input Line)'); // Output a specific error message for malformed lines.
      continue; // Skip to the next line if the current one is malformed.
    }

    // Call the main convexity checker function with the parsed coordinates.
    const convexityResult = checkQuadrilateralConvexity(parsedNumericValues);
    console.log(convexityResult);
  }
})();