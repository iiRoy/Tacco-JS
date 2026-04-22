let rawInput = [  ]; // Accumulates raw lines of text from standard input.
const PRIME_MODULUS = 1000000007; // A large prime constant used for modular arithmetic operations.

let maxDepthLimit, constraintCount; // Stores the two primary numerical parameters from the first input line.
let forbiddenIndices; // An array of numerical values representing positions that are blocked.
let solutionCache; // A memoization table (array) to store previously computed results.
const consoleInputModule = require('readline'); // Imports the 'readline' module for handling input.

// Sets up an interface object to process input and output streams.
const inputProcessorInstance = consoleInputModule.createInterface(
  {
    input  : process.stdin, // Designates standard input as the source.
    output : process.stdout, // Designates standard output for any internal logging (though not used here).
  }
);

// Attaches an event handler for each line of data received from the input stream.
inputProcessorInstance.on('line', (incomingLine) => {
  rawInput.push(incomingLine); // Appends the current line to our input buffer.
} );

// Attaches an event handler for when the input stream has ended and is closed.
inputProcessorInstance.on('close', ( ) => {
  maxDepthLimit = parseInt(rawInput[0].split(" ")[0], 10); // Parses the first numerical parameter from the first line.
  constraintCount = parseInt(rawInput[0].split(" ")[1], 10); // Parses the second numerical parameter from the first line.
  rawInput.shift(); // Removes the first line, as its parameters have been extracted.
  forbiddenIndices = rawInput.map(inputItem => parseInt(inputItem, 10)); // Converts remaining input lines into an array of integers.

  solutionCache = Array(maxDepthLimit).fill(0); // Initializes the memoization table with zeros, sized by maxDepthLimit.
  console.log(computeValidPaths(0)); // Initiates the recursive computation from the starting position (0) and prints the final result.
});

// Recursive function to calculate the number of valid paths from a given position.
function computeValidPaths(currentStep) {
  // If the result for this 'currentStep' has already been computed and cached, return it directly.
  if (solutionCache[currentStep]) {
    return solutionCache[currentStep];
  }

  // Base case: If the current step has exceeded the maximum allowed depth, it's an invalid path.
  if (maxDepthLimit < currentStep) {
    return 0;
  }

  // Base case: If the current step has reached the target maximum depth, one valid path is found.
  if (currentStep === maxDepthLimit) {
    return 1;
  }

  // Recursive step: Iterate through constraints to determine path validity and sum possibilities.
  let accumulatedPathSum = 0; // Temporary variable to accumulate results for the current step.
  for (let loopIndex = 0; loopIndex < constraintCount; loopIndex++) {
    // Check if the current step is one of the forbidden indices.
    if (currentStep === forbiddenIndices[loopIndex]) {
      return 0; // If the current step is forbidden, no paths can proceed from here.
    } else {
      // If not forbidden, explore two possible next steps.
      accumulatedPathSum += computeValidPaths(currentStep + 1); // Calculate paths from moving one step forward.
      accumulatedPathSum %= PRIME_MODULUS; // Apply the modulo operation to keep the sum within bounds.
      accumulatedPathSum += computeValidPaths(currentStep + 2); // Calculate paths from moving two steps forward.
      accumulatedPathSum %= PRIME_MODULUS; // Apply the modulo operation again.
    }
  }

  solutionCache[currentStep] = accumulatedPathSum; // Store the computed sum in the memoization table for future use.
  return solutionCache[currentStep]; // Return the final computed sum for the current step.
}