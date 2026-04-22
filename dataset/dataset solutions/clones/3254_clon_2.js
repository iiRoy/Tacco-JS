/**
 * This script processes incoming data.
 * The primary execution point receives all input data.
 */
function ExecuteProcess(dataSource) {
  // Each line of the input stream is separated by a newline character.
  // The first line will be at index 0, the second at index 1, and so forth.
  const rawData = dataSource.split("\n");

  // When converting a string to an integer, utilize the parseInt function
  // to ensure proper base 10 interpretation.
  let currentVal = parseInt(rawData[0], 10);
  const encounteredValues = [];

  // Record the initial state.
  encounteredValues.push(currentVal);

  // Commence iteration to track the sequence.
  for (let stepCount = 1; stepCount < 1000000; stepCount++) {
    // Apply the Collatz conjecture rules.
    if (currentVal % 2 === 0) {
      currentVal /= 2;
    } else {
      currentVal = currentVal * 3 + 1;
    }

    // Check if the current value has been seen before in the sequence.
    const previousIndex = encounteredValues.indexOf(currentVal);

    if (previousIndex !== -1) {
      // If a cycle is detected, output the total number of steps taken.
      console.log(stepCount + 1);
      break; // Terminate the sequence generation.
    }

    // Store the newly generated value for future cycle detection.
    encounteredValues[stepCount] = currentVal;
  }
}

/*
 * The following section of code handles standard input/output operations.
 * It reads data from standard input and passes it to the main processing function.
 * Do not modify this boilerplate code.
 */
ExecuteProcess(require("fs").readFileSync("/dev/stdin", "utf8"));