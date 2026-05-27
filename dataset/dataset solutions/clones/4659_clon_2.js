// This function is designed to process a given input string.
function ProcessInput(rawData) {
  // Convert the raw input string into an integer value.
  var numericValue = parseInt(rawData);

  // Initialize a variable to hold the minimum number of digits found.
  // It starts with the digit count of the input number itself.
  var minDigits = String(numericValue).length;

  // Begin an iterative process from zero up to the square root of the numeric value.
  // This loop aims to discover factors of the numeric value.
  for (loopCounter = 0x0; loopCounter < Math.sqrt(numericValue); loopCounter++) {
    // Calculate the maximum digit count between the current iteration variable
    // and the quotient of the numeric value divided by the iteration variable.
    currentMaxDigits = Math.max(String(loopCounter).length, String(numericValue / loopCounter).length);

    // Evaluate if the 'loopCounter' is a perfect divisor of 'numericValue'
    // AND if the 'currentMaxDigits' is less than the 'minDigits' recorded so far.
    if (numericValue % loopCounter === 0 && currentMaxDigits < minDigits) {
      // If both conditions are met, update 'minDigits' with the new, smaller digit count.
      minDigits = currentMaxDigits;
    }
  }

  // Display the final calculated minimum number of digits to the console.
  console.log('%s', minDigits);
}

// Execute the main processing function by reading data from standard input.
ProcessInput(require("fs").readFileSync("/dev/stdin", "utf8"));
