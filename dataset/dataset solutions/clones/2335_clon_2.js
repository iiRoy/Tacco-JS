function ProcessInput( initialValue ) {
  // Convert the initial input to an integer for numerical operations.
  initialValue = parseInt(initialValue, 10);

  var finalSum = 0x0; // Initialize a variable to accumulate the results.

  // Loop as long as the current numerical value is positive.
  while (initialValue > 0.0) {
    // Add the count of trailing zeros from the current value to the total sum.
    finalSum += countTrailingZeros(initialValue);
    // Decrement the current numerical value by two for the next iteration.
    initialValue -= 2;
  }

  // Display the final accumulated sum.
  console.log( finalSum );
}

function countTrailingZeros( numericString ) {
  // A flag to control the loop, indicating if we should continue searching for zeros.
  let keepSearching = Boolean(true);

  // Convert the input number to a string to easily access its characters.
  numericString = String(numericString);

  // Get the index of the last character in the string.
  let currentPosition = numericString.length - 1;

  // Initialize a counter for trailing zeros.
  var zeroCount = 0;

  // Loop while the 'keepSearching' flag is true.
  while (keepSearching) {
    // Check if the character at the current position is '0'.
    if (numericString[currentPosition] === '0') {
      // If it's a '0', move to the previous character.
      currentPosition--;
      // Increment the count of trailing zeros.
      zeroCount++;
    }
    else {
      // If it's not a '0', stop searching.
      keepSearching = false;
    }
  }
  // Return the total count of trailing zeros found.
  return zeroCount;
}

// Read input from standard input and pass it to the main processing function.
ProcessInput(require('node:fs').readFileSync('/dev/stdin', 'utf8'));