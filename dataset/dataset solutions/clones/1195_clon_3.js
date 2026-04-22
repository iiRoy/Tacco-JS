let rawInputAccumulator = ''; // Accumulates raw input from stdin
const STDIN_ENCODING = 'utf8'; // Encoding for standard input streams
const MAX_SIMULATION_DURATION_MS = 400; // Maximum time allowed for die matching simulation
const NUM_DIE_FACES = 6; // Standard number of faces on a die

// Helper function to check if two arrays of numbers are identical
const areNumericArraysEquivalent = (arrA, arrB) => {
  if (!arrA || !arrB || arrA.length !== arrB.length) {
    return false;
  }
  for (let idx = 0; idx < arrA.length; idx++) {
    if (arrA[idx] !== arrB[idx]) {
      return false;
    }
  }
  return true;
};

// Initializes a die object based on an array of 6 face values
const assembleDieStructure = (initialFaceValues) => {
  // Validate input array length
  if (!initialFaceValues || initialFaceValues.length !== NUM_DIE_FACES) {
    throw new Error(`Expected ${NUM_DIE_FACES} face values, got ${initialFaceValues ? initialFaceValues.length : 0}.`);
  }

  // Define the mapping of face indices for 'upperFaces' (top, front, bottom, back)
  // and 'sideFaces' (top, right, bottom, left) based on a consistent die orientation.
  // Note: 'upperFaces[0]' and 'sideFaces[0]' always represent the current top face value.
  // 'upperFaces[1]' is front, 'upperFaces[3]' is back.
  // 'sideFaces[1]' is right, 'sideFaces[3]' is left.
  // 'upperFaces[2]' and 'sideFaces[2]' represent the current bottom face value.
  const upperFaceIndices = [1, 5, 6, 2]; // Corresponds to face values at index 0, 4, 5, 1 in initialFaceValues
  const sideFaceIndices = [1, 3, 6, 4];   // Corresponds to face values at index 0, 2, 5, 3 in initialFaceValues

  const configuredDie = {
    upperFaces: upperFaceIndices.map(faceNum => initialFaceValues[faceNum - 1]),
    sideFaces: sideFaceIndices.map(faceNum => initialFaceValues[faceNum - 1]),
  };

  return configuredDie;
};

// Simulates rolling the die in a specified direction (N, W, S, E)
const performDieRoll = (inputDieState, movementInstruction) => {
  // Create a new state object to avoid modifying the original die state
  let nextDieState = { ...inputDieState };

  switch (movementInstruction) {
    case 'W': { // Roll to the West
      const newUpperFaces = [
        inputDieState.sideFaces[1], // Old Right face becomes new Top
        inputDieState.upperFaces[1], // Old Front face remains Front
        inputDieState.sideFaces[3], // Old Left face becomes new Bottom
        inputDieState.upperFaces[3], // Old Back face remains Back
      ];
      const newSideFaces = [
        inputDieState.sideFaces[0], // Top face of sideFaces (which is the main Top face)
        inputDieState.sideFaces[2], // Old Bottom face of sideFaces becomes new Right
        inputDieState.sideFaces[3], // Old Left face of sideFaces becomes new Bottom
        inputDieState.sideFaces[1], // Old Right face of sideFaces becomes new Left
      ];
      nextDieState.upperFaces = newUpperFaces;
      nextDieState.sideFaces = [inputDieState.sideFaces[0], ...inputDieState.sideFaces.slice(2), inputDieState.sideFaces[1]];
      break;
    }
    case 'E': { // Roll to the East
      const newUpperFaces = [
        inputDieState.sideFaces[3], // Old Left face becomes new Top
        inputDieState.upperFaces[1], // Old Front face remains Front
        inputDieState.sideFaces[1], // Old Right face becomes new Bottom
        inputDieState.upperFaces[3], // Old Back face remains Back
      ];
      const newSideFaces = [
        inputDieState.sideFaces[0], // Top face of sideFaces
        inputDieState.sideFaces[3], // Old Left face of sideFaces becomes new Right
        inputDieState.sideFaces[1], // Old Right face of sideFaces becomes new Bottom
        inputDieState.sideFaces[2], // Old Bottom face of sideFaces becomes new Left
      ];
      nextDieState.upperFaces = newUpperFaces;
      nextDieState.sideFaces = [inputDieState.sideFaces[0], inputDieState.sideFaces[3], inputDieState.sideFaces[1], inputDieState.sideFaces[2]];
      break;
    }
    case 'S': { // Roll to the South
      const newUpperFaces = [
        inputDieState.upperFaces[3], // Old Back face becomes new Top
        inputDieState.upperFaces[0], // Old Top face becomes new Front
        inputDieState.upperFaces[1], // Old Front face becomes new Bottom
        inputDieState.upperFaces[2], // Old Bottom face becomes new Back
      ];
      const newSideFaces = [
        inputDieState.upperFaces[3], // New Top face (old Back)
        inputDieState.sideFaces[1], // Right face remains Right
        inputDieState.upperFaces[1], // New Bottom face (old Front)
        inputDieState.sideFaces[3], // Left face remains Left
      ];
      nextDieState.upperFaces = [inputDieState.upperFaces[3], ...inputDieState.upperFaces.slice(0, 3)];
      nextDieState.sideFaces = [nextDieState.upperFaces[0], inputDieState.sideFaces[1], nextDieState.upperFaces[2], inputDieState.sideFaces[3]];
      break;
    }
    case 'N': { // Roll to the North
      const newUpperFaces = [
        inputDieState.upperFaces[1], // Old Front face becomes new Top
        inputDieState.upperFaces[2], // Old Bottom face becomes new Front
        inputDieState.upperFaces[3], // Old Back face becomes new Bottom
        inputDieState.upperFaces[0], // Old Top face becomes new Back
      ];
      const newSideFaces = [
        inputDieState.upperFaces[1], // New Top face (old Front)
        inputDieState.sideFaces[1], // Right face remains Right
        inputDieState.upperFaces[3], // New Bottom face (old Back)
        inputDieState.sideFaces[3], // Left face remains Left
      ];
      nextDieState.upperFaces = [...inputDieState.upperFaces.slice(1), inputDieState.upperFaces[0]];
      nextDieState.sideFaces = [nextDieState.upperFaces[0], inputDieState.sideFaces[1], nextDieState.upperFaces[2], inputDieState.sideFaces[3]];
      break;
    }
    default:
      console.warn(`Invalid rotation command received: ${movementInstruction}. Die state remains unchanged.`);
      return inputDieState; // Return original state if command is invalid
  }
  return nextDieState;
};

