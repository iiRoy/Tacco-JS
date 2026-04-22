// A constructor function, analogous to a class, for simulating a six-sided object (like a die)
// and managing its orientation through rotations.
function SixSidedObject(initialConfiguration) {
  // Define a constant for the expected number of faces.
  const EXPECTED_FACE_COUNT = 6;

  // Perform input validation for the initial configuration array.
  // If the input is not an array or doesn't have the correct number of elements,
  // initialize with a default configuration and log an error.
  if (!Array.isArray(initialConfiguration) || initialConfiguration.length !== EXPECTED_FACE_COUNT) {
    console.error("Initialization Error: Expected an array of 6 numbers for face values. Using default values.");
    this.upperFace     = 1; // Default value for the top face
    this.forwardFace   = 2; // Default value for the front face
    this.starboardFace = 3; // Default value for the right face
    this.portFace      = 4; // Default value for the left face
    this.aftFace       = 5; // Default value for the back face
    this.lowerFace     = 6; // Default value for the bottom face
  } else {
    // Assign the provided initial values to the object's distinct faces.
    this.upperFace     = initialConfiguration[0]; // Corresponds to original 'top'
    this.forwardFace   = initialConfiguration[1]; // Corresponds to original 'front'
    this.starboardFace = initialConfiguration[2]; // Corresponds to original 'right'
    this.portFace      = initialConfiguration[3]; // Corresponds to original 'left'
    this.aftFace       = initialConfiguration[4]; // Corresponds to original 'back'
    this.lowerFace     = initialConfiguration[5]; // Corresponds to original 'bottom'
  }

  // A private helper function (closure) to abstract the common cyclic shift logic
  // for four faces during a rotation. This improves code reusability and readability.
  const performFourFaceCyclicShift = (faceKey1, faceKey2, faceKey3, faceKey4) => {
    const temporaryStorage = this[faceKey1]; // Store the value of the first face.
    this[faceKey1] = this[faceKey4];         // Face 1 receives value from Face 4.
    this[faceKey4] = this[faceKey3];         // Face 4 receives value from Face 3.
    this[faceKey3] = this[faceKey2];         // Face 3 receives value from Face 2.
    this[faceKey2] = temporaryStorage;       // Face 2 receives the original value of Face 1.
  };

  // A Map to store the specific rotation logic for each direction.
  // This replaces the original switch statement, making the rotation mechanism
  // more dynamic and easier to extend or modify.
  const rotationActionRegistry = new Map([
    // 'E' (East) rotation: Upper -> Port -> Lower -> Starboard -> Upper
    ['E', () => performFourFaceCyclicShift('upperFace', 'portFace', 'lowerFace', 'starboardFace')],
    // 'N' (North) rotation: Upper -> Forward -> Lower -> Aft -> Upper
    ['N', () => performFourFaceCyclicShift('upperFace', 'forwardFace', 'lowerFace', 'aftFace')],
    // 'S' (South) rotation: Upper -> Aft -> Lower -> Forward -> Upper
    ['S', () => performFourFaceCyclicShift('upperFace', 'aftFace', 'lowerFace', 'forwardFace')],
    // 'W' (West) rotation: Upper -> Starboard -> Lower -> Port -> Upper
    ['W', () => performFourFaceCyclicShift('upperFace', 'starboardFace', 'lowerFace', 'portFace')]
  ]);

  /**
   * Applies a specified rotation to the six-sided object's orientation.
   * @param {string} rotationAxisIdentifier - A single character ('E', 'N', 'S', 'W')
   *                                         indicating the direction of rotation.
   */
  this.applyRotation = function(rotationAxisIdentifier) {
    // Validate the rotation identifier. If it's not recognized, log a warning
    // and skip the rotation to prevent unexpected behavior.
    if (!rotationActionRegistry.has(rotationAxisIdentifier)) {
      console.warn(`Skipping unknown rotation identifier: '${rotationAxisIdentifier}'.`);
      return; // Exit early for invalid input.
    }
    // Execute the corresponding rotation function from the registry.
    rotationActionRegistry.get(rotationAxisIdentifier)();
  };

  /**
   * Retrieves the current value displayed on the object's upper face.
   * This method provides a clean interface to query the object's state.
   * @returns {number} The integer value of the upper face.
   */
  this.getCurrentUpperFaceValue = function() {
    return this.upperFace;
  };
}

