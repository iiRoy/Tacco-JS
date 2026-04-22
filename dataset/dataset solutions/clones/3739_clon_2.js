function ProcessInputData(rawDataString) {
  // Divide the raw input string into distinct lines
  let lineArray = rawDataString.split('\n');

  // If the final line is empty, remove it from the array
  if (lineArray[lineArray.length - 1] === '') {
    lineArray.pop();
  }

  // Extract the numeric iteration limit from the initial line
  const limitValue = Number(lineArray[0].split(' ')[0]);

  // Initialize a counter variable for the sequence generation
  let currentResult = 1;

  // Execute a loop for the predetermined number of cycles
  for (let iterationIndex = 0; iterationIndex < limitValue; iterationIndex++) {
    // Display the current value of the sequence
    console.log(currentResult);

    // Increment the sequence value based on its current magnitude
    // The next value is currentResult plus 10 raised to the power of the floor of log10(currentResult + 1)
    currentResult += Math.pow(10, Math.floor(Math.log10(currentResult + 1)));
  }
}

// The following code block is for handling standard input/output and should remain unchanged.
// It reads all data from standard input and passes it to the primary processing function.
ProcessInputData( require("fs").readFileSync("/dev/stdin", "utf8") );