// Compares two die configurations by randomly rolling the first die
// until a match is found or a timeout occurs.
const compareDiceConfigurations = (die1, die2) => {
  const simulationDeadline = Date.now() + MAX_SIMULATION_DURATION_MS;
  const possibleRotations = ['N', 'W', 'S', 'E'];
  let currentDieState = { ...die1 }; // Work with a mutable copy of the first die

  // Loop until timeout or a match is found
  while (Date.now() < simulationDeadline) {
    const chosenRotation = possibleRotations[Math.floor(Math.random() * possibleRotations.length)];
    currentDieState = performDieRoll(currentDieState, chosenRotation);

    // Explicitly check all relevant face values for equality
    const isTopFaceSame = currentDieState.upperFaces[0] === die2.upperFaces[0];
    const isFrontFaceSame = currentDieState.upperFaces[1] === die2.upperFaces[1];
    const isBottomFaceSame = currentDieState.upperFaces[2] === die2.upperFaces[2];
    const isBackFaceSame = currentDieState.upperFaces[3] === die2.upperFaces[3];
    const isRightFaceSame = currentDieState.sideFaces[1] === die2.sideFaces[1];
    const isLeftFaceSame = currentDieState.sideFaces[3] === die2.sideFaces[3];

    // If all derived face values match, the dice are considered identical in this orientation
    if (isTopFaceSame && isFrontFaceSame && isBottomFaceSame && isBackFaceSame && isRightFaceSame && isLeftFaceSame) {
      return true;
    }
  }

  // No match found within the simulation duration
  return false;
};

// --- Input/Output Handling ---

// Ensure stdin is ready to receive data
process.stdin.resume();
process.stdin.setEncoding(STDIN_ENCODING);

// Event listener for incoming data chunks
process.stdin.on('data', (chunkData) => {
  rawInputAccumulator += chunkData;
});

// Event listener for end of input stream
process.stdin.on('end', () => {
  try {
    // Process the accumulated raw input
    const parsedInputLines = rawInputAccumulator
      .trim() // Remove leading/trailing whitespace
      .split('\n'); // Split into individual lines

    // Ensure we have exactly two lines of input for two dice
    if (parsedInputLines.length !== 2) {
      console.error('Error: Expected exactly two lines of input, each representing a die configuration.');
      process.exit(1); // Exit with an error code
    }

    // Parse each line into an array of numbers representing face values
    const faceValueArrays = parsedInputLines.map(inputLine =>
      inputLine.split(' ').map(numStr => {
        const parsedNum = parseInt(numStr, 10);
        if (isNaN(parsedNum)) {
          throw new Error(`Invalid number format encountered: '${numStr}'`);
        }
        return parsedNum;
      })
    );

    // Validate that each die has the correct number of face values
    if (faceValueArrays[0].length !== NUM_DIE_FACES || faceValueArrays[1].length !== NUM_DIE_FACES) {
      console.error(`Error: Each die configuration must provide ${NUM_DIE_FACES} face values.`);
      process.exit(1);
    }

    // Assemble the structured die objects
    const firstConfiguredDie = assembleDieStructure(faceValueArrays[0]);
    const secondConfiguredDie = assembleDieStructure(faceValueArrays[1]);

    // Perform the comparison and output the result
    const areDiceIdentical = compareDiceConfigurations(firstConfiguredDie, secondConfiguredDie);
    console.log(areDiceIdentical ? 'Yes' : 'No');

  } catch (error) {
    console.error(`Processing Error: ${error.message}`);
    process.exit(1);
  }
});