const processInput = (inputString) => {
  // Split the incoming string by spaces to get individual tokens.
  const tokenizedValues = inputString.split(" ");

  // Find the 0-based index of the first occurrence of the string "0".
  // Then, add one to convert it to a 1-based index for output.
  const resultIndex = tokenizedValues.findIndex(item => item === "0") + 1;

  // Output the calculated 1-based index to the console.
  console.log(resultIndex);
};

// Read the entire content from standard input synchronously and pass it to the processing function.
processInput(require("fs").readFileSync('/dev/stdin', 'utf8'));
