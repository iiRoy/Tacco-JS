// This module provides a constructor for modeling the state and movements of a six-sided cube.
// It aims to determine if two cubes, given their initial face values, can be oriented identically.

/**
 * Represents the current orientation of a six-sided cube.
 * Faces are stored in an array with fixed indices:
 * 0: Top, 1: Front, 2: Right, 3: Left, 4: Back, 5: Bottom
 *
 * @param {number[]} initialValues - An array of 6 numbers representing the values on each face.
 */
function CubeState(initialValues) {
  // Store the current face values. Using spread to ensure a shallow copy.
  this.currentFaces = [...initialValues];

  // Optional: Labels for face positions, primarily for debugging or clarity.
  // Not directly used in the core logic.
  this.faceDesignations = ['Top', 'Front', 'Right', 'Left', 'Back', 'Bottom'];

  // Basic validation for the input array.
  if (!Array.isArray(initialValues) || initialValues.length !== 6) {
    // In a production scenario, one might throw an error or set a default state.
    // For this problem, we assume valid input based on the original code's behavior.
    console.error("Initialization warning: CubeState expects an array of 6 numeric face values.");
  }

  /**
   * Simulates a vertical rotation of the cube (e.g., rolling it North, South, East, West).
   * The cube's faces are re-arranged according to the specified direction.
   *
   * @param {string} verticalMovement - The direction of the roll ('N', 'S', 'E', 'W').
   */
  this.shiftView = function(verticalMovement) {
    const faces = this.currentFaces; // Shorthand for current face values

    // A lookup table for rotation transformations.
    // Each key represents a direction, and its value is an array
    // specifying the new order of faces based on their original positions.
    // [new_top, new_front, new_right, new_left, new_back, new_bottom]
    const rotationMaps = {
      'E': [faces[3], faces[1], faces[0], faces[5], faces[4], faces[2]], // Left becomes top, Top becomes right, Right becomes bottom, Bottom becomes left
      'N': [faces[1], faces[5], faces[2], faces[3], faces[0], faces[4]], // Front becomes top, Bottom becomes front, Top becomes back, Back becomes bottom
      'S': [faces[4], faces[0], faces[2], faces[3], faces[5], faces[1]], // Back becomes top, Top becomes front, Bottom becomes back, Front becomes bottom
      'W': [faces[2], faces[1], faces[5], faces[0], faces[4], faces[3]]   // Right becomes top, Top becomes left, Left becomes bottom, Bottom becomes right
    };

    const newFaceOrder = rotationMaps[verticalMovement];
    if (newFaceOrder) {
      this.currentFaces = newFaceOrder;
    }
    // No explicit 'else' for invalid movement, as per original's switch default.
  };

  /**
   * Simulates a horizontal spin of the cube (e.g., turning it Right or Left on its axis).
   * Only the side faces change position; top and bottom remain in place.
   *
   * @param {string} horizontalSpin - The direction of the spin ('R', 'L').
   */
  this.pivotSides = function(horizontalSpin) {
    const faces = this.currentFaces; // Shorthand for current face values

    // Lookup table for horizontal spin transformations.
    // [new_top, new_front, new_right, new_left, new_back, new_bottom]
    const spinMaps = {
      'R': [faces[0], faces[3], faces[1], faces[4], faces[2], faces[5]], // Front -> Left, Right -> Front, Back -> Right, Left -> Back
      'L': [faces[0], faces[2], faces[4], faces[1], faces[3], faces[5]]  // Front -> Right, Left -> Front, Back -> Left, Right -> Back
    };

    const newFaceOrder = spinMaps[horizontalSpin];
    if (newFaceOrder) {
      this.currentFaces = newFaceOrder;
    }
  };

  /**
   * Orients the cube such that a specific value appears on its top face.
   * This involves a series of vertical rotations.
   *
   * @param {number} targetTopValue - The value that should appear on the top face.
   */
  this.orientToTop = function(targetTopValue) {
    // If the desired value is already on top, no action needed.
    if (this.currentFaces[0] === targetTopValue) {
      return;
    }

    // Check each face and apply the necessary rolls to bring the target to top.
    // This uses an if-else if structure, replacing the original switch.
    if (this.currentFaces[1] === targetTopValue) { // If front face has target value
      this.shiftView('N');
    } else if (this.currentFaces[2] === targetTopValue) { // If right face has target value
      this.shiftView('W');
    } else if (this.currentFaces[3] === targetTopValue) { // If left face has target value
      this.shiftView('E');
    } else if (this.currentFaces[4] === targetTopValue) { // If back face has target value
      this.shiftView('S');
    } else if (this.currentFaces[5] === targetTopValue) { // If bottom face has target value
      // Two North rolls effectively bring the bottom face to the top.
      this.shiftView('N');
      this.shiftView('N');
    }
    // No 'else' needed; it's assumed targetTopValue is one of the faces.
  };

  /**
   * Orients the cube such that a specific value appears on its front face,
   * without changing the current top face. This involves horizontal spins.
   *
   * @param {number} targetFrontValue - The value that should appear on the front face.
   */
  this.alignFront = function(targetFrontValue) {
    // If the desired value is already on front, no action needed.
    if (this.currentFaces[1] === targetFrontValue) {
      return;
    }

    // Only horizontal rotations are considered, as the top face is assumed to be fixed.
    if (this.currentFaces[2] === targetFrontValue) { // If right face has target value
      this.pivotSides('R');
    } else if (this.currentFaces[3] === targetFrontValue) { // If left face has target value
      this.pivotSides('L');
    } else if (this.currentFaces[4] === targetFrontValue) { // If back face has target value
      // Two Right turns effectively bring the back face to the front.
      this.pivotSides('R');
      this.pivotSides('R');
    }
  };

  // Helper getters for specific face values for external access.
  this.getTopValue = () => this.currentFaces[0];
  this.getFrontValue = () => this.currentFaces[1];
  this.getAllFaces = () => [...this.currentFaces]; // Returns a copy of all face values
}

