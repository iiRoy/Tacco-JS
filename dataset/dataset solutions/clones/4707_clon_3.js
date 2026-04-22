// Utility functions for handling input/output operations.
// These are provided to simulate a competitive programming environment's I/O.

// Module for reading input line by line.
const inputSource = require('readline').createInterface({
  input: process.stdin,
  output: process.stdout
});

// Storage for all raw input lines.
let inputBuffer = [];
// Global input stream processor instance.
let streamProcessor;

// Event listener for each incoming line of input.
inputSource.on('line', (incomingLine) => {
  rawInputLines.push(incomingLine);
});

// Event listener for when input stream closes.
inputSource.on('close', () => {
  // Initialize the input stream processor with all collected lines.
  streamProcessor = createInputParser(rawInputLines);
  // Execute the main problem-solving logic.
  SolveSheepWolfProblem();
});

/**
 * Creates an object to parse input lines sequentially.
 * @param {string[]} lines The array of raw input strings.
 * @returns {object} An object with methods to check for more input and retrieve the next line.
 */
function createInputParser(lines) {
  return {
    sourceData: lines,
    currentPosition: 0,
    totalLines: lines.length,

    /**
     * Checks if there are more lines available in the input stream.
     * @returns {boolean} True if more lines exist, false otherwise.
     */
    hasMoreLines: function() {
      return (this.currentPosition < this.totalLines);
    },

    /**
     * Retrieves the next line from the input stream.
     * @returns {string} The next line of input.
     * @throws {Error} If no more input lines are available.
     */
    getNextLine: function() {
      if (this.hasMoreLines()) {
        return this.sourceData[this.currentPosition++];
      } else {
        throw new Error('End of Input Stream: No more lines to read.');
      }
    }
  };
}

/**
 * Retrieves the next raw input line.
 * @returns {string} The next line.
 */
function getNextLine() {
  return streamProcessor.getNextLine();
}

/**
 * Outputs a string to the console, followed by a newline.
 * @param {string} message The string to output.
 */
function outputResult(message) {
  console.log(message);
}

// Constants for animal types.
const SHEEP_TYPE = "S";
const WOLF_TYPE = "W";

/**
 * Converts an input value based on a specified conversion type.
 * @param {string|string[]} inputValue The input to convert.
 * @param {number} conversionType An integer indicating the desired conversion.
 *   1: Parse as integer.
 *   2: Split string by spaces into an array of strings.
 *   4: Split string by spaces and parse each part as an integer array.
 *   6: Split string into an array of individual characters.
 *   8: Join array elements with spaces.
 *   9: Join array elements with newlines.
 *   0: Join array elements with no separator.
 * @returns {*} The converted value.
 */
function dataConverter(inputValue, conversionType) {
  try {
    switch (conversionType) {
      case 1:
        return parseInt(inputValue, 10);
      case 2:
        return inputValue.split(' ');
      case 4:
        return inputValue.split(' ').map(Number);
      case 6:
        return inputValue.split('');
      case 8:
        return inputValue.join(' ');
      case 9:
        return inputValue.join('\n');
      case 0:
        return inputValue.join('');
      default:
        // For unknown types, return the original value.
        console.warn(`Warning: Unknown conversion type ${conversionType}. Returning original value.`);
        return inputValue;
    }
  } catch (error) {
    // Log conversion errors but return original value to avoid crashing.
    console.error(`Error during data conversion for type ${conversionType}:`, error.message);
    return inputValue;
  }
}

/**
 * Reads the next line and converts it to an integer.
 * @returns {number} The integer value.
 */
function readInteger() {
  return dataConverter(getNextLine(), 1);
}

/**
 * Reads the next line and converts it to an array of characters.
 * @returns {string[]} An array of characters.
 */
function readCharacterSequence() {
  return dataConverter(getNextLine(), 6);
}

