executeProgram();

function executeProgram() {
  // Acquire the 'readline' module to manage input operations.
  let inputReader = require('readline');
  // Establish an interface for processing input line by line.
  let inputHandler = inputReader.createInterface({
      input: process.stdin, // Direct input from the standard input stream.
      output: process.stdout // Standard output stream (though not actively written to by this interface).
  });
  // An array to accumulate all received input lines.
  let inputLines = [];
  // Register a callback for each line of input received.
  inputHandler.on('line', function (currentLine) {
    inputLines.push(currentLine); // Append the current line to our collection.
  });
  // Register a callback for when the input stream concludes.
  inputHandler.on('close', function () {
    // Convert the first input line to an integer, representing a quantity.
    let itemCount = parseInt(inputLines[0]);
    // Parse the second input line, splitting it by spaces to get individual stick measurements.
    let stickLengths = inputLines[1].split(/ /);
    // Calculate the area of the largest possible rectangle and print the result.
    console.log(calculateRectangleArea(itemCount, stickLengths));
  });
}

function calculateRectangleArea(itemCount, stickLengths) {
  // Arrange the array of stick measurements in descending order.
  // This strategy helps in identifying the longest possible sides first.
  stickLengths.sort(function(val1, val2){
    if (val1 > val2) return -1; // Place val1 before val2 if val1 is greater.
    if (val1 < val2) return 1;  // Place val2 before val1 if val2 is greater.
    return 0;                   // Maintain relative order if values are equal.
  });

  // Initialize variables to hold the dimensions of the rectangle.
  // They are set to zero, indicating that no valid side has been discovered yet.
  let firstSide = 0, secondSide = 0;

  // Traverse the sorted stick lengths to locate matching pairs.
  // The loop iterates up to the second-to-last element to allow checking pairs.
  for (let idx = 0; idx < stickLengths.length - 1; idx++) {
    // If both required sides have been successfully identified, terminate the search.
    if (firstSide !== 0 && secondSide !== 0) {
      break;
    }

    // Determine if the current stick length is identical to the subsequent one.
    // This condition signifies a pair of sticks of equal length.
    if (stickLengths[idx] === stickLengths[idx + 1]) {
      // If the first side has not yet been assigned, set it to the current stick length.
      if (firstSide === 0) {
        firstSide = stickLengths[idx];
      }
      // Otherwise, assign the length to the second side.
      else {
        secondSide = stickLengths[idx];
      }
      // Advance the index by an additional step, as two sticks have been consumed.
      idx++;
    }
  }

  // The computed area is the product of the two determined sides.
  // If any side was not found, its initial value of 0 will cause the area to be 0.
  return firstSide * secondSide;
}
