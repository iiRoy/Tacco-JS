function printToConsole(messageContent) {
  console.log(messageContent); // Outputs the provided text to the console
}

function ProcessInputData(rawData) {
  // The original code had several commented-out lines for different input parsing strategies.
  // We will keep the active parsing strategy.
  rawData = rawData.split("\n");

  let resultString = ""; // Initialize an empty string to build the output
  // Iterate through the characters of the first line of input
  for (let idx = 0; idx < rawData[0].length; idx++) {
    // Concatenate characters from the first and second lines of input
    // at the current index 'idx'
    resultString += rawData[0].slice(idx, idx + 1) + rawData[1].slice(idx, idx + 1);
  }

  // Display the final concatenated string
  printToConsole(resultString);
}

// Read input from standard input, decode as UTF-8, and remove leading/trailing whitespace.
// Then, pass the processed input to the main processing function.
ProcessInputData(require("fs").readFileSync("/dev/stdin", "utf8").trim());
