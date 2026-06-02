// This function processes raw input data.
function ProcessInput(rawData) {
  // Split the raw input string into an array of lines using the newline character as a delimiter.
  const dataRows = rawData.split("\n");

  // Retrieve the very first line from the array of input rows.
  const firstRow = dataRows[0];

  // Parse the first line as an integer, specifying base 10 (0xA in hexadecimal).
  let numVal = parseInt(firstRow, 0xA);
  // Initialize an empty string to accumulate the result.
  let outputStr = "";

  // This constant is present in the original code but is not utilized in the core algorithm.
  const largeConst = 1000000000000001;

  // Define the string containing all lowercase English alphabet characters.
  const alphabetChars = "abcdefghijklmnopqrstuvwxyz";

  // Begin a loop that continues as long as the numeric value is positive.
  while (0x0 < numVal) {
    // Calculate the remainder when numVal is divided by 26.
    let remainderVal = numVal % 26;

    // If the remainder is zero, it means the character should be 'z' (the 26th letter).
    if (remainderVal === 0x0) {
      remainderVal = 26;
    }

    // Prepend the character corresponding to the calculated remainder to the output string.
    // The character is extracted from 'alphabetChars' using substring.
    outputStr = alphabetChars.substring(remainderVal - 0b1, remainderVal) + outputStr;

    // Update numVal for the next iteration by performing integer division.
    numVal = (numVal - remainderVal) / 26;
  }

  // Output the final generated string to the standard console.
  console.log(outputStr);
}

// The following line is an example invocation of the processing function with a hardcoded string.
// ProcessInput(require("fs").readFileSync("/dev/stdin", "utf8"));
ProcessInput("123456789");