// --- Node.js Standard Input Processing ---

let accumulatedInputData = ""; // A buffer to collect all data from standard input.

// Activate the standard input stream and set its encoding for text processing.
process.stdin.resume();
process.stdin.setEncoding('utf-8');

// Event handler for when data chunks are received from standard input.
process.stdin.on('data', function(chunk) {
  accumulatedInputData += chunk; // Append the new data chunk to the buffer.
});

// Event handler for when the standard input stream has ended.
// This is where the main simulation logic is triggered after all input is received.
process.stdin.on('end', function() {

  /**
   * Parses the raw input string into structured data for the simulation.
   * Includes robust error checking for input format and types.
   * @param {string} rawString - The complete string received from standard input.
   * @returns {object|null} An object containing `initialFaceValues` and `rotationSequence`,
   *                        or `null` if parsing fails due to errors.
   */
  const parseSimulationInput = (rawString) => {
    // Split the input string into lines, removing any leading/trailing whitespace.
    const inputLines = rawString.trim().split("\n");

    // Guard clause: Ensure there are at least two lines of input.
    if (inputLines.length < 2) {
      console.error("Input Error: Expected at least two lines of input (initial faces, then rotations).");
      return null;
    }

    // Process the first line to get the initial face values.
    // Filter out empty strings that might result from multiple spaces, then convert to numbers.
    const potentialFaceValues = inputLines[0].split(' ').filter(s => s.trim() !== '').map(str => {
      const numValue = Number(str);
      // Validate that each part is indeed a number.
      if (isNaN(numValue)) {
        console.error(`Input Error: Non-numeric value '${str}' found in initial face configuration.`);
        return NaN; // Use NaN to indicate a parsing failure for this specific value.
      }
      return numValue;
    });

    // Final validation for initial face values: must be 6 valid numbers.
    if (potentialFaceValues.some(isNaN) || potentialFaceValues.length !== 6) {
      console.error("Input Error: Invalid or incomplete initial face configuration. Expected 6 numbers.");
      return null;
    }

    // Process the second line to get the sequence of rotation characters.
    // Ensure the line is not empty before splitting into characters.
    const rotationInstructions = inputLines[1].trim() !== '' ? inputLines[1].split('') : [];

    return {
      initialFaceValues: potentialFaceValues,
      rotationSequence: rotationInstructions
    };
  };

  /**
   * Orchestrates the simulation process: parsing input, initializing the object,
   * applying rotations, and displaying the final result.
   */
  const runDiceSimulation = () => {
    const parsedData = parseSimulationInput(accumulatedInputData);

    // If input parsing failed, log an overall error and stop the simulation.
    if (!parsedData) {
      console.error("Simulation aborted due to critical input errors.");
      return;
    }

    // Create an instance of our six-sided object simulator using the parsed values.
    const currentBlockSimulator = new SixSidedObject(parsedData.initialFaceValues);

    // Apply each rotation instruction from the sequence.
    // Using forEach for iteration, which is a common modern JavaScript practice.
    parsedData.rotationSequence.forEach((rotationChar, index) => {
      // Optional: Add a debug log for each step of the rotation.
      // console.log(`Step ${index + 1}: Applying rotation '${rotationChar}'...`);
      currentBlockSimulator.applyRotation(rotationChar);
    });

    // After all rotations are complete, display the value on the object's upper face.
    console.log(`The final value on the upper face is: ${currentBlockSimulator.getCurrentUpperFaceValue()}`);
  };

  // Initiate the simulation process.
  runDiceSimulation();
});