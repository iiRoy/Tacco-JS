// Helper function to parse the initial face configuration from a string.
// It expects a string where face values are separated by spaces.
function parseFaceConfiguration(configLine) {
  // Validate input: ensure the configuration line is a non-empty string.
  if (typeof configLine !== 'string' || configLine.trim() === '') {
    console.error("Error: Invalid or empty configuration line provided for cube faces.");
    // Return an empty array to indicate a parsing failure.
    return [];
  }
  // Split the line by spaces to get individual face values.
  const facesArray = configLine.trim().split(" ");

  // A standard cube has 6 faces. We might add more specific validation here.
  if (facesArray.length !== 6) {
    console.warn(`Warning: Expected 6 face values, but found ${facesArray.length}.`);
  }
  return facesArray;
}

/**
 * Represents a six-sided die (cube) and manages its orientation through rotations.
 * The internal array stores faces in a specific order: [Top, Front, Right, Left, Back, Bottom].
 */
class FaceCube {
  constructor(initialFaceValues) {
    // Perform robust validation for the initial face values array.
    if (!Array.isArray(initialFaceValues) || initialFaceValues.length !== 6) {
      // If validation fails, initialize with default unknown faces and log an error.
      console.error("Initialization Error: FaceCube requires an array of exactly 6 face values.");
      this.faceArrangement = Array(6).fill("?"); // Default unknown faces
    } else {
      // Create a shallow copy to prevent external modification of the internal state.
      this.faceArrangement = Array.from(initialFaceValues);
    }
  }

  /**
   * Applies a rotational movement to the cube based on a given command.
   * The commands 'N', 'E', 'S', 'W' correspond to rolling the cube North, East, South, or West.
   * @param {string} rotationCommand - The single character command for rotation.
   */
  applyRotation(rotationCommand) {
    // Create a temporary reference to the current face state for easier manipulation.
    const currentFaces = this.faceArrangement;
    let updatedFaceOrder; // This array will hold the new state after rotation.

    // Use a switch statement for clearer handling of different rotation commands.
    switch (rotationCommand) {
      case 'N': // Roll the cube towards North (Front becomes Top, Top becomes Back, etc.)
        updatedFaceOrder = [currentFaces[1], currentFaces[5], currentFaces[2], currentFaces[3], currentFaces[0], currentFaces[4]];
        break;
      case 'E': // Roll the cube towards East (Right becomes Top, Top becomes Left, etc.)
        updatedFaceOrder = [currentFaces[3], currentFaces[1], currentFaces[0], currentFaces[5], currentFaces[4], currentFaces[2]];
        break;
      case 'S': // Roll the cube towards South (Back becomes Top, Top becomes Front, etc.)
        updatedFaceOrder = [currentFaces[4], currentFaces[0], currentFaces[2], currentFaces[3], currentFaces[5], currentFaces[1]];
        break;
      case 'W': // Roll the cube towards West (Left becomes Top, Top becomes Right, etc.)
        updatedFaceOrder = [currentFaces[2], currentFaces[1], currentFaces[5], currentFaces[0], currentFaces[4], currentFaces[3]];
        break;
      default:
        // Log a warning for unrecognized commands and retain the current orientation.
        console.warn(`Warning: Unrecognized rotation command '${rotationCommand}'. Cube orientation remains unchanged.`);
        updatedFaceOrder = currentFaces; // No change in orientation
        break;
    }
    // Update the cube's internal state with the newly calculated face arrangement.
    this.faceArrangement = updatedFaceOrder;
  }

  /**
   * Retrieves the value of the face currently positioned at the top of the cube.
   * @returns {string} The value of the top face.
   */
  getTopFace() {
    // By convention, the top face is always at index 0 of our internal array.
    return this.faceArrangement[0];
  }
}

/**
 * Orchestrates the dice simulation process from raw input data.
 * It parses initial cube faces and a sequence of movement commands,
 * then applies these movements and outputs the final top face value.
 * @param {string} fullInputString - The entire input content as a single string.
 */
function executeDiceSimulation(fullInputString) {
  // Input validation: ensure we have meaningful input data.
  if (typeof fullInputString !== 'string' || fullInputString.trim() === '') {
    console.error("Execution Aborted: No valid input data provided for the simulation.");
    return;
  }

  // Split the input string into separate lines.
  const inputLines = fullInputString.split("\n");

  // A valid input must contain at least two lines: one for faces, one for movements.
  if (inputLines.length < 2) {
    console.error("Execution Aborted: Insufficient input lines. Expected at least two lines of data.");
    return;
  }

  // Use the helper function to parse the initial face configuration from the first line.
  const initialFaceValues = parseFaceConfiguration(inputLines[0]);

  // Create a new FaceCube instance with the parsed initial values.
  const simulatedCube = new FaceCube(initialFaceValues);

  // Extract the sequence of movement commands from the second line, removing leading/trailing whitespace.
  const movementSequence = inputLines[1].trim();

  // If there are no movement commands, simply output the initial top face.
  if (movementSequence.length === 0) {
    console.log(simulatedCube.getTopFace());
    return;
  }

  // Iterate through each character in the movement sequence and apply the corresponding rotation.
  for (const movementChar of movementSequence) {
    simulatedCube.applyRotation(movementChar);
  }

  // After all rotations are applied, retrieve the final value of the top face.
  const finalResultingFace = simulatedCube.getTopFace();

  // Output the final top face value as required.
  console.log(finalResultingFace);
}

// Define the standard input path, typically used in competitive programming environments.
const STDIN_FILE_PATH = "/dev/stdin";

// Main program execution block.
try {
  // Attempt to read the entire content of the standard input file synchronously.
  // Specify 'utf8' encoding to handle text data correctly.
  const rawProgramInput = require("fs").readFileSync(STDIN_FILE_PATH, "utf8");

  // Invoke the main simulation function with the obtained input data.
  executeDiceSimulation(rawProgramInput);
} catch (readingError) {
  // Catch and report any errors that occur during file reading or subsequent processing.
  console.error(`An unexpected error prevented the program from running: ${readingError.message}`);
  // For debugging, the full stack trace could be logged: console.error(readingError.stack);
}