/**
 * Determines the type of the next animal in the sequence based on previous states and an observation.
 * This logic directly translates the original problem's specific state transition rules.
 *
 * @param {string} typeOfPreviousAnimal The type of the animal at position `j`.
 * @param {string} typeOfCurrentAnimal The type of the animal at position `j+1`.
 * @param {string} currentObservation The observation associated with the current position `j`.
 * @returns {string} The determined type for the animal at position `j+2` (SHEEP_TYPE or WOLF_TYPE).
 */
function deriveNextAnimalType(typeOfPreviousAnimal, typeOfCurrentAnimal, currentObservation) {
  // Check if the previous two animal types are identical.
  const areAdjacentTypesIdentical = (typeOfPreviousAnimal === typeOfCurrentAnimal);
  let nextDerivedType;

  // Apply the specific rules defined in the original problem.
  if (currentObservation === "o") { // If observation is "o"
    if (areAdjacentTypesIdentical) {
      nextDerivedType = SHEEP_TYPE;
    } else {
      nextDerivedType = WOLF_TYPE;
    }
  } else { // If observation is "x"
    if (areAdjacentTypesIdentical) {
      nextDerivedType = WOLF_TYPE;
    } else {
      nextDerivedType = SHEEP_TYPE;
    }
  }
  return nextDerivedType;
}

/**
 * Main function to solve the Sheep and Wolf problem.
 * It attempts to find a valid arrangement of sheep and wolves that matches
 * a given set of observations in a circular arrangement.
 */
function SolveSheepWolfProblem() {
  // Read the total number of animals (N).
  const animalCount = readInteger();

  // Basic validation for animal count.
  if (animalCount <= 0) {
    outputResult(-1);
    return;
  }

  // Read the sequence of observations.
  const observationPattern = readCharacterSequence();

  // Define the four possible starting configurations for the first two animals.
  // Each configuration is a pair of (Animal 0 Type, Animal 1 Type).
  const initialConfigurations = [
    [SHEEP_TYPE, SHEEP_TYPE],
    [SHEEP_TYPE, WOLF_TYPE],
    [WOLF_TYPE, SHEEP_TYPE],
    [WOLF_TYPE, WOLF_TYPE]
  ];

  // Iterate through each initial configuration to find a valid solution.
  for (let configIndex = 0; configIndex < initialConfigurations.length; ++configIndex) {
    // Create an array to store the types of all animals,
    // including two extra elements for circularity checks (N and N+1).
    const derivedAnimalTypes = Array.from({
      length: animalCount + 2
    });

    // Set the types for the first two animals based on the current initial configuration.
    derivedAnimalTypes[0] = initialConfigurations[configIndex][0];
    derivedAnimalTypes[1] = initialConfigurations[configIndex][1];

    // Propagate the animal types through the sequence based on observations.
    // The loop iterates from animalPosition 0 to N-1.
    // For each animalPosition 'j', we determine the type of animal 'j+2'.
    for (let animalPosition = 0; animalPosition < animalCount; ++animalPosition) {
      derivedAnimalTypes[animalPosition + 2] = deriveNextAnimalType(
        derivedAnimalTypes[animalPosition],      // Type of animal at 'j'
        derivedAnimalTypes[animalPosition + 1],  // Type of animal at 'j+1'
        observationPattern[animalPosition]       // Observation associated with animal 'j' (or 'j+1' depending on problem interpretation)
      );
    }

    // After propagating, check if the circular conditions are met.
    // Animal N should match Animal 0, and Animal N+1 should match Animal 1.
    const isCircularlyConsistent = (
      derivedAnimalTypes[0] === derivedAnimalTypes[animalCount] &&
      derivedAnimalTypes[1] === derivedAnimalTypes[animalCount + 1]
    );

    if (isCircularlyConsistent) {
      // If a consistent solution is found, extract the N animal types
      // (excluding the two extra elements used for circularity) and output them.
      // Use slice to create a new array without the last two elements.
      const finalSequence = derivedAnimalTypes.slice(0, animalCount);
      outputResult(finalSequence.join(""));
      return; // A solution has been found, so exit the function.
    }
  }

  // If no solution is found after trying all initial configurations, output -1.
  outputResult(-1);
}