/**
 * Utility function to compare if two CubeState objects represent the exact same orientation.
 * This is an added helper function, demonstrating Type III additions.
 *
 * @param {CubeState} cubeA - The first cube instance.
 * @param {CubeState} cubeB - The second cube instance.
 * @returns {boolean} True if all corresponding faces have identical values, false otherwise.
 */
function areCubesEquivalent(cubeA, cubeB) {
  // Basic type and structural validation.
  if (!(cubeA instanceof CubeState) || !(cubeB instanceof CubeState)) {
    console.error("Comparison error: Both arguments must be instances of CubeState.");
    return false;
  }
  if (cubeA.currentFaces.length !== cubeB.currentFaces.length) {
    return false;
  }

  // Iterate through all face positions and compare values.
  for (let faceIndex = 0; faceIndex < cubeA.currentFaces.length; faceIndex++) {
    if (cubeA.currentFaces[faceIndex] !== cubeB.currentFaces[faceIndex]) {
      return false; // Mismatch found, cubes are not equivalent.
    }
  }
  return true; // All faces match.
}

// --- Main program execution starts here ---

let bufferedInputData = ""; // Buffer to accumulate input from stdin.

// Resume stdin to start listening for data.
process.stdin.resume();
// Set encoding to handle text input.
process.stdin.setEncoding('utf-8');

// Event listener for incoming data chunks.
process.stdin.on('data', function(inputSegment) {
  bufferedInputData += inputSegment;
});

// Event listener for the end of input stream.
process.stdin.on('end', function() {
  // Split the accumulated input into lines.
  const inputLines = bufferedInputData.split('\n').filter(line => line.trim() !== '');

  // Ensure we have at least two lines of input for two cubes.
  if (inputLines.length < 2) {
    console.error("Error: Insufficient input lines. Expected at least two lines for cube configurations.");
    return;
  }

  // Parse the first line for the canonical (reference) cube.
  const canonicalCubeFaces = inputLines[0].split(' ').map(Number);
  const canonicalCube = new CubeState(canonicalCubeFaces);

  // Parse the second line for the candidate (test) cube.
  const candidateCubeFaces = inputLines[1].split(' ').map(Number);
  const candidateCube = new CubeState(candidateCubeFaces);

  let isConfigurationMatch = false; // Flag to track if a match is found.

  // The main search loop: Iterate through all 24 possible orientations of the candidate cube.
  // The outer loop handles 8 major rotations (4 'N' rolls, then 4 'W' rolls).
  for (let majorAxisRotation = 0; majorAxisRotation < 8; majorAxisRotation++) {
    // The inner loop handles 4 minor spins (turning 'R' 4 times).
    for (let minorAxisSpin = 0; minorAxisSpin < 4; minorAxisSpin++) {
      candidateCube.pivotSides('R'); // Spin the candidate cube right.

      // Check if the current orientation of the candidate cube matches the canonical cube.
      if (areCubesEquivalent(canonicalCube, candidateCube)) {
        isConfigurationMatch = true;
        break; // A match is found, no need to check further spins.
      }
    }

    // If a match was found in the inner loop, break the outer loop as well.
    if (isConfigurationMatch) {
      break;
    }

    // Apply the next major rotation to the candidate cube.
    // The first 4 iterations roll North, the next 4 roll West.
    if (majorAxisRotation < 4) {
      candidateCube.shiftView('N');
    } else {
      candidateCube.shiftView('W');
    }
  }

  // Output the final result.
  console.log(isConfigurationMatch ? 'Yes' : 'No');
});