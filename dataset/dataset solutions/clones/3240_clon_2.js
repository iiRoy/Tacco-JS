var rawData = require('fs').readFileSync('/dev/stdin', 'utf8'); // Read input from standard input

var lineSegments = rawData.split('\n'); // Split the input into an array of lines

var countOfItems = Number(lineSegments[0]); // Convert the first line to a number for iteration count

var firstSequence = lineSegments[1].split(''); // Get the second line and split it into characters
var secondSequence = lineSegments[2].split(''); // Get the third line and split it into characters
var thirdSequence = lineSegments[3].split(''); // Get the fourth line and split it into characters

var totalScore = 0; // Initialize a counter for the score

/**
 * Checks if any two characters at a given index across the three sequences are identical.
 * @param {number} idx - The current index to check.
 * @returns {boolean} True if at least two characters are the same, false otherwise.
 */
var checkSimilarity = (idx) => {
  if (firstSequence[idx] === secondSequence[idx] || secondSequence[idx] === thirdSequence[idx] || thirdSequence[idx] === firstSequence[idx]) {
    return true; // Found a pair of identical characters
  }
  return false; // No identical pairs at this index
};

// Iterate through each character position up to the defined count
for (var currentIdx = 0; currentIdx < countOfItems; currentIdx++) {
  // If no two characters are similar at the current position
  if (!checkSimilarity(currentIdx)) {
    totalScore += 2; // Add 2 to the score
  }
  // Else if all three characters are identical
  else if (firstSequence[currentIdx] === secondSequence[currentIdx] && secondSequence[currentIdx] === thirdSequence[currentIdx]) {
    // Do nothing, score remains unchanged for this case
  }
  // Else (meaning exactly two characters are identical)
  else {
    totalScore += 1; // Add 1 to the score
  }
}

console.log(totalScore); // Output the final calculated score
