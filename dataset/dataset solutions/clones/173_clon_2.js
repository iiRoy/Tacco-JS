var ioModule = require('fs') // Utilize the file system module for I/O operations
  , inputSize = ioModule.fstatSync(process.stdin.fd).size // Determine the size of the incoming data stream
  , rawBytesBuffer = new Buffer(inputSize) // Allocate a memory buffer for the raw input
  , actualBytesRead = ioModule.readSync(process.stdin.fd, rawBytesBuffer, 0, inputSize, 0) // Read bytes from standard input into the buffer
  , inputLines = rawBytesBuffer.toString('utf8', 0, actualBytesRead).trim().split('\n'); // Convert buffer to UTF-8 string, trim, and split into an array of lines

processInputData(); // Initiate the primary data processing routine

function processInputData() {
  for (let lineIndex = 0, totalLines = inputLines.length; lineIndex < totalLines; ++lineIndex) { // Iterate through each provided line of input
    var currentLineDigits = inputLines[lineIndex].split(''); // Deconstruct the current line into individual digit characters

    var digitOccurrences = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]; // Initialize an array to count frequencies of digits (0-10)
    for (let charPosition = 0, digitCount = currentLineDigits.length; charPosition < digitCount; charPosition++) {
      digitOccurrences[currentLineDigits[charPosition]]++; // Populate the frequency array based on input digits
    }

    var possibleCompletions = []; // Array to store the digits that can complete the set
  CANDIDATE_LOOP: for (let candidateDigit = 1; candidateDigit <= 9; candidateDigit++) { // Explore each digit from 1 to 9 as a potential completion

      // Skip this candidate if it already has 4 occurrences or if no sequence involving it is possible
      if (
        digitOccurrences[candidateDigit] == 4 ||
        (!digitOccurrences[candidateDigit - 1] && !digitOccurrences[candidateDigit] && !digitOccurrences[candidateDigit + 1])
      ) {
        continue;
      }

      for (let pairDigit = 1; pairDigit <= 9; pairDigit++) { // Iterate through digits to form a pair

        if (digitOccurrences[pairDigit] == 0) {
          continue; // If no tiles of this digit exist, skip
        }

        let workingOccurrences = digitOccurrences.slice(0); // Create a mutable copy of the digit frequencies
        workingOccurrences[candidateDigit]++; // Add the "missing" candidate tile
        workingOccurrences[pairDigit] -= 2; // Remove two tiles for the required pair

        for (let checkIndex = 1; checkIndex <= 9; checkIndex++) { // Attempt to form sequences and triplets
          // Check for and remove a sequence (e.g., 1-2-3)
          if (workingOccurrences[checkIndex - 1] >= 1 && workingOccurrences[checkIndex] >= 1 && workingOccurrences[checkIndex + 1] >= 1) {
            workingOccurrences[checkIndex - 1]--;
            workingOccurrences[checkIndex]--;
            workingOccurrences[checkIndex + 1]--;
          }
          // Check for and remove a second sequence if available
          if (workingOccurrences[checkIndex - 1] >= 1 && workingOccurrences[checkIndex] >= 1 && workingOccurrences[checkIndex + 1] >= 1) {
            workingOccurrences[checkIndex - 1]--;
            workingOccurrences[checkIndex]--;
            workingOccurrences[checkIndex + 1]--;
          }
          // Check for and remove a triplet (e.g., 3x 7)
          if (workingOccurrences[checkIndex] >= 3) {
            workingOccurrences[checkIndex] -= 3;
          }
        }
        let remainingTiles = 0; // Variable to sum up any unplaced tiles
        for (let checkIndex = 1; checkIndex <= 9; checkIndex++) {
          remainingTiles += workingOccurrences[checkIndex]; // Accumulate the count of leftover tiles
        }

        if (!remainingTiles) { // If all tiles have been successfully grouped into sequences and triplets (sum is zero)
          possibleCompletions.push(candidateDigit); // This candidate digit is a valid completion
          continue CANDIDATE_LOOP; // Move to the next candidate digit to check
        }
      }
    }

    console.log(possibleCompletions.length ? possibleCompletions.join(' ') : '0'); // Output the valid completions, or '0' if none
  }
}