function ProcessInputData(rawTextStream) {
  // Split the incoming raw data into individual lines for easier processing.
  const processedLines = rawTextStream.split("\n");

  // Parse the first line to get the total length of the sequence.
  const stringLength = parseInt(processedLines[0], 10);

  // The second line contains the primary character sequence.
  const targetString = processedLines[1];

  // Initialize an array to potentially store character codes, although unused in this logic.
  const alphabetCharCodes = new Array(26);

  // Initialize arrays to store the first and last occurrence indices for each letter of the alphabet.
  // 'firstIndex[k]' will hold the index of the first 'k'-th letter ('a' for k=0, 'b' for k=1, etc.)
  // 'lastIndex[k]' will hold the index of the last 'k'-th letter.
  const firstIndex = new Array(26);
  const lastIndex = new Array(26);


  // Iterate through each character of the English alphabet (a-z).
  for (let charIterator = 0; charIterator < 26; charIterator++) {
    
    // Find the first occurrence of the current alphabet character.
    // The ASCII code for 'a' is 97, so 'charIterator + 97' gives the ASCII for the current letter.
    for (firstIndex[charIterator] = 0;
         firstIndex[charIterator] < stringLength;
         firstIndex[charIterator]++) {
      if (targetString.charCodeAt(firstIndex[charIterator]) === charIterator + 97) {
        break; // Found the first occurrence, exit inner loop.
      }
    }

    // Find the last occurrence of the current alphabet character.
    // Search backwards from the end of the string down to the first occurrence.
    for (lastIndex[charIterator] = stringLength;
         lastIndex[charIterator] >= firstIndex[charIterator];
         lastIndex[charIterator]--) {
      if (targetString.charCodeAt(lastIndex[charIterator]) === charIterator + 97) {
        break; // Found the last occurrence, exit inner loop.
      }
    }
  }

  // Variable to count how many character ranges overlap at a specific position.
  let currentOverlap;
  // Variable to store the highest overlap count found across all positions.
  let maximumOverlapCount = 0;

  // Iterate through each possible position within the target string.
  for (let positionTracker = 0;
       positionTracker < stringLength;
       positionTracker++) {
    currentOverlap = 0; // Reset the overlap counter for the new position.

    // For the current position, check against the range of every alphabet character.
    for (let alphaIndex = 0; alphaIndex < 26; alphaIndex++) {
      // If the current position falls within the [first occurrence, last occurrence) range
      // for the 'alphaIndex'-th character, then it contributes to the overlap.
      if (positionTracker >= firstIndex[alphaIndex] &&
          positionTracker < lastIndex[alphaIndex]) {
        currentOverlap++; // Increment the overlap count for this position.
      }
    }

    // Update the maximum overlap found if the current position's overlap is greater.
    if (currentOverlap > maximumOverlapCount) {
      maximumOverlapCount = currentOverlap;
    }
  }

  // Output the final maximum overlap count to the console.
  console.log('%d', maximumOverlapCount);
}

// Read input from standard input and pass it to the processing function.
ProcessInputData(require("fs").readFileSync("/dev/stdin", "utf8"));