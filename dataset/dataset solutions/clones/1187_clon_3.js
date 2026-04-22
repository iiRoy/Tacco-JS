// Initialize standard input stream handling
process.stdin.resume();
process.stdin.setEncoding("utf8");

// Setup an interface for reading input line by line
const inputProcessor = require("readline").createInterface({
  input: process.stdin, // Specify the input source as standard input
  output: process.stdout, // Specify the output source (not strictly necessary for reading, but common)
});

// A dynamic array to accumulate all input lines received
const collectedLines = [];

// Event handler for each line of data read from the input stream
inputProcessor.on("line", (currentInputLine) => {
  collectedLines.push(currentInputLine); // Store the current line
});

// Event handler triggered when the input stream has ended and no more data is available
inputProcessor.on("close", () => {
  /**
   * Parses the initial die configuration string into a structured object.
   * @param {string} configString - The space-separated string of face values.
   * @returns {object|null} An object representing the die's initial state, or null if parsing fails.
   */
  const parseDieConfiguration = (configString) => {
    // Convert string parts to numbers
    const faceValues = configString.split(" ").map(Number);

    // Validate that exactly six face values are provided
    const EXPECTED_FACE_COUNT = 6;
    if (faceValues.length !== EXPECTED_FACE_COUNT) {
      console.error(`Error: Initial die setup requires exactly ${EXPECTED_FACE_COUNT} numbers, but ${faceValues.length} were given.`);
      return null; // Indicate parsing failure
    }

    // Map the numerical values to their descriptive face positions
    return {
      up: faceValues[0],       // Corresponds to the original 'top'
      behind: faceValues[1],   // Corresponds to the original 'back'
      right: faceValues[2],    // Corresponds to the original 'right'
      left: faceValues[3],     // Corresponds to the original 'left'
      inFront: faceValues[4],  // Corresponds to the original 'front'
      down: faceValues[5],     // Corresponds to the original 'bottom'
    };
  };

  /**
   * Simulates a North rotation of the die.
   * @param {object} currentState - The current state of the die faces.
   * @returns {object} A new die state after the North rotation.
   */
  const performNorthRotation = (currentState) => {
    const { up, behind, right, left, inFront, down } = currentState;
    return {
      up: behind,
      behind: down,
      inFront: up,
      down: inFront,
      right: right,   // Right face remains unchanged
      left: left,     // Left face remains unchanged
    };
  };

  /**
   * Simulates a South rotation of the die.
   * @param {object} currentState - The current state of the die faces.
   * @returns {object} A new die state after the South rotation.
   */
  const performSouthRotation = (currentState) => {
    const { up, behind, right, left, inFront, down } = currentState;
    return {
      up: inFront,
      behind: up,
      inFront: down,
      down: behind,
      right: right,   // Right face remains unchanged
      left: left,     // Left face remains unchanged
    };
  };

  /**
   * Simulates a West rotation of the die.
   * @param {object} currentState - The current state of the die faces.
   * @returns {object} A new die state after the West rotation.
   */
  const performWestRotation = (currentState) => {
    const { up, behind, right, left, inFront, down } = currentState;
    return {
      up: right,
      behind: behind, // Back face remains unchanged
      inFront: inFront, // Front face remains unchanged
      down: left,
      right: down,
      left: up,
    };
  };

  /**
   * Simulates an East rotation of the die.
   * @param {object} currentState - The current state of the die faces.
   * @returns {object} A new die state after the East rotation.
   */
  const performEastRotation = (currentState) => {
    const { up, behind, right, left, inFront, down } = currentState;
    return {
      up: left,
      behind: behind, // Back face remains unchanged
      inFront: inFront, // Front face remains unchanged
      down: right,
      right: up,
      left: down,
    };
  };

  // --- Core application logic starts here ---

  // Ensure minimum required input lines are present
  const MIN_INPUT_LINES = 2;
  if (collectedLines.length < MIN_INPUT_LINES) {
    console.error(`Error: Expected at least ${MIN_INPUT_LINES} lines of input, but received ${collectedLines.length}.`);
    return; // Terminate execution if input is insufficient
  }

  // Attempt to parse the initial die configuration from the first input line
  let currentDieState = parseDieConfiguration(collectedLines[0]);
  if (!currentDieState) {
    return; // Terminate if initial configuration parsing failed
  }

  // Extract the sequence of rotation commands from the second input line
  const rotationInstructions = collectedLines[1];

  // Process each instruction in the sequence
  for (let stepIdx = 0; stepIdx < rotationInstructions.length; stepIdx++) {
    const currentInstruction = rotationInstructions[stepIdx];

    // Apply the appropriate rotation based on the instruction character
    switch (currentInstruction) {
      case "N":
        currentDieState = performNorthRotation(currentDieState);
        break;
      case "S":
        currentDieState = performSouthRotation(currentDieState);
        break;
      case "W":
        currentDieState = performWestRotation(currentDieState);
        break;
      case "E":
        currentDieState = performEastRotation(currentDieState);
        break;
      default:
        // Log a warning for any unrecognized rotation commands
        console.warn(`Warning: Unrecognized rotation command '${currentInstruction}' found at instruction index ${stepIdx}. This instruction will be skipped.`);
        break;
    }
  }

  // After all rotations are complete, display the value of the face that is currently upwards
  console.log(currentDieState.up);
});