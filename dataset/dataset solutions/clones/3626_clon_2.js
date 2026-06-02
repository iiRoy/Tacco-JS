function ProcessInput(rawData) {
  // Divide the incoming raw data string into an array of individual lines.
  const parsedLines = rawData.split("\n");

  // Convert the first line of input into an integer, specifying base 10.
  let targetNumber = parseInt(parsedLines[0], 10);

  // Initialize the string that will hold our final result.
  let resultString = "1";

  // A variable to keep track of the running sum or boundary value.
  let currentSum = 0;

  // This variable will store the last relevant index from the initial loop.
  let lastIndex = 0;

  // Logic branch for handling positive input numbers.
  if (targetNumber > 0) {
    // First iterative cycle: Determine the appropriate range and the maximum index.
    for (let loopCounter = 0; currentSum < targetNumber; loopCounter += 2) {
      currentSum += Math.pow(2, loopCounter); // Increment currentSum by powers of 2.
      lastIndex = loopCounter; // Record the current loop index.
    }

    // Second iterative cycle: Construct the binary-like representation.
    for (let loopCounter = 0; loopCounter < lastIndex; loopCounter++) {
      // Evaluate a condition based on the target number and a calculated value.
      if (targetNumber > currentSum - Math.pow(2, lastIndex - loopCounter) / 2) {
        // If the condition is met, append '0' or '1' based on the loop counter's parity.
        if (loopCounter % 2 === 0) {
          resultString += "0"; // Append '0'.
          // currentSum remains unchanged in this specific path.
        } else {
          resultString += "1"; // Append '1'.
          // currentSum remains unchanged here as well.
        }
      } else {
        // If the condition is not met, append '1' or '0' and adjust currentSum.
        if (loopCounter % 2 === 0) {
          resultString += "1"; // Append '1'.
          currentSum -= Math.pow(2, lastIndex - loopCounter) / 2; // Modify currentSum.
        } else {
          resultString += "0"; // Append '0'.
          currentSum -= Math.pow(2, lastIndex - loopCounter) / 2; // Modify currentSum.
        }
      }
    }
  }
  // Logic branch for handling negative input numbers.
  else if (targetNumber < 0) {
    // First iterative cycle: Determine the appropriate range and maximum index for negative values.
    for (let loopCounter = 1; currentSum > targetNumber; loopCounter += 2) {
      currentSum += Math.pow(-2, loopCounter); // Increment currentSum by powers of -2.
      lastIndex = loopCounter; // Record the current loop index.
    }

    // Second iterative cycle: Construct the binary-like representation for negative numbers.
    for (let loopCounter = 1; loopCounter <= lastIndex; loopCounter++) {
      // Evaluate a condition based on the target number and a calculated value.
      if (targetNumber > currentSum + Math.pow(2, lastIndex - (loopCounter - 1)) / 2) {
        // If the condition is met, append '0' or '1' based on the loop counter's parity.
        if (loopCounter % 2 === 0) {
          resultString += "0"; // Append '0'.
          // currentSum remains unchanged in this specific path.
        } else {
          resultString += "1"; // Append '1'.
          // currentSum remains unchanged here as well.
        }
      } else {
        // If the condition is not met, append '1' or '0' and adjust currentSum.
        if (loopCounter % 2 === 0) {
          resultString += "1"; // Append '1'.
          currentSum += Math.pow(2, lastIndex - (loopCounter - 1)) / 2; // Modify currentSum.
        } else {
          resultString += "0"; // Append '0'.
          currentSum += Math.pow(2, lastIndex - (loopCounter - 1)) / 2; // Modify currentSum.
        }
      }
    }
  }
  // Logic branch for when the input number is zero.
  else {
    resultString = "0"; // The result for zero is simply "0".
  }

  // Print the final generated string to the console.
  console.log('%s', resultString);
}

// Read the entire content of standard input synchronously and pass it to the processing function.
ProcessInput(require("fs").readFileSync("/dev/stdin", "utf8"));
