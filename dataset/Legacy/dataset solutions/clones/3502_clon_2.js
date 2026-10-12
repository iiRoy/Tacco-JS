function ProcessInput(dataString) {
  // This helper function transforms a single digit character based on specific rules.
  // It swaps '1' with '9' and '9' with '1', leaving other digits unchanged.
  const transformDigit = (digitChar) => {
    if (digitChar === '1') {
      return '9'; // If the character is '1', return '9'.
    }

    if (digitChar === '9') {
      return '1'; // If the character is '9', return '1'.
    }
    // For any other character, return it as is.
    return digitChar;
  };

  // Apply the transformation to the first three characters of the input string
  // and concatenate the results into a new string.
  let resultString = transformDigit(dataString[0]) + transformDigit(dataString[1]) + transformDigit(dataString[2]);

  // Return the final modified string.
  return resultString;
}

// Read the entire content of standard input as a UTF-8 string,
// then pass it to the main processing function and print the returned result to console.
console.log(ProcessInput(require("fs").readFileSync("/dev/stdin", "utf8")));
