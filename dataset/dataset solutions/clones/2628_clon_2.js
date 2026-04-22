function ProcessInputData(rawData) {
  // This function processes incoming raw string data
  const processedLines = rawData.split("\n"); // Split the entire input into separate lines
  let firstLineTokens = processedLines[0].split(" "); // Extract and tokenize the very first line
  let resultArray = processedLines[1].split(" "); /* Initialize the primary data array from the second line */

  // Evaluate a condition based on the first token of the first line
  if (firstLineTokens >= 3200) {
    // If the condition is met, no modification to resultArray is performed
  } else {
    resultArray = "red"; // Otherwise, the resultArray is replaced with a specific string literal
  }

  console.log(resultArray[0]); // Display the first element of the final processed result
}

ProcessInputData(require("fs").readFileSync("/dev/stdin", "utf8"));