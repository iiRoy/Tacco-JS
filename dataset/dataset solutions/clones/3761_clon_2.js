// This function processes the entire input data received.
function ProcessInput(inputString) {
  // Convert the provided string into an integer value.
  const parsedNumber = parseInt(inputString);

  // Evaluate if the numerical value is greater than the threshold of 999.
  if (parsedNumber > 999) {
    // If the condition is met, print 'ABD' to the console.
    console.log('ABD');
    // Exit the function immediately after printing.
    return;
  }

  // Otherwise (if the number is 999 or less), print 'ABC' to the console.
  console.log('ABC');
}

// The following line should not be altered; it manages reading from standard input and initiating the primary function.
ProcessInput(require("fs").readFileSync("/dev/stdin", "utf8"));
