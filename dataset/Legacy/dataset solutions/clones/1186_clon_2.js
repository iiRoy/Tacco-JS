function CubeSimulator(initialFaces) {
  // This object simulates a six-sided die with values on its faces.
  // The 'initialFaces' parameter is expected to be an array of six values.
  this.faceValues = initialFaces;

  /**
   * Rotates the simulated cube in a specified direction.
   * The 'directionCommand' parameter must be one of 'N', 'E', 'S', or 'W'.
   * Each rotation reassigns the face values based on the new orientation.
   * @param {string} directionCommand - The direction to rotate (North, East, South, West).
   */
  this.performRotation = function(directionCommand) {
    // Check the rotation command and update face values accordingly.
    if (directionCommand === 'N') {
      // North rotation: top becomes front, front becomes bottom, etc.
      this.faceValues = [this.faceValues[1], this.faceValues[5], this.faceValues[2], this.faceValues[3], this.faceValues[0], this.faceValues[4]];
    } else if (directionCommand === 'E') {
      // East rotation: top becomes right, right becomes bottom, etc.
      this.faceValues = [this.faceValues[3], this.faceValues[1], this.faceValues[0], this.faceValues[5], this.faceValues[4], this.faceValues[2]];
    } else if (directionCommand === 'S') {
      // South rotation: top becomes back, back becomes bottom, etc.
      this.faceValues = [this.faceValues[4], this.faceValues[0], this.faceValues[2], this.faceValues[3], this.faceValues[5], this.faceValues[1]];
    } else if (directionCommand === 'W') {
      // West rotation: top becomes left, left becomes bottom, etc.
      this.faceValues = [this.faceValues[2], this.faceValues[1], this.faceValues[5], this.faceValues[0], this.faceValues[4], this.faceValues[3]];
    }
  };
}

/**
 * Main processing function for the cube simulation.
 * Reads input, initializes a cube, performs rotations, and prints the top face value.
 * @param {string} rawData - The raw input string containing initial face values and rotation commands.
 */
function ProcessInput(rawData) {
  // Split the input string into lines.
  let processedLines = rawData.split("\n");

  // Initialize a new cube instance with the first line of input (face values).
  // The face values are expected to be space-separated.
  let myCube = new CubeSimulator(processedLines[0].split(" "));

  // Process the second line of input, which contains a sequence of rotation commands.
  // Each character in the string represents a single rotation.
  processedLines[1].split("").forEach(function(currentMove) {
    // Apply each rotation command to the cube.
    myCube.performRotation(currentMove);
  });

  // After all rotations, log the value of the top face (index 0) of the cube.
  console.log(myCube.faceValues[0]);
}

// Read input from standard input and pass it to the main processing function.
ProcessInput(require("fs").readFileSync("/dev/stdin", "utf8"));
