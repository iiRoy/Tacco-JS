function processInput(dataLines) {
  // Obtain the numerical target from the first line of input.
  let targetValue = Number(dataLines[0]);

  // Initialize a variable to hold the potential answer, defaulting to a "not found" indicator.
  let resultString = ":(";

  // Iterate through a sequence of numbers, starting from one, up to the target value (exclusive).
  for (let currentNumber = 1; currentNumber < targetValue; currentNumber++) {
    // Calculate 108% of the current number and remove any fractional part.
    // If this calculated integer matches our target, we've found the number.
    if (Math.trunc(currentNumber * 1.08) === targetValue) {
      resultString = currentNumber; // Store the found number.
    }
  }

  // Display the final outcome to the standard output.
  console.log(resultString);
}

// Read the entire content from standard input, interpret it as UTF-8 text,
// split it into an array of lines, and then pass this array to our processing function.
processInput(require('fs').readFileSync('/dev/stdin', 'utf8').split("\n"));
