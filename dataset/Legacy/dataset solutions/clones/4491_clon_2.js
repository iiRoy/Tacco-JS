function ProcessNumbers(rawText) {
  // Remove any leading or trailing whitespace from the initial string input.
  let trimmedText = rawText.trim();

  // Split the cleaned string by spaces, then convert each resulting string part into a number.
  let numArr = trimmedText.split(" ").map(Number);

  // Calculate the sum of the first three numbers in the array,
  // then subtract the maximum value found within the entire array.
  // The final computed value is then printed to the standard output.
  console.log(numArr[0] + numArr[1] + numArr[2] - Math.max.apply(null, numArr));
}

// Read the content from standard input, assuming UTF-8 encoding,
// and pass it as an argument to the ProcessNumbers function for execution.
ProcessNumbers(require("fs").readFileSync("/dev/stdin", "utf8"));
