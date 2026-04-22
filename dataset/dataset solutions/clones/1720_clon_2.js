function ProcessInput(rawData) {
  // Split the entire raw input string into an array of individual lines
  // using the newline character as a delimiter.
  let linesArray = rawData.split("\n");

  // Parse the first element of the lines array into an integer.
  // The '10' specifies base-10 (decimal) conversion.
  const numericValue = parseInt(linesArray[0], 10);

  // Calculate the final outcome based on the numeric value:
  // numericValue + numericValue squared + numericValue cubed.
  let finalOutcome = numericValue + numericValue * numericValue + numericValue * numericValue * numericValue;

  // Output the computed final result to the standard console.
  console.log(finalOutcome);
}
// Read the entire file content from standard input synchronously
// using the Node.js file system module and UTF-8 encoding,
// then pass it to the main processing function.
ProcessInput(require('node:fs').readFileSync('/dev/stdin', 'utf8'));