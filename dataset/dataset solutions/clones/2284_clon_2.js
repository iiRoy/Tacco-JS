"use strict";

function executeProcessing(dataLines) {
  const desiredLength = Number.parseInt(dataLines[0], 10);
  let startPermutation = Number.parseInt(dataLines[1].replace(/ /g, ""), 10);
  let endPermutation = Number.parseInt(dataLines[2].replace(/ /g, ""), 10);

  let initialSequenceValues = [12, 123, 1234, 12345, 123456, 1234567, 12345678];

  if (startPermutation === endPermutation) {
    console.log(0);
  } else {
    // Ensure startPermutation is the smaller value
    if (endPermutation < startPermutation) {
      startPermutation = endPermutation + (endPermutation = startPermutation, 0); // Swaps values
    }

    let isRangeActive = false; // Flag to indicate if we are within the desired range
    let validCount = 0;        // Counter for valid permutations

    // Iterate through numbers from a calculated start to a fixed upper bound
    for (let currentCandidate = initialSequenceValues[desiredLength - 2];
         currentCandidate <= 87654321;
         currentCandidate++
    ) {
      if (isRangeActive && (String(currentCandidate).length === desiredLength)) {
        const candidateDigits = String(currentCandidate).split('');
        let hasValidationFailed = false;
        let digitFrequency = [0, 0, 0, 0, 0, 0, 0, 0]; // Stores frequency of digits 1-8

        // Check for digit validity and uniqueness
        for (let digitIndex = 0; digitIndex < candidateDigits.length; digitIndex++) {
          const currentDigit = Number.parseInt(candidateDigits[digitIndex], 10);
          digitFrequency[currentDigit - 1]++; // Increment count for the digit

          if (currentDigit > desiredLength) { // Digit value exceeds desired length
            hasValidationFailed = true;
            break;
          } else if (digitFrequency[currentDigit - 1] > 1) { // Digit is not unique
            hasValidationFailed = true;
            break;
          }
        }

        // If no validation issues and no zeros are present
        if (!hasValidationFailed && (!String(currentCandidate).includes('0'))) {
          validCount++;
        }
      }

      // Activate the counting flag when the starting permutation is reached
      if (currentCandidate === startPermutation) {
        isRangeActive = true;
      }

      // Output the count and terminate when the ending permutation is reached
      if (currentCandidate === endPermutation) {
        console.log(validCount);
        break;
      }
    }
  }
}

executeProcessing(
  require('fs')
    .readFileSync('/dev/stdin', 'utf8')
    .trim()
    .split('\n')
);