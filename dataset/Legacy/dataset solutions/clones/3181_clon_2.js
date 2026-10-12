// This module handles the processing of numerical data received via standard input.
const processData = rawInputContent => {
  // First, we clean up the incoming string by removing leading/trailing whitespace,
  // then split it into an array of lines based on newline characters.
  const processedLines = rawInputContent.trim().split('\n');

  // We take the very first line from our processed array,
  // split it by spaces, and convert each resulting string segment into an integer.
  // These two integers are then destructured into distinct variables.
  const [numOne, numTwo] = processedLines[0].split(' ').map(currentStr => parseInt(currentStr, 10));

  // Now, we evaluate a condition: if the second number is perfectly divisible by the first number.
  if (numTwo % numOne === 0) {
    // If the condition is true (i.e., there's no remainder),
    // we compute their sum and print it to the console.
    console.log(numOne + numTwo);
  } else {
    // Otherwise (if the second number is not perfectly divisible),
    // we calculate their difference (second minus first) and output that to the console.
    console.log(numTwo - numOne);
  }
};

// To initiate the process, we read the entire content of standard input synchronously.
// The 'utf8' encoding ensures proper character interpretation.
// This content is then passed as an argument to our main data processing function.
processData(require("fs").readFileSync("/dev/stdin", "utf8"));
