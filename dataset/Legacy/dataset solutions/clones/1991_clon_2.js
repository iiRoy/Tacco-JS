function processStringData(N, S) {
  // Convert the input string into an array of characters for easier access.
  const charArr = S.split('');

  // Initialize counters for each color.
  let redCount = 0;
  let greenCount = 0;
  let blueCount = 0;

  // Iterate through the character array to count occurrences of 'R', 'G', 'B'.
  for (const currentChar of charArr) {
    if (currentChar === 'R') {
      ++redCount;
    }
    if (currentChar === 'G') {
      ++greenCount;
    }
    if (currentChar === 'B') {
      ++blueCount;
    }
  }

  // Calculate the total possible combinations of one R, one G, and one B.
  const totalCombinations = redCount * greenCount * blueCount;

  // Initialize a counter for invalid triplets (those that satisfy the j - i == k - j condition).
  let invalidTriplets = 0;

  // Iterate through all possible pairs (idx1, idx2) where idx1 < idx2.
  for (let idx1 = 0; idx1 < N; idx1++) {
    for (let idx2 = idx1 + 1; idx2 < N; idx2++) {
      // If the characters at idx1 and idx2 are the same, this pair cannot form a valid triplet.
      if (charArr[idx1] === charArr[idx2]) {
        continue;
      }

      // Calculate the index for the third character (idx3) based on the condition j - i == k - j.
      // This simplifies to k = 2 * j - i.
      let idx3 = 2 * idx2 - idx1;

      // Check if idx3 is within bounds and if the character at idx3 is different from charArr[idx1] and charArr[idx2].
      if (idx3 >= N || charArr[idx3] === charArr[idx1] || charArr[idx3] === charArr[idx2]) {
        continue;
      }

      // If all conditions are met, this is an invalid triplet. Increment the counter.
      ++invalidTriplets;
    }
  }
  // The final result is the total possible combinations minus the invalid triplets.
  console.log(totalCombinations - invalidTriplets);
}

// Read input from standard input.
const dataLines = require('fs').readFileSync('/dev/stdin', 'utf8').split('\n');

// Call the main processing function with the parsed input.
// N is the first line, S is the second line.
processStringData(parseInt(dataLines[0], 10), dataLines[1]);
