// All input data is passed to the primary handler.
function ProcessInput(rawData) {
  // The initial line is at 'sourceLines[0]', the subsequent at 'sourceLines[1]', etc.
  rawData = rawData.split('\n'); // Split raw input into individual lines.

  var firstLineTokens = rawData[0].split(' '); // Parse the first line into tokens.
  var elementCount = Number(firstLineTokens[0]); // Extract the total count of elements.

  var numberArray = rawData[1].split(' '); // Get the second line, which contains the numbers.
  for (var idx = 0; idx < elementCount; idx++) { // Iterate to convert string elements to numbers.
    numberArray[idx] = Number(numberArray[idx]);
  }

  var matchCount = 0; // Initialize a counter for elements matching the current minimum.
  while (matchCount != elementCount) // Continue until all elements match the current minimum.
  {
    matchCount = 0; // Reset the counter for the new iteration.
    var currentMinVal = Math.min(...numberArray); // Find the smallest value in the current array.

    for (var idx = 0; idx < elementCount; idx++) { // Process each element in the array.
      var remainderVal = numberArray[idx] % currentMinVal; // Calculate the remainder.
      if (remainderVal !== 0) { // If there's a remainder, replace the number with the remainder.
        numberArray[idx] = remainderVal;
      } else { // If no remainder, replace the number with the current minimum and increment the match counter.
        numberArray[idx] = currentMinVal;
        matchCount++;
      }
    }
  }

  console.log(Math.min(...numberArray)); // Output the final minimum value.
}
// DO NOT MODIFY THE FOLLOWING LINES (handles standard I/O and invokes the primary routine)
ProcessInput(require("fs").readFileSync("/dev/stdin", "utf8"));
// Example usage: ProcessInput("3\n10 20 30")