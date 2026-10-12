const ProcessInput = (rawData) => {
  // This line processes the initial string input.
  // It splits the input by newline, takes the first line,
  // then splits that line by spaces, and finally converts each resulting string
  // into an integer using base 10.
  let numericValues = rawData.split('\n')[0].split(' ').map(item => parseInt(item, 10));

  // Calculate the final numerical outcome based on specific elements
  // from the 'numericValues' array. The formula is:
  // numericValues[2] minus the difference between numericValues[0] and numericValues[1].
  const resultValue = numericValues[2] - (numericValues[0] - numericValues[1]);

  // Print the calculated result to the console.
  // If 'resultValue' is less than zero, output 0; otherwise, output 'resultValue'.
  console.log(resultValue < 0 ? 0 : resultValue);
};

// Read the entire content of the standard input file synchronously
// using the 'fs' module, encoded as UTF-8, and then pass it
// to the 'ProcessInput' function for execution.
ProcessInput(require("fs").readFileSync("/dev/stdin", "utf8"));
