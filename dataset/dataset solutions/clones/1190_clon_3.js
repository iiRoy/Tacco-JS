process.stdin.resume();
process.stdin.setEncoding("utf8");

const lineReaderInterface = require("readline").createInterface({
  input: process.stdin,
  output: process.stdout,
});

const bufferedInputLines = [];

lineReaderInterface.on("line", (currentLine) => {
  bufferedInputLines.push(currentLine);
});

lineReaderInterface.on("close", () => {
  // --- Input Validation and Parsing ---
  if (bufferedInputLines.length < 2) {
    console.error("Error: Insufficient input. Expected at least two lines for die setup and operation count.");
    process.exit(1);
  }

  // Extract the initial die face configuration
  const initialFaceConfiguration = bufferedInputLines[0].split(" ");
  if (initialFaceConfiguration.length !== 6) {
    console.error("Error: Initial die configuration must specify exactly 6 faces.");
    process.exit(1);
  }

  // Assign descriptive names to the die faces
  const [
    upperSurface,     // Corresponds to original 'top'
    forwardSurface,   // Corresponds to original 'front'
    starboardSurface, // Corresponds to original 'right'
    portSurface,      // Corresponds to original 'left'
    rearSurface,      // Corresponds to original 'back'
    lowerSurface,     // Corresponds to original 'bottom'
  ] = initialFaceConfiguration;

  // Convert the number of operations to an integer
  const numberOfRotationCommands = Number(bufferedInputLines[1]);
  if (isNaN(numberOfRotationCommands) || numberOfRotationCommands < 0) {
    console.error("Error: Number of rotation commands must be a non-negative integer.");
    process.exit(1);
  }

  // Verify that enough input lines are available for all operations
  if (bufferedInputLines.length < 2 + numberOfRotationCommands) {
    console.error("Error: Not enough rotation commands provided for the specified number of operations.");
    process.exit(1);
  }

  // --- Helper function to determine the active rotational plane ---
  // This function replaces the nested ternary logic for s1, s2, s3 selection.
  // It returns an array representing the four faces that rotate around a fixed axis.
  const selectRotationPlane = (fixedReferenceFace) => {
    switch (fixedReferenceFace) {
      case upperSurface:
      case lowerSurface:
        // If 'top' or 'bottom' is the reference, the horizontal plane rotates.
        return [forwardSurface, starboardSurface, rearSurface, portSurface];
      case forwardSurface:
      case rearSurface:
        // If 'front' or 'back' is the reference, the vertical plane along right-left axis rotates.
        return [upperSurface, starboardSurface, lowerSurface, portSurface];
      case starboardSurface:
      case portSurface:
        // If 'right' or 'left' is the reference, the vertical plane along front-back axis rotates.
        return [upperSurface, forwardSurface, lowerSurface, rearSurface];
      default:
        // This case indicates an unexpected face identifier in the input.
        console.error(`Internal Logic Error: Unrecognized face '${fixedReferenceFace}' used as a rotation reference.`);
        process.exit(1);
    }
  };

  // --- Process each rotation operation ---
  // Loop through the rotation commands, starting from the third line of input.
  for (let commandIndex = 0; commandIndex < numberOfRotationCommands; ++commandIndex) {
    const currentCommandLine = bufferedInputLines[2 + commandIndex];
    const [rotationIndicatorFace, fixedObservationFace] = currentCommandLine.split(" ");

    // Determine which set of faces is currently in play for the rotation.
    const activeRotationalSlice = selectRotationPlane(rotationIndicatorFace);

    // Find the position of the fixed observation face within this slice.
    let observationFaceCurrentPosition = activeRotationalSlice.indexOf(fixedObservationFace);

    if (observationFaceCurrentPosition === -1) {
        console.error(`Error: Fixed observation face '${fixedObservationFace}' not found in the active rotational slice for indicator face '${rotationIndicatorFace}'.`);
        process.exit(1);
    }

    // Determine the direction of rotation.
    // The original logic checks if 't' was 'top', 'right', or 'back' for one direction.
    const isClockwiseShift = (
      rotationIndicatorFace === upperSurface ||
      rotationIndicatorFace === starboardSurface ||
      rotationIndicatorFace === rearSurface
    );

    let resultingFacePosition;
    if (isClockwiseShift) {
      // Clockwise rotation (move to the next element, wrapping around).
      resultingFacePosition = (observationFaceCurrentPosition + 1) % activeRotationalSlice.length;
    } else {
      // Counter-clockwise rotation (move to the previous element, wrapping around).
      // Adding `activeRotationalSlice.length` handles negative results from `-1` before modulo.
      resultingFacePosition = (observationFaceCurrentPosition - 1 + activeRotationalSlice.length) % activeRotationalSlice.length;
    }

    // Output the face that ends up at the determined position.
    console.log(activeRotationalSlice[resultingFacePosition]);
  }
});

// Optional: Global error handler for unexpected issues during execution.
process.on('uncaughtException', (error) => {
    console.error('An unexpected runtime error occurred:', error.message);
    // For debugging, uncomment the following line:
    // console.error(error.stack);
    process.exit(1);
});