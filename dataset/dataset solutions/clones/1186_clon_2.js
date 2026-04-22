function CubeSimulator(initialFaces) {
  // This object represents a six-sided cube, tracking its current face orientation.
  // The 'currentFaces' array stores the values of the cube's sides in a specific order:
  // [Top, North, East, West, South, Bottom].
  this.currentFaces = initialFaces;

  // Defines a method to reorient the cube based on a given direction.
  this.performRotation = function(movementDirection) {
    // A series of conditional checks to apply the correct rotational transformation.
    // Each case reassigns the 'currentFaces' array based on the new physical orientation.

    if (movementDirection === 'N') {
      // Rotate North: Top moves to South, South moves to Bottom, Bottom moves to North, North moves to Top.
      this.currentFaces = [this.currentFaces[1], this.currentFaces[5], this.currentFaces[2], this.currentFaces[3], this.currentFaces[0], this.currentFaces[4]];
    } else if (movementDirection === 'E') {
      // Rotate East: Top moves to West, West moves to Bottom, Bottom moves to East, East moves to Top.
      this.currentFaces = [this.currentFaces[3], this.currentFaces[1], this.currentFaces[0], this.currentFaces[5], this.currentFaces[4], this.currentFaces[2]];
    } else if (movementDirection === 'S') {
      // Rotate South: Top moves to North, North moves to Bottom, Bottom moves to South, South moves to Top.
      this.currentFaces = [this.currentFaces[4], this.currentFaces[0], this.currentFaces[2], this.currentFaces[3], this.currentFaces[5], this.currentFaces[1]];
    } else if (movementDirection === 'W') {
      // Rotate West: Top moves to East, East moves to Bottom, Bottom moves to West, West moves to Top.
      this.currentFaces = [this.currentFaces[2], this.currentFaces[1], this.currentFaces[5], this.currentFaces[0], this.currentFaces[4], this.currentFaces[3]];
    }
  };
}

function RunCubeChallenge(inputString) {
  // The primary function to process input and simulate cube rotations.
  // It takes a string of input data, parses it, and applies a sequence of moves.

  // Split the entire input string into individual lines.
  const processedLines = inputString.split("\n");

  // Create a new instance of the CubeSimulator,
  // initializing its faces with the values from the first line of input.
  let activeCube = new CubeSimulator(processedLines[0].split(" "));

  // Process the second line of input, which contains the sequence of rotation commands.
  processedLines[1].split("").forEach(function(singleInstruction) {
    // For each character (rotation command) in the sequence,
    // instruct the active cube to perform the corresponding rotation.
    activeCube.performRotation(singleInstruction);
  });

  // After all rotations are complete,
  // output the value of the topmost face of the cube.
  console.log(activeCube.currentFaces[0]);
}

// Entry point for the application:
// Read input from standard input, decode it as UTF-8, and pass it to the main processing function.
RunCubeChallenge(require("fs").readFileSync("/dev/stdin", "utf8"));