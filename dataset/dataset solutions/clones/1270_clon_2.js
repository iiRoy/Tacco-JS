const inputHandler = require('readline').createInterface({
  input: process.stdin,
  output: process.stdout
});

inputHandler.on('line', function (inputStr) {
  let counter, currentNum, outputBuffer = ''; // Declare variables for iteration, current value, and accumulated string.

  const parts = inputStr.split(' '); // Split the input line by space into an array of strings.

  const limitVal = parseInt(parts[0], 10); // Convert the first part to an integer, base 10.

  // Iterate from 3 up to the determined limit value.
  for (counter = 3; counter <= limitVal; counter++) {
    currentNum = counter; // Assign the loop counter to a temporary variable for digit checking.

    // Check if the current number is perfectly divisible by 3.
    if (currentNum % 3 === 0) {
      outputBuffer += ' '; // Append a space to the result string.
      outputBuffer += currentNum; // Append the number itself.
    }
    else {
      // If not divisible by 3, check if it contains the digit '3'.
      // This inner loop repeatedly divides the number by 10 to inspect each digit.
      for (; ; currentNum = Math.floor(currentNum / 10)) {
        if (currentNum < 1) { // If the number becomes less than 1, all digits have been checked.
          break; // Exit the inner loop.
        }
        if (currentNum % 10 === 3) { // Check if the last digit is 3.
          outputBuffer += ' '; // Append a space.
          outputBuffer += counter; // Append the original number (from the outer loop) to the result.
          break; // Exit the inner loop as a '3' was found.
        }
      }
    }
  }

  console.log(outputBuffer); // Output the final constructed string to the console.
  process.exit(); // Terminate the Node.js process.
});

// An empty event handler for the 'end' of the standard input stream.
process.stdin.on('end', function () {
  // No specific actions are required when the input stream ends.
});
