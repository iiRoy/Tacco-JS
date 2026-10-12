function ProcessInput(rawData) {
  // Split the incoming text by newline characters to get individual lines.
  let linesOfText = rawData.split("\n");

  // Access the second line (index 1), split it by spaces, and convert each segment to a number.
  let numericalSequence = linesOfText[1].split(" ").map(Number);

  // Determine the largest value within the numerical sequence.
  let greatestValue = Math.max.apply(null, numericalSequence);

  // Determine the smallest value within the numerical sequence.
  let leastValue = Math.min.apply(null, numericalSequence);

  // Print the difference between the greatest and least values to the console.
  console.log(greatestValue - leastValue);
}

// Read the entire content from the standard input stream,
// decode it as UTF-8, remove any leading or trailing whitespace,
// and then pass this processed string to our main function.
ProcessInput(require("fs").readFileSync("/dev/stdin", "utf8").trim());
