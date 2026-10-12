function ProcessInput(rawData) {
  // Split the raw input string by newline characters to get an array of lines.
  rawData = rawData.split("\n");

  // Parse the first line of input as an integer, using base 10.
  const targetValue = parseInt(rawData[0], 10);

  // Initialize a loop counter. The loop condition ensures it runs indefinitely
  // until a break statement is encountered.
  for (var iterationCounter = 1; iterationCounter > 0; iterationCounter++) {
    // Calculate a potential result 'n' using a mathematical formula involving
    // the targetValue and the current iterationCounter.
    // The formula is derived from solving n*(n+1)/2 = N*i for n.
    var calculatedResult = 0.5 * (Math.sqrt((8 * targetValue * iterationCounter) + 1) - 1);

    // Check if the calculated result is an integer.
    // If it is, we've found the desired value.
    if (Number.isInteger(calculatedResult) == true) {
      // Output the integer result to the console.
      console.log(calculatedResult);
      // Exit the loop as the solution has been found.
      break;
    }
  }
}

// Read input from standard input using Node.js 'fs' module and pass it to the main function.
ProcessInput(require("fs").readFileSync("/dev/stdin", "utf8"));
