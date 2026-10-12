/*
 * This script processes input data to validate a specific string format.
 * It checks if a given string matches a pattern of two digit sequences
 * separated by a hyphen, where the lengths of the sequences are specified.
 */
function ProcessInput(dataLines) {
  // Extract the first line of input, which contains two numbers separated by a space.
  // These numbers define the required lengths for the digit sequences.
  const firstLineParts = dataLines[0].split(" ");

  // Convert the first part to a number, representing the length of the first digit sequence.
  let firstNumLength = firstLineParts[0] - 0;

  // Convert the second part to a number, representing the length of the second digit sequence.
  let secondNumLength = firstLineParts[1] - 0;

  // The second line of input is the string to be validated.
  const targetString = dataLines[1];

  // Construct a regular expression dynamically based on the extracted lengths.
  // The pattern looks for:
  //   ^        - start of the string
  //   \\d{N}   - N digits
  //   -        - a literal hyphen
  //   \\d{M}   - M digits
  //   $        - end of the string
  const validationPattern = new RegExp(
    "^\\d{" + firstNumLength + "}-\\d{" + secondNumLength + "}$"
  );

  // Test if the target string matches the generated regular expression.
  // Output "Yes" if it matches, otherwise "No".
  console.log(validationPattern.test(targetString) ? "Yes" : "No");
}

// Read the entire standard input, decode it as UTF-8,
// remove leading/trailing whitespace, and split it into an array of lines.
// Then, pass this array to the main processing function.
ProcessInput(require("fs").readFileSync("/dev/stdin", "utf8").trim().split("\n"));
