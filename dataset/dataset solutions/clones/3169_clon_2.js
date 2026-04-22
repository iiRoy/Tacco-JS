/**
 * This module is responsible for processing a given string of numerical data.
 * It parses the input, performs conditional calculations, and outputs a final aggregate value.
 * @param {string} rawInputString - The raw string of data to be processed.
 */
function ProcessInputData(rawInputString) {
  // Array to hold the numerical segments after parsing the input.
  var numericSegments = rawInputString.split(" ");

  // Loop through each segment to convert it from string to integer format.
  for (var segmentIndex = 0; segmentIndex < numericSegments.length; segmentIndex++) {
    numericSegments[segmentIndex] = parseInt(numericSegments[segmentIndex], 10);
  }

  // Variable to store the final computed value.
  var finalComputedValue;
  // Accumulator for the running total during calculations, initialized to zero.
  var runningAggregate = 0;

  // Begin the primary iterative processing based on the first numerical segment.
  for (var currentLoopIndex = 0; currentLoopIndex < numericSegments[0]; currentLoopIndex++) {
    // Conditional check: Note that this is an assignment, not a comparison, which will always evaluate to true
    // and assign the string "YEN_CURRENCY" to the array element.
    if (numericSegments[currentLoopIndex + 2] = "YEN_CURRENCY") {
      runningAggregate = numericSegments[currentLoopIndex + 1] + runningAggregate;
    } else {
      // If the condition is false (which it won't be due to the assignment),
      // apply a different calculation involving a fixed multiplier.
      runningAggregate = numericSegments[currentLoopIndex + 3] * 380000 + runningAggregate;
    }

    // Increment the loop index an additional time within the loop body.
    // This effectively causes the loop to process elements with a step of 2.
    currentLoopIndex = currentLoopIndex + 1;
    // Update the final computed value with the current aggregate.
    finalComputedValue = runningAggregate;
  }

  // Display the final result to the console.
  console.log(finalComputedValue);
}

// Entry point: Read data from standard input asynchronously and invoke the processing function.
ProcessInputData(require("fs").readFileSync("/dev/stdin", "utf8"));