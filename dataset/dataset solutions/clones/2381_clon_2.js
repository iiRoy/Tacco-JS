function ProcessInput(rawData) {
  // Process the raw input string into a structured array of string arrays.
  let parsedLines = rawData
    .trim()
    .split("\n")
    .map(function (lineStr) {
      return lineStr.split(" ");
    });

  // Parse numerical values from the processed input.
  let timeOne = parseInt(parsedLines[0][0], 10);
  let timeTwo = parseInt(parsedLines[0][1], 10);

  let valAOne = parseInt(parsedLines[1][0], 10);
  let valATwo = parseInt(parsedLines[1][1], 10);

  let valBOne = parseInt(parsedLines[2][0], 10);
  let valBTwo = parseInt(parsedLines[2][1], 10);

  // Perform BigInt calculations based on the parsed values.
  // Calculate the initial difference for the first period.
  let diffOne = BigInt(valAOne - valBOne) * BigInt(timeOne);
  // Calculate the cumulative difference after the second period.
  let diffTwo = BigInt(valATwo - valBTwo) * BigInt(timeTwo) + diffOne;

  let resultValue = 0n; // Initialize the result as a BigInt.
  let tempCalc; // Declare a temporary variable for intermediate calculations.

  // Apply conditional logic to determine the final result.
  if (diffTwo === 0n) {
    // If the cumulative difference is zero, the result is 'infinity'.
    resultValue = "infinity";
  } else if (diffOne * diffTwo < 0n) {
    // If the product of differences is negative, further calculation is needed.
    // Ensure diffTwo is positive for the division.
    diffTwo = diffTwo * -1n;
    tempCalc = diffOne / diffTwo; // Perform BigInt division.

    // Determine the final result based on the divisibility.
    resultValue = tempCalc * diffTwo === diffOne ? tempCalc * 2n : tempCalc * 2n + 1n;
  } else {
    // If neither of the above conditions is met, the result is 0.
    resultValue = 0;
  }

  // Output the final result, converting it to a string.
  console.log(resultValue.toString());
}

// Read input from standard input and pass it to the main processing function.
ProcessInput(require("fs").readFileSync("/dev/stdin", "utf8"));
