const readlineInterface = require('readline').createInterface({
  input: process.stdin,
  output: process.stdout
});

// Helper function to determine if a given number contains the digit 3
function checkNumberForDigitThree(numericValue) {
  let temporaryValue = numericValue;
  const TARGET_DIGIT = 3;
  const BASE_FOR_DIGIT_EXTRACTION = 10;

  // Iterate through digits of the number
  while (temporaryValue > 0) {
    // Check if the last digit is the target digit
    if (temporaryValue % BASE_FOR_DIGIT_EXTRACTION === TARGET_DIGIT) {
      return true; // Digit found
    }
    // Remove the last digit for the next iteration
    temporaryValue = Math.floor(temporaryValue / BASE_FOR_DIGIT_EXTRACTION);
  }
  return false; // Digit not found
}

readlineInterface.on('line', function (inputDataLine) {
  let loopCounter;
  let evaluatedNumber;
  let collectedOutputString = "";

  const inputSegments = inputDataLine.split(' ');
  const upperBoundary = parseInt(inputSegments[0], 10);
  const DIVISIBILITY_CHECK_VALUE = 3;

  // Loop from 3 up to the specified upper boundary
  for (loopCounter = DIVISIBILITY_CHECK_VALUE; loopCounter <= upperBoundary; loopCounter++) {
    evaluatedNumber = loopCounter;

    // First condition: check if the number is divisible by 3
    if (evaluatedNumber % DIVISIBILITY_CHECK_VALUE === 0) {
      collectedOutputString += " " + evaluatedNumber;
    }
    // Second condition: if not divisible by 3, check if it contains the digit 3
    else {
      if (checkNumberForDigitThree(evaluatedNumber)) {
        collectedOutputString += " " + evaluatedNumber;
      }
    }
  }

  console.log(collectedOutputString);
  process.exit();
});

process.stdin.on('end', function () {
  // This handler is present in the original but effectively unreachable due to process.exit()
  // Keeping it for structural similarity.
});
