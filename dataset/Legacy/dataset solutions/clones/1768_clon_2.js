function processInput(rawData) {
  // Remove any leading or trailing whitespace from the raw input string.
  let trimmedData = rawData.trim();
  // Divide the cleaned string into an array of string tokens, using a space as the separator.
  const tokenArray = trimmedData.split(" ");

  // Iterate through each element and its corresponding index in the generated array.
  tokenArray.forEach((currentVal, idx) => {
    // Convert the current string token to a number and check if it is equal to zero.
    if (Number(currentVal) === 0) {
      // If the numeric value is zero, print its 1-based index to the console.
      console.log(idx + 1);
    }
  });
}

// Read the entire content from standard input (typically /dev/stdin) as a UTF-8 string,
// then pass it to our primary processing function.
processInput(require("fs").readFileSync("/dev/stdin", "utf8"));
