function calculateSpecialNumbers(depthLevel, currentNumber, limitValue, totalCount) {
  // Check if the current number has exceeded the specified limit.
  // If it has, this branch of recursion terminates, returning the accumulated count.
  if (currentNumber > limitValue) {
    return totalCount;
  }

  // Declare an array to keep track of whether digits 3, 5, and 7 are present in the current number.
  // The array is indexed by digit value for easy access.
  var digitFlags = new Array(10);
  var temporaryNumber = currentNumber; // A temporary variable to extract digits without altering currentNumber.

  // Iterate through the digits of temporaryNumber from right to left.
  while (temporaryNumber > 0) {
    // Get the last digit of temporaryNumber.
    switch (temporaryNumber % 10) {
      case 3: {
        digitFlags[3] = true; // Mark that digit 3 has been found.
        break;
      }
      case 5: {
        digitFlags[5] = true; // Mark that digit 5 has been found.
        break;
      }
      case 7: {
        digitFlags[7] = true; // Mark that digit 7 has been found.
        break;
      }
      default: {
        // Ignore other digits.
        break;
      }
    }
    // Remove the last digit from temporaryNumber.
    temporaryNumber = Math.floor(temporaryNumber / 10);
  }

  // If the current number contains all three digits (3, 5, and 7), increment the total count.
  totalCount += (digitFlags[3] === true && digitFlags[5] === true && digitFlags[7] === true) ? 1 : 0;

  // Recursively call this function to generate new numbers by appending 3, 5, or 7.
  // The new number is formed by adding (10^depthLevel * digit) to the current number.
  // Each recursive call starts with a fresh count of 0 for its own branch.
  totalCount += calculateSpecialNumbers(depthLevel + 1, Math.pow(10, depthLevel) * 3 + currentNumber, limitValue, 0);
  totalCount += calculateSpecialNumbers(depthLevel + 1, Math.pow(10, depthLevel) * 5 + currentNumber, limitValue, 0);
  totalCount += calculateSpecialNumbers(depthLevel + 1, Math.pow(10, depthLevel) * 7 + currentNumber, limitValue, 0);

  // Return the final accumulated count for this particular recursive path.
  return totalCount;
}

// The primary function to handle input and orchestrate the counting process.
function ProcessInput(rawData) {
  // Convert the raw input string into an integer, which serves as the upper limit.
  var limitValue = parseInt(rawData);
  var finalCount = 0; // Initialize the overall counter for numbers meeting the criteria.

  // Initiate the recursive generation process by starting with the base digits 3, 5, and 7.
  // Each call explores a branch of numbers starting with that digit.
  finalCount += calculateSpecialNumbers(1, 3, limitValue, 0);
  finalCount += calculateSpecialNumbers(1, 5, limitValue, 0);
  finalCount += calculateSpecialNumbers(1, 7, limitValue, 0);

  // Output the final computed count to the console.
  console.log(finalCount);
}

// This line should not be edited (reads from standard input and calls ProcessInput)
ProcessInput(require("fs").readFileSync("/dev/stdin", "utf8"));
