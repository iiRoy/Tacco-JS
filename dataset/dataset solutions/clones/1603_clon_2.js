// This function analyzes a sequence of numbers based on specific criteria.
function ProcessInputData(rawString) {
  // Split the incoming text by spaces to get individual string components.
  let numericValues = rawString.split(" ");
  // An array to potentially store outcomes, though not used in this specific logic path.
  let processedResults = [];

  // Iterate through each string component and convert it to a numerical type.
  for (let currentIndex in numericValues) {
    // Explicitly convert string to a number.
    numericValues[currentIndex] = Number(numericValues[currentIndex]);
  }

  // Check the primary condition involving the first three numerical elements.
  if (numericValues[0] > numericValues[1] * numericValues[2]) {
    // If the condition is met, calculate and display the difference.
    console.log(numericValues[0] - numericValues[1] * numericValues[2]);
  } else {
    // If the primary condition is not met, proceed to secondary checks.
    // Evaluate a modulo condition based on rounded division and another element.
    if (
      Math.round(numericValues[0] / numericValues[2]) % 2 ==
      numericValues[1] % 2
    ) {
      // If the secondary condition holds, compute an absolute difference.
      console.log(
        Math.abs(
          numericValues[0] -
            numericValues[1] * Math.round(numericValues[0] / numericValues[2])
        )
      );
    } else {
      // If the secondary condition does not hold, perform a tertiary check.
      if (
        numericValues[0] -
          numericValues[1] * Math.round(numericValues[0] / numericValues[2]) <
        0
      ) {
        // If the tertiary condition is true, calculate an absolute value with an incremented divisor.
        console.log(
          Math.abs(
            numericValues[0] -
              numericValues[2] *
                (Math.round(numericValues[0] / numericValues[2]) + 1)
          )
        );
      } else {
        // Otherwise, calculate an absolute value with a decremented divisor.
        console.log(
          Math.abs(
            numericValues[0] -
              numericValues[2] *
                (Math.round(numericValues[0] / numericValues[2]) - 1)
          )
        );
      }
    }
  }
}

// Example invocation with a predefined string of values.
ProcessInputData(`10 4 3`);
// To utilize standard input, uncomment the following line (requires 'fs' module).
//ProcessInputData(require("fs").readFileSync("/dev/stdin", "utf8"));