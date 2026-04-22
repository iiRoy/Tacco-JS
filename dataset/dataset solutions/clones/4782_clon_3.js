const appendPathSegment = (segmentChar, count, pathBuilder) => {
  // Defensive programming: Ensure count is non-negative before appending.
  // This is an added guard clause, a Type III modification.
  if (count < 0) {
    // console.warn(`Negative count provided for '${segmentChar}'. Skipping.`);
    return;
  }
  // Loop condition changed from 'i <= N' to 'i < count' for clarity and common practice.
  // This is a Type III update/rewrite.
  for (let i = 0; i < count; i++) {
    pathBuilder.push(segmentChar);
  }
};

/**
 * Calculates a specific trajectory path based on start and end coordinates.
 * This function processes input, computes displacements, and constructs a complex sequence of movements.
 * @param {string} rawCoordinateInput - A space-separated string of four integer coordinates (sx sy tx ty).
 * @returns {string} The generated path sequence as a string.
 * @throws {Error} If input is invalid or coordinates are non-numeric.
 */
function calculateTraversalPath(rawCoordinateInput) {
  // Type III: Added input validation for robustness.
  if (typeof rawCoordinateInput !== 'string' || rawCoordinateInput.trim().length === 0) {
    throw new Error("Input must be a non-empty string containing coordinates.");
  }

  // Type III: Introduced constants for movement directions for better readability and maintainability.
  const UP_MOVE = 'U';
  const RIGHT_MOVE = 'R';
  const DOWN_MOVE = 'D';
  const LEFT_MOVE = 'L';

  // Type II: Renamed 'input' to 'rawCoordinateInput' and 'processedCoordinates'.
  // Type III: Changed 'split(' ')' to 'split(/\s+/)' for more robust whitespace handling.
  // Type III: Used explicit parseInt with radix for conversion and added validation for non-numeric input.
  const processedCoordinates = rawCoordinateInput
    .trim()
    .split(/\s+/)
    .map(coordStr => {
      const numVal = parseInt(coordStr, 10);
      if (isNaN(numVal)) {
        throw new Error(`Invalid coordinate value detected: '${coordStr}'. All coordinates must be integers.`);
      }
      return numVal;
    });

  // Type III: Added validation to ensure the correct number of coordinates is provided.
  if (processedCoordinates.length !== 4) {
    throw new Error(`Expected 4 coordinates (sx sy tx ty), but received ${processedCoordinates.length}.`);
  }

  // Type II: Renamed variables for better descriptive meaning.
  // Original: sx, sy, tx, ty
  const [originX, originY, destinationX, destinationY] = processedCoordinates;

  // Type II: Renamed variables for clarity.
  // Original: dx, dy
  // Type III: Added intermediate variables to represent the total displacement.
  const displacementX = destinationX - originX;
  const displacementY = destinationY - originY;

  // Type III: Used an array to build the path segments, then join them at the end.
  // This is a common optimization for string concatenation in loops.
  const trajectorySegments = [];

  // --- Building the first part of the path: A rectangular loop ---
  // This segment takes us from (originX, originY) to (destinationX, destinationY)
  // and then back to (originX, originY) using a specific sequence.

  // Move upwards: From originY to destinationY.
  // Original loop: for (let i = 0; i <= dy; i++) { ans += 'U' } // Adds (dy + 1) 'U's
  appendPathSegment(UP_MOVE, displacementY + 1, trajectorySegments);

  // Move rightwards: From originX to destinationX.
  // Original loop: for (let i = 0; i <= dx; i++) { ans += 'R' } // Adds (dx + 1) 'R's
  appendPathSegment(RIGHT_MOVE, displacementX + 1, trajectorySegments);

  // Move downwards: From destinationY back towards originY.
  // Original loop: for (let i = 0; i <= dy; i++) { ans += 'D' } // Adds (dy + 1) 'D's
  appendPathSegment(DOWN_MOVE, displacementY + 1, trajectorySegments);

  // Move leftwards: From destinationX back towards originX.
  // Original loop: for (let i = 0; i <= dx; i++) { ans += 'L' } // Adds (dx + 1) 'L's
  appendPathSegment(LEFT_MOVE, displacementX + 1, trajectorySegments);

  // --- Building the second part of the path: A more complex detour ---

  // Append an additional left move.
  trajectorySegments.push(LEFT_MOVE);

  // Move upwards, one unit further than the previous upward movement.
  // Original loop: for (let i = 0; i <= dy + 1; i++) { ans += 'U' } // Adds (dy + 2) 'U's
  appendPathSegment(UP_MOVE, displacementY + 2, trajectorySegments);

  // Move rightwards, one unit further than the previous rightward movement.
  // Original loop: for (let i = 0; i <= dx + 1; i++) { ans += 'R' } // Adds (dx + 2) 'R's
  appendPathSegment(RIGHT_MOVE, displacementX + 2, trajectorySegments);

  // Type III: Replaced 'ans += "DR"' with two separate pushes for consistency with constants.
  trajectorySegments.push(DOWN_MOVE, RIGHT_MOVE);

  // Move downwards, one unit further than the previous downward movement.
  // Original loop: for (let i = 0; i <= dy + 1; i++) { ans += 'D' } // Adds (dy + 2) 'D's
  appendPathSegment(DOWN_MOVE, displacementY + 2, trajectorySegments);

  // Move leftwards, one unit further than the previous leftward movement.
  // Original loop: for (let i = 0; i <= dx + 1; i++) { ans += 'L' } // Adds (dx + 2) 'L's
  appendPathSegment(LEFT_MOVE, displacementX + 2, trajectorySegments);

  // Append a final upward move.
  trajectorySegments.push(UP_MOVE);

  // Type III: Join the array of segments into the final path string.
  return trajectorySegments.join('');
}

// Entry point for script execution.
// Type II: Renamed the main execution block.
// Type III: Added robust error handling for file reading and function execution.
try {
  // Type II: Renamed 'require('fs').readFileSync' to 'fileSystemModule.readFileSync' conceptually,
  // but keeping 'require' as it's standard.
  // Type II: Renamed 'input' to 'fileContent'.
  const fileSystemModule = require('fs');
  const fileContent = fileSystemModule.readFileSync('/dev/stdin', 'utf8');

  const finalComputedPath = calculateTraversalPath(fileContent);
  console.log(finalComputedPath);

} catch (runtimeError) {
  // Type III: Provides more informative error messages on failure.
  console.error(`Application encountered an issue: ${runtimeError.message}`);
  // In a production environment, one might also exit with a non-zero status:
  // process.exit(1);
}