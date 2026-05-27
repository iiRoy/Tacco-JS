function convertStringToInteger(inputString) {
  // This utility function parses a string into a base-10 integer.
  return parseInt(inputString, 10);
}

/*
 * Function to compute the Greatest Common Divisor (GCD) of two numbers.
 * It employs the Euclidean algorithm for efficient calculation.
 */
function calculateGreatestCommonDivisor(firstValue, secondValue) {
  if (firstValue % secondValue === 0) {
    return secondValue;
  } else {
    return calculateGreatestCommonDivisor(secondValue, firstValue % secondValue);
  }
}

// Function to determine the Least Common Multiple (LCM) of two integers.
function determineLeastCommonMultiple(valA, valB) {
  return (valA * valB) / calculateGreatestCommonDivisor(valA, valB);
}

// The primary function that processes the input data and executes the main logic.
function processInputData(rawData) {
  // Extract numerical parameters from the first line of input.
  const firstLineSegments = rawData.split('\n')[0].split(' ');
  let firstCount = convertStringToInteger(firstLineSegments[0]);
  let secondCount = convertStringToInteger(firstLineSegments[1]);

  // Retrieve the two pattern strings from the input.
  let primaryPatternString = rawData.split('\n')[1];
  let secondaryPatternString = rawData.split('\n')[2];

  // Compute the common length, which is the LCM of the two counts.
  let commonLength = (firstCount > secondCount)
    ? determineLeastCommonMultiple(firstCount, secondCount)
    : determineLeastCommonMultiple(secondCount, firstCount);

  let isSequenceValid = true; // A flag to track the validity of the combined sequence.
  let characterMappingArray = []; // An array to store characters at specific indices.

  // Initialize the character mapping array with empty strings.
  for (let currentIterationIndex = 0; currentIterationIndex < commonLength; currentIterationIndex++) {
    characterMappingArray.push('');
  }

  // Populate the character mapping array based on the primary pattern string.
  characterMappingArray[0] = primaryPatternString[0];
  for (let currentIterationIndex = 1; currentIterationIndex < primaryPatternString.length; currentIterationIndex++) {
    characterMappingArray[currentIterationIndex * (commonLength / firstCount)] = primaryPatternString[currentIterationIndex];
  }

  // Check if the initial characters of both patterns match in the mapped sequence.
  if (characterMappingArray[0] !== secondaryPatternString[0]) {
    console.log('-1'); // Output -1 if there's an immediate mismatch.
  } else {
    // Iterate through the secondary pattern string to validate the sequence.
    for (let currentIterationIndex = 1; currentIterationIndex < secondaryPatternString.length; currentIterationIndex++) {
      const targetPositionInMap = currentIterationIndex * (commonLength / secondCount);
      // If a character is already mapped and it doesn't match the secondary pattern, it's invalid.
      if (characterMappingArray[targetPositionInMap] !== '' && characterMappingArray[targetPositionInMap] !== secondaryPatternString[currentIterationIndex]) {
        console.log('-1');
        isSequenceValid = false; // Mark the sequence as invalid.
        break; // Exit the loop early as a mismatch is found.
      }
    }
  }

  // If the sequence remains valid after all checks, output the common length.
  if (isSequenceValid) {
    console.log(commonLength);
  }
}

// The following line is responsible for reading input from standard input
// and then invoking the main processing function. This part should not be altered.
processInputData(require("fs").readFileSync("/dev/stdin", "utf8"));
