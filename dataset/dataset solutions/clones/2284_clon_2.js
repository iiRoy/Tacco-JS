"use strict";

function processInput(rawData) {
  // Parse the first line for the number of digits
  const digitCount = parseInt(rawData[0]);
  // Parse the second line for the first boundary number
  let firstBoundary = parseInt(rawData[1].trim().split(" ").join(""));
  // Parse the third line for the second boundary number
  let secondBoundary = parseInt(rawData[2].trim().split(" ").join(""));

  // Predefined starting numbers for different digit counts
  let initialValues = [12, 123, 1234, 12345, 123456, 1234567, 12345678];

  // If boundaries are identical, no numbers are between them
  if (firstBoundary === secondBoundary) {
    console.log(0);
  } else {
    // Ensure firstBoundary is always less than secondBoundary
    if (secondBoundary < firstBoundary) {
      // Swap values using a comma expression
      firstBoundary = secondBoundary + (secondBoundary = firstBoundary, 0);
    }

    let isCountingActive = false; // Flag to indicate when to start counting
    let validNumberCount = 0; // Accumulator for valid numbers

    // Iterate through numbers from a predefined start up to 87654321
    for (let currentNumber = initialValues[digitCount - 2]; currentNumber <= 87654321; currentNumber++) {
      // Check if counting is active and the current number has the required digitCount
      if (isCountingActive && ((currentNumber + "").length === digitCount)) {
        const numberDigits = (currentNumber + "").trim().split(""); // Convert number to array of digits
        let isInvalid = false; // Flag to mark if the number is invalid
        let digitFrequency = [0, 0, 0, 0, 0, 0, 0, 0]; // Array to track digit occurrences

        // Check each digit for validity
        for (let digitIndex = 0; digitIndex < numberDigits.length; digitIndex++) {
          // Increment frequency for the current digit
          digitFrequency[numberDigits[digitIndex] - 1]++;
          // If digit is greater than digitCount, it's invalid
          if (numberDigits[digitIndex] > digitCount) {
            isInvalid = true;
            break;
          }
          // If digit appears more than once, it's invalid
          else if (digitFrequency[numberDigits[digitIndex] - 1] > 1) {
            isInvalid = true;
            break;
          }
        }

        // If the number is valid (no repeated digits, no digits > digitCount, and no '0')
        if (!isInvalid && ((currentNumber + "").indexOf("0") === -1)) {
          validNumberCount++; // Increment the count of valid numbers
          // console.log(currentNumber); // Debugging: show valid numbers
        }
      }

      // Activate counting when the first boundary is reached
      if (currentNumber === firstBoundary) {
        isCountingActive = true;
      }

      // When the second boundary is reached, print the count and exit
      if (currentNumber === secondBoundary) {
        console.log(validNumberCount);
        break;
      }
    }
  }
}

// Read input from stdin, process it, and pass to the main function
processInput(require('fs').readFileSync('/dev/stdin', 'utf8').trim().split("\n"));
