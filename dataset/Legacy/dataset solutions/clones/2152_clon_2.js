// This module defines a function to analyze a list of numbers.
function ProcessInput(rawData) {
  // The raw input string is first broken down into individual lines.
  rawData = rawData.split("\n");

  // The initial line is extracted; its content is not utilized in the subsequent logic.
  const firstLineValue = rawData.shift();

  // Remaining lines are converted into an array of integer values.
  const numericValues = rawData.map(item => parseInt(item));

  // A boolean indicator, initially set to false, will track specific conditions.
  hasInvalidEven = false;

  // From the collection of numbers, only those that are even are selected.
  const evenNumbers = numericValues.filter(element => element % 2 == 0);

  // Each even number is then examined against a set of divisibility rules.
  evenNumbers.forEach(currentNum => {
    // If an even number is neither perfectly divisible by three nor by five, the indicator is activated.
    if (currentNum % 3 != 0 && currentNum % 5 != 0) {
      hasInvalidEven = true;
    }
  });

  // The final outcome is determined by the state of the indicator.
  if (hasInvalidEven) {
    console.log("DENIED");
  } else {
    console.log("APPROVED");
  }
}

// The following segment is responsible for reading data from standard input and initiating the processing.
// It is crucial for the program's execution environment and should remain unaltered.
ProcessInput(require("fs").readFileSync("/dev/stdin", "utf8"));
