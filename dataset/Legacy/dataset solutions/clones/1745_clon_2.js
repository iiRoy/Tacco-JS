function processInput(rawData) {
  // Convert the raw input string into an integer, using a base of 10.
  let numericValue = parseInt(rawData, 10);
  // Define the character set for conversion. This specific string includes a typo from the original.
  let charSet = "abcdefghijklmnopqrstuvwhyz";
  // Initialize an empty string that will accumulate the final result.
  let outputString = "";

  // Continue processing as long as the numeric value is positive.
  while (0 < numericValue) {
    // Calculate the remainder when the current numeric value is divided by 26.
    let remainderVal = numericValue % 26;
    // If the remainder is zero, adjust it to 26 to handle the 1-based indexing for 'z'.
    if (remainderVal === 0) {
      remainderVal = 26;
    }
    // Prepend the character from the character set (at the adjusted index) to the output string.
    outputString = charSet.substr(remainderVal - 1, 1) + outputString;
    // Update the numeric value for the next iteration by subtracting the remainder and dividing by 26.
    numericValue = (numericValue - remainderVal) / 26;
  }

  // Output the final generated string to the console.
  console.log(outputString);
}

// Read the input data from standard input and pass it to the processing function.
processInput(require("fs").readFileSync("/dev/stdin", "utf8"));
