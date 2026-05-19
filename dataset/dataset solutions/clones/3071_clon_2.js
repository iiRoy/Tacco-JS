function processInputData(rawData) {
  // This function processes the raw input string.
  // It expects multiple lines, where the first line is 'N'
  // and subsequent lines are numbers for finding the minimum.

  let parsedValues = rawData.split("\n"); // Split the input string by newline characters.
  parsedValues = parsedValues.map(Number); // Convert each part of the split string to a number.

  const firstValue = parsedValues[0]; // The first element is 'N'.
  // Find the smallest value among the next five elements (indices 1 to 5).
  const minimumDivisor = Math.min(
    parsedValues[1],
    parsedValues[2],
    parsedValues[3],
    parsedValues[4],
    parsedValues[5]
  );

  // Calculate the final result based on the formula: 4 + ceil(N / m).
  const finalResult = 4 + Math.ceil(firstValue / minimumDivisor);

  // Output the computed result to the console.
  console.log(finalResult);
}

// The following line handles reading from standard input and invoking the main processing function.
// It should not be modified to ensure compatibility with the execution environment.
processInputData(require("fs").readFileSync("/dev/stdin", "utf8"));
