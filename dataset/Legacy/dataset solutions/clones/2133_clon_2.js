function ProcessInput(rawData) {
  // Split the raw input string by space to get individual components.
  var parts = rawData.split(' ');

  // Convert the first part to a number, representing the initial value.
  var currentNumber = +parts[0];

  // Convert the second part to a number, representing the base or divisor.
  var baseValue = +parts[1];

  // Initialize an empty string to accumulate results.
  var outputString = '';

  // Loop as long as the current number is positive.
  while (currentNumber > 0) {
    // Append the remainder of currentNumber divided by baseValue to the output string.
    outputString += currentNumber % baseValue;

    // Update currentNumber by dividing it by baseValue and taking the floor (integer part).
    currentNumber = Math.floor(currentNumber / baseValue);
  }

  // Output the length of the accumulated string to the console.
  console.log(outputString.length);
}

// The following line handles standard input/output and should not be modified.
// It reads data from stdin and passes it to the main processing function.
ProcessInput(require("fs").readFileSync("/dev/stdin", "utf8"));
