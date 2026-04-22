// This script processes numerical input to determine specific conditions for two moving entities.

// Acquire the file system module to read data.
const fileContent = require("fs"). readFileSync ("/dev/stdin", "utf8");

// Initialize a list of tokens extracted from the input and a current index pointer.
let dataTokens = fileContent. split ( / |\n/ );
let currentIndex = 0;

/**
 * Retrieves the subsequent token from the tokenized input array.
 * Increases the internal pointer after retrieval.
 * @returns {string} The next available token.
 */
const retrieveNextToken = () => dataTokens[currentIndex++];

/**
 * Extracts a specified quantity of numerical tokens from the data stream.
 * Each token is converted into an integer.
 * @param {number} requiredAmount - The count of numeric values to fetch.
 * @returns {number[]} An array containing the converted integer values.
 */
const fetchNumericValues = (requiredAmount) =>
  dataTokens. slice ( currentIndex, (currentIndex += requiredAmount) ). map ( (item) => parseInt(item) );

// Parse the five essential parameters: initial positions, speeds, and the maximum time duration.
const [ travelerOnePosition, travelerOneVelocity, travelerTwoPosition, travelerTwoVelocity, maxDuration ] = fetchNumericValues(5);

// A boolean flag to indicate if the entities ever occupy the same spatial coordinate.
let didOverlapOccur = false;

// Iterate through each discrete time step, from zero up to (but not including) the maximum duration.
for (let currentTimeStep = 0; currentTimeStep < maxDuration; currentTimeStep++) {
  // Check if the calculated positions of both entities are identical at the current time step.
  // Position = Initial_Position + Speed * Time_Step
  if (
    (travelerOnePosition + travelerOneVelocity * currentTimeStep) ===
    (travelerTwoPosition + travelerTwoVelocity * currentTimeStep)
  ) {
    didOverlapOccur = true; // Set the flag to true if an overlap is detected.
  }
}

// If no overlap was found at any point within the allowed time, output 'NO' and terminate.
if (!didOverlapOccur) return console.log('NO');

// After evaluating all time steps, determine the final outcome based on positions at max duration.
// This check verifies if the first entity's final position is greater than or equal to the second's.
if (
  (travelerOnePosition + travelerOneVelocity * maxDuration) >=
  (travelerTwoPosition + travelerTwoVelocity * maxDuration)
) {
  console.log('YES'); // The first entity successfully reached or surpassed the second.
} else {
  console.log('NO'); // The first entity remained behind the second.
}