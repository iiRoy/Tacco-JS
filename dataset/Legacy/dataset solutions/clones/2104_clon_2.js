const processInputData = (inputLines) => {
  // The first line of input contains two space-separated numbers.
  const parsedValues = inputLines[0].split(" ");

  // Extract the first number, representing the target value for 8% calculation.
  var targetEightPercent = Number(parsedValues[0]);
  // Extract the second number, representing the target value for 10% calculation.
  var targetTenPercent = Number(parsedValues[1]);

  // Initialize the variable that will hold the final computed result.
  var finalResult = -1;
  // This variable tracks the current calculated 10% value, used for loop termination.
  var currentPriceCheck = 0;
  // This counter iterates through potential base values.
  var iterationCounter = 0;

  // Flags to indicate if the current iterationCounter satisfies the 8% and 10% conditions.
  var foundEightPercent = !0; // Equivalent to false
  var foundTenPercent = !0;   // Equivalent to false

  // Begin a loop that continues as long as the 10% check value is within a certain range.
  while (currentPriceCheck < targetTenPercent + 1) {

    // Check if the floor of 8% of the current iterationCounter matches the targetEightPercent.
    if (Math.floor(iterationCounter * 0.08) === targetEightPercent) {
      foundEightPercent = !!1; // Equivalent to true
    }

    // Check if the floor of 10% of the current iterationCounter matches the targetTenPercent.
    if (Math.floor(iterationCounter * 0.1) === targetTenPercent) {
      foundTenPercent = !!1; // Equivalent to true
    }

    // If both percentage conditions are met for the current iterationCounter, we found the answer.
    if (foundEightPercent === !!1 && foundTenPercent === !!1) {
      finalResult = iterationCounter; // Store the current iterationCounter as the result.
      break; // Exit the loop as the answer has been found.
    }

    // Reset the flags for the next iteration.
    foundEightPercent = !0;
    foundTenPercent = !0;

    // Update the current 10% price check value based on the iterationCounter.
    currentPriceCheck = Math.floor(iterationCounter * 0.1);
    // Increment the iteration counter to check the next potential base value.
    iterationCounter++;
  }

  // Output the final computed result to the standard console.
  console.log(finalResult);
};

// Read input from standard input, decode it as UTF-8, remove leading/trailing whitespace,
// and then split it into an array of lines. This array is passed to the processing function.
processInputData(require('fs').readFileSync('/dev/stdin', 'UTF-8').trim().split("\n"));
