function ProcessInputData(rawData) {
  // This function processes raw input data to calculate a specific value.

  // First, clean up the raw string input:
  // - Remove any leading or trailing whitespace.
  // - Split the string into an array of lines based on newline characters.
  // - Convert each line (which is a string) into a numerical value.
  let numericValues = rawData
    .trim()
    .split("\n")
    .map((itemString) => Number(itemString));

  // Extract the required numerical parameters from the processed array.
  // The first element represents the overall grid size.
  let gridSize = numericValues[0];
  // The second element represents a height-related constraint.
  let heightConstraint = numericValues[1];
  // The third element represents a width-related constraint.
  let widthConstraint = numericValues[2];

  // Perform the core calculation based on the extracted parameters.
  // The formula is (gridSize - heightConstraint + 1) * (gridSize - widthConstraint + 1).
  let finalResult =
    (gridSize - heightConstraint + 1) * (gridSize - widthConstraint + 1);

  // Output the computed result to the standard console.
  console.log(finalResult);
}

// The program starts by reading input from standard input.
// It uses Node.js's 'fs' module to synchronously read the file content
// from '/dev/stdin' and decodes it as a UTF-8 string.
// This string is then passed to the main processing function.
ProcessInputData(require("fs").readFileSync("/dev/stdin", "utf8"));
