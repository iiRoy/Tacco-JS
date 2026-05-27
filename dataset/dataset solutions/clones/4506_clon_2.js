'use strict'; // Enforce strict mode for cleaner code practices

/**
 * Main function to process the input and determine the sequence outcome.
 * It simulates navigating through a series of "buttons" based on their values.
 *
 * @param {string} rawData - The raw input string, typically from stdin.
 */
function processInput(rawData) {
  // Parse the raw input string: split by newline and convert each part to an integer.
  // The `~~` operator is a concise way to perform a floor operation on a number,
  // effectively converting string representations of numbers to integers.
  let parsedValues = rawData.split('\n').map(val => ~~val);

  // The first element of the parsed input represents the total number of elements
  // or the maximum number of steps allowed before considering it an infinite loop.
  const totalElements = parsedValues[0];

  // Create an array representing the sequence of "buttons" or jump instructions.
  // This slice ensures we're working with the relevant part of the input.
  const buttonSequence = parsedValues.slice(0, parsedValues.length);

  // Initialize the current position in the sequence.
  // The problem typically starts at index 1.
  let currentPosition = 1;

  // Variable to store the value of the next position to jump to.
  let nextPosition = 0;

  // Counter for the number of steps taken. Starts at 1 for the first "jump".
  let stepCount = 1;

  // Loop through the sequence. The loop condition `stepCount < totalElements`
  // acts as a safeguard to prevent infinite loops if the target (button '2')
  // is never reached within the expected number of steps.
  while (stepCount < totalElements) {
    // Get the value at the `currentPosition`. This value indicates the index
    // of the *next* button to press.
    nextPosition = buttonSequence[currentPosition];

    // Check if the value at the `nextPosition` is '2'.
    // Reaching '2' is the success condition for this problem.
    if (nextPosition === 2) {
      // If '2' is reached, print the total number of steps taken to reach it.
      console.log(stepCount);
      return; // Exit the function as the goal has been achieved.
    }

    // If '2' was not reached, update the `currentPosition` to the `nextPosition`
    // indicated by the button value.
    currentPosition = nextPosition;

    // Increment the step counter for the current iteration.
    stepCount++;
  }

  // If the loop completes without `nextPosition` ever being '2',
  // it means the target was not reachable within the given constraints
  // (or an infinite loop was detected by the `stepCount < totalElements` condition).
  // In this case, print -1 to indicate failure or unreachability.
  console.log(-1);
}

// Read the entire content of standard input synchronously,
// decode it as UTF-8, and then pass it to the `processInput` function.
processInput(require('fs').readFileSync('/dev/stdin', 'utf8'));
