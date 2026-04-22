// This function processes an incoming text stream to perform calculations.
function ProcessDataStream (incomingText) {
  // Split the entire input string into individual lines based on newline characters.
  let textLines = incomingText.split('\n');

  // Extract numerical data from the first three lines of the input.
  let dataFactors = textLines[0].split(' ');
  let firstValues = textLines[1].split(' ');
  let secondValues = textLines[2].split(' ');

  // Iterate over the first two elements of each array to convert them from strings to actual numbers.
  for (let itemIndex = 0; itemIndex < 2; itemIndex++) {
    dataFactors[itemIndex] = Number(dataFactors[itemIndex]);
    firstValues[itemIndex] = Number(firstValues[itemIndex]);
    secondValues[itemIndex] = Number(secondValues[itemIndex]);
  }

  // Declare and initialize an array to store the results of intermediate calculations.
  const computedDifferences = new Array(2);

  // Calculate the difference of products for the first and second data points.
  computedDifferences[0] = dataFactors[0] * firstValues[0] - dataFactors[0] * secondValues[0];
  computedDifferences[1] = dataFactors[1] * firstValues[1] - dataFactors[1] * secondValues[1];

  // Initialize several variables that will be used in the subsequent iterative process.
  let cumulativeValue = 0;
  let previousCumulativeValue = 1;
  let unusedMarker = 0; // This variable is initialized but not utilized in the core logic.
  let operationCounter = -1;

  // Check for a specific condition where the first difference is the negative of the second.
  // This scenario indicates an 'infinity' result.
  if (computedDifferences[0] === computedDifferences[1] * -1) {
    console.log('infinity'); // Output the special string 'infinity'.
  } else {
    // Begin an iterative process. The loop condition is unusual; it relies on an internal flag.
    for (let loopFlag = 0; loopFlag < 1; loopFlag) {
      operationCounter++; // Increment the counter for each step of the iteration.
      previousCumulativeValue = cumulativeValue; // Store the current cumulative value before it's updated.
      cumulativeValue += computedDifferences[operationCounter % 2]; // Add a difference value, alternating using modulo.

      // Evaluate a termination condition: if the product of current and previous cumulative values is positive.
      if (cumulativeValue * previousCumulativeValue > 0) {
        loopFlag = 1; // Set the loop flag to 1 to terminate the iteration.
      }
    }
    // After the loop concludes, output the final calculated result, adjusted by one.
    console.log(operationCounter - 1);
  }
}

// Execute the main data processing function.
// It reads content from standard input, assuming UTF-8 encoding.
ProcessDataStream(require("fs").readFileSync("/dev/stdin", "utf8"));