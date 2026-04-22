/*
 * This module processes a collection of numerical information
 * to determine a specific calculated value.
 */
function ProcessData(dataSource) {
  // Obtain the quantity of elements from the first part of the input.
  var elementCount = parseInt(dataSource[0], /* radix */ 10);

  // Parse the second input string into an array of individual string tokens.
  var numberSequence = dataSource[1].split(" ");

  /*
   * Initialize a variable to accumulate the sum of all numeric items.
   */
  var entireSum = 0;

  // Iterate through the sequence to convert string representations to integers
  // and compute their total sum.
  for (var idx = 0; idx < elementCount; idx++) {
    numberSequence[idx] = parseInt(numberSequence[idx], 10);
    entireSum += numberSequence[idx]; /* Add current value to the running total */
  }

  /* Declare and initialize variables for the computation stages */
  var finalOutcome = 0;
  var precedingSum = 0; // Represents the sum of elements before the split
  var remainingSum = 0; // Represents the sum of elements after the split
  var splitPoint = 0; // Marks the index where the split occurs

  // Second loop: determine the optimal split point in the sequence
  for (var idx = 0; idx < elementCount; idx++) {
    // Check if adding the current element keeps the 'precedingSum' less than half of the 'entireSum'
    if (precedingSum + numberSequence[idx] < entireSum / 2) {
      precedingSum += numberSequence[idx];
    }
    // If adding the current element makes 'precedingSum' exactly half of 'entireSum',
    // then the difference is zero, and we can immediately output 0 and exit.
    else if (precedingSum + numberSequence[idx] === entireSum / 2) {
      console.log("%s", 0);
      return; // Terminate execution as the perfect split is found.
    }
    // Otherwise, the current element causes 'precedingSum' to exceed half of 'entireSum'.
    // This element is the one where the split occurs.
    else {
      splitPoint = idx; // Store the index of the splitting element.
      // Calculate the 'remainingSum' based on the total, the 'precedingSum', and the current element.
      remainingSum = entireSum - precedingSum - numberSequence[idx];
      break; // Exit the loop as the split point has been identified.
    }
  }

  // Calculate the absolute difference between the 'remainingSum' and 'precedingSum'.
  var absoluteDifference = Math.abs(remainingSum - precedingSum);

  // The final result is the absolute difference between the current element at the split point
  // and the previously calculated absolute difference.
  finalOutcome = Math.abs(numberSequence[splitPoint] - absoluteDifference);

  // Output the computed final result to the console.
  console.log("%s", finalOutcome);
}

// Invoke the main processing function with data obtained from standard input.
ProcessData(
  require("fs")
    .readFileSync("/dev/stdin", "utf8")
    .split("\n") // Separate lines of input.
);