function processDimensions(dataLines) {
  // Initialize variables by parsing numeric values from the input array.
  // The unary minus operator converts string elements to numbers.
  let heightVal = dataLines[0] - 0;
  let widthVal = dataLines[1] - 0;
  let remainingArea = dataLines[2] - 0;

  // A counter to track the number of operations performed.
  let operationCount = 0;

  // Loop continues as long as there is a positive remaining area to process.
  while (remainingArea > 0) {
    // Check which dimension is currently larger to decide the reduction strategy.
    if (heightVal > widthVal) {
      // If height is greater, decrease the width and subtract the current height from the remaining area.
      widthVal--;
      remainingArea -= heightVal;
    } else {
      // Otherwise (if width is greater or equal), decrease the height and subtract the current width from the remaining area.
      heightVal--;
      remainingArea -= widthVal;
    }
    // Increment the operation counter for each iteration of the loop.
    operationCount++;
  }

  // Output the final calculated number of operations to the console.
  console.log(operationCount);
}

// Read the entire content from standard input, decode it as UTF-8,
// remove leading/trailing whitespace, and then split it into an array of strings by newline characters.
// This array is then passed as an argument to the main processing function.
processDimensions(require('fs').readFileSync('/dev/stdin', 'utf8').trim().split("\n"));
