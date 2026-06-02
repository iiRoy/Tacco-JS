// This function processes the incoming raw data.
function ProcessInput(rawData) {
  // The raw data is split into individual lines for further processing.
  let processedLines = rawData.split("\n");

  // The first line is then broken down into its constituent parts, separated by spaces.
  const lineParts = processedLines[0].split(" ");

  // Numeric values are parsed from string segments, ensuring they are interpreted as base-10 integers.
  const firstNum = parseInt(lineParts[0], 10);
  const secondNum = parseInt(lineParts[1], 10);
  const thirdNum = parseInt(lineParts[2], 10);

  // Initialize a string to hold the final determination.
  let resultString = "Yes";

  // Evaluate the condition: if the sum of the first two numbers is less than the third.
  if (firstNum + secondNum < thirdNum) {
    // If the condition is met, update the result string.
    resultString = "No";
  }

  // Display the outcome to the console.
  console.log(resultString);
}

// The following line handles standard input/output and should not be modified.
ProcessInput(require("fs").readFileSync("/dev/stdin", "utf8"));
