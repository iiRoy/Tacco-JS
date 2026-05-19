function processInput(rawData) {
  // This function processes the raw input string to determine a specific condition.
  const numericValues = rawData
    .trim() // Remove leading/trailing whitespace from the input.
    .split(/\s+/) // Split the string by one or more whitespace characters.
    .map(textSegment => Number(textSegment)); // Convert each resulting string segment to a number.

  // Check if the first number is non-zero AND all three numbers are identical.
  // Then print "Yes" or "No" based on the evaluation.
  console.log(
    numericValues[0] !== 0 && numericValues[0] === numericValues[1] && numericValues[0] === numericValues[2]
      ? "Yes"
      : "No"
  );
}

// Read the input from standard input using Node.js file system module.
processInput(require("fs").readFileSync("/dev/stdin", "utf8"));
