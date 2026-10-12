var fileSystemModule = require('fs');

// Determine the size of the standard input stream
var dataSize = fileSystemModule.fstatSync(process.stdin.fd).size;

// Allocate a buffer to hold the input data
var inputBuffer = new Buffer(dataSize);

// Read data from standard input into the buffer
var actualBytesRead = fileSystemModule.readSync(process.stdin.fd, inputBuffer, 0, dataSize, 0);

// Convert the buffer content to a UTF-8 string, trim whitespace, and split into lines
var inputLines = inputBuffer.toString('utf8', 0, actualBytesRead).trim().split('\n');

// Begin processing the input
processInputData();

function processInputData() {
  // Iterate through each line provided in the input
  for (var lineIndex = 0, totalLines = inputLines.length; lineIndex < totalLines; lineIndex++) {
    // Split the current line into individual characters (digits)
    var currentLineChars = inputLines[lineIndex].split('');

    // Initialize an array to count occurrences of each digit (0-9)
    // Index 0 is unused, indices 1-9 store counts for digits 1-9
    var digitOccurrences = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0];

    // Populate the digitOccurrences array based on the current line's characters
    for (var charIndex = 0, charCount = currentLineChars.length; charIndex < charCount; charIndex++) {
      digitOccurrences[currentLineChars[charIndex]]++; // Increment count for the respective digit
    }

    // This array will store the digits that can be "picked" to form a valid set
    var validPicks = [];

    // Outer loop: Iterate through possible "first pick" digits (1 to 9)
    MAIN_PICK_LOOP: for (var firstPickDigit = 1; firstPickDigit <= 9; firstPickDigit++) {
      // Skip if the digit appears 4 times (cannot pick 1 more and then 2 of another)
      // Or if there are no adjacent digits (cannot form a sequence of 3)
      if (digitOccurrences[firstPickDigit] === 4 || (!digitOccurrences[firstPickDigit - 1] && !digitOccurrences[firstPickDigit] && !digitOccurrences[firstPickDigit + 1])) {
        continue; // Move to the next firstPickDigit
      }

      // Inner loop: Iterate through possible "second pick" digits (1 to 9)
      for (var secondPickDigit = 1; secondPickDigit <= 9; secondPickDigit++) {
        // If the second pick digit is not present, it cannot be picked twice
        if (digitOccurrences[secondPickDigit] === 0) {
          continue; // Move to the next secondPickDigit
        }

        // Create a temporary copy of the digit counts for modification
        var tempOccurrences = digitOccurrences.slice(0);

        // Simulate picking the first digit once and the second digit twice
        tempOccurrences[firstPickDigit]++;
        tempOccurrences[secondPickDigit] -= 2;

        // Innermost loop: Attempt to reduce counts by forming sets of 3 (sequences or triplets)
        for (var checkDigit = 1; checkDigit <= 9; checkDigit++) {
          // Check for a sequence of three consecutive digits (e.g., 1-2-3)
          if (tempOccurrences[checkDigit - 1] >= 1 && tempOccurrences[checkDigit] >= 1 && tempOccurrences[checkDigit + 1] >= 1) {
            tempOccurrences[checkDigit - 1]--;
            tempOccurrences[checkDigit]--;
            tempOccurrences[checkDigit + 1]--;
          }
          // Check for another sequence of three consecutive digits (e.g., another 1-2-3)
          if (tempOccurrences[checkDigit - 1] >= 1 && tempOccurrences[checkDigit] >= 1 && tempOccurrences[checkDigit + 1] >= 1) {
            tempOccurrences[checkDigit - 1]--;
            tempOccurrences[checkDigit]--;
            tempOccurrences[checkDigit + 1]--;
          }
          // Check for a triplet of the same digit (e.g., 3-3-3)
          if (tempOccurrences[checkDigit] >= 3) {
            tempOccurrences[checkDigit] -= 3;
          }
        }

        // Calculate the sum of remaining digit counts
        var remainingCount = 0;
        for (var checkDigit = 1; checkDigit <= 9; checkDigit++) {
          remainingCount += tempOccurrences[checkDigit];
        }

        // If all counts are zero after reductions, a valid set was formed
        if (!remainingCount) {
          validPicks.push(firstPickDigit); // Add the first pick digit to the results
          continue MAIN_PICK_LOOP; // Move to the next firstPickDigit, as we found a solution for this one
        }
      }
    }

    // Output the results: either the space-separated valid picks or '0' if none were found
    console.log(validPicks.length ? validPicks.join(' ') : '0');
  }
}
