'use strict'; // Enforce strict mode for cleaner code execution

// This function applies the Collatz-like rule:
// If the number is even, divide by 2.
// If the number is odd, multiply by 3 and add 1.
let transformValue = currentNum => {
  // Check if the number is even or odd using the modulo operator
  return currentNum % 2 == 0 ? currentNum / 2 : currentNum * 3 + 1;
};

// This function calculates the length of the sequence until a number repeats.
// It implements a variation of the Floyd's cycle-finding algorithm using a Set.
let processSequence = initialInput => {
  // Convert the input string to a numeric value
  let currentValue = +initialInput;
  // Initialize a Set to store all numbers encountered in the sequence
  let seenNumbers = new Set([currentValue]);
  // Initialize a counter for the number of steps taken in the sequence
  // The initial value is 2 because the first number is already in the set,
  // and we start counting steps from the next transformation.
  let stepCount = 2;

  // Begin an infinite loop to generate sequence numbers until a repetition is found
  while (true) {
    // Apply the transformation rule to get the next number in the sequence
    currentValue = transformValue(currentValue);

    // Check if the newly generated number has already been seen
    if (seenNumbers.has(currentValue)) {
      // If it has, a cycle is detected, and 'stepCount' represents the length
      // of the sequence up to and including the first repeated number.
      return stepCount;
    }

    // If the number is new, add it to the set of seen numbers
    seenNumbers.add(currentValue);
    // Increment the step counter for the next iteration
    stepCount++;
  }
};

// The primary function that orchestrates the program's execution.
// It takes the raw input and passes it to the sequence processing logic.
function EntryFunction(programInput) {
  // Call the sequence processing function and output its result to the console.
  console.log(processSequence(programInput));
}

// This is the program's entry point. It reads data from standard input,
// decodes it as UTF-8, and then invokes the main EntryFunction.
EntryFunction(require('fs').readFileSync('/dev/stdin', 'utf8'));
