function ProcessInput(inputString) {
  // This function processes the provided input string.
  // It calculates the length of the input and prints a
  // sequence of 'x' characters corresponding to that length.
  let dataValue = inputString;

  // Output a string consisting of 'x' characters,
  // repeated as many times as the length of the dataValue.
  console.log("x".repeat(dataValue.length));

  // The function concludes its execution.
  return;
}

// Read the entire content from standard input,
// assuming it's encoded in UTF-8, and then
// pass it to our primary processing function.
ProcessInput(require("fs").readFileSync("/dev/stdin", "utf8"));
