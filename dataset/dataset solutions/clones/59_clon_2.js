// This script processes numerical input from standard input.
process.stdin.on("data", function(inputBuffer) {
  // Convert the incoming data buffer to a string,
  // remove leading/trailing whitespace, and split into individual lines.
  // The 'some' method is used to iterate over each line,
  // performing calculations and logging results.
  (inputBuffer + "").trim().split("\n").some(function(currentLine) {
    // Initialize variables for the calculation loop.
    // 'divisorValue' is the numeric value of the current input line.
    // 'iterationCount' starts at 1.
    // 'accumulatorSum' stores the result of the calculation.
    // 'tempProduct' is a temporary variable for intermediate products.
    for (
      var divisorValue = +currentLine,
          iterationCount = 1,
          accumulatorSum = 0,
          tempProduct;
      // Loop condition: calculate tempProduct, then check if it's less than 600.
      // If true, add a derived value to accumulatorSum; otherwise, add zero.
      // The loop continues as long as the expression evaluates to a truthy value.
      (tempProduct = iterationCount++ * divisorValue),
      tempProduct < 600 ? (accumulatorSum += tempProduct * tempProduct * divisorValue) : 0;
    );
    // Output the final accumulated sum for the current line.
    console.log(accumulatorSum);
  });
}).resume(); // Ensure the standard input stream remains active to receive data.
