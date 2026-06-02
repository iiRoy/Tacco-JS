'use strict'

function calculateOptimalScore(numElements, inputArray) {
  // Initialize memoization table (dp array)
  // Original: var dp = new Array(N+1).fill(0).map(e => new Array(N+1).fill(0))
  let memoTable = [];
  for (let idx = 0; idx <= numElements; idx++) {
    memoTable.push(new Array(numElements + 1).fill(0));
  }

  // Iterate through possible interval lengths
  // Original loop structure iterated by starting column 'col' and then row 'r',
  // deriving current column 'c'. This is equivalent to iterating by interval length.
  // len represents the length of the subarray (j - i).
  for (let len = 0; len < numElements; len++) {
    // i is the 1-based starting index of the subarray
    for (let i = 1; i <= numElements - len; i++) {
      // j is the 1-based ending index of the subarray
      let j = i + len;

      // Extract values from the input array for clarity and reuse
      let valueFromLeft = inputArray[i - 1];
      let valueFromRight = inputArray[j - 1];

      if (len === 0) { // Base case: subarray of length 1 (i === j)
        memoTable[i][j] = valueFromLeft;
      } else if (len === 1) { // Base case: subarray of length 2 (j === i + 1)
        memoTable[i][j] = Math.max(valueFromLeft, valueFromRight);
      } else { // General case: subarray of length > 2
        // Scenario 1: Current player picks the element from the left end (inputArray[i-1])
        // The opponent is then left with the subarray from (i+1) to j.
        // The opponent will play optimally to minimize the current player's score from the remaining elements.
        // Opponent's choices:
        //   1. Pick from (i+1): Remaining for current player is (i+2) to j. Score: memoTable[i+2][j]
        //   2. Pick from j: Remaining for current player is (i+1) to (j-1). Score: memoTable[i+1][j-1]
        let scoreIfLeftPicked = valueFromLeft + Math.min(memoTable[i + 2][j], memoTable[i + 1][j - 1]);

        // Scenario 2: Current player picks the element from the right end (inputArray[j-1])
        // The opponent is then left with the subarray from i to (j-1).
        // Opponent's choices:
        //   1. Pick from i: Remaining for current player is (i+1) to (j-1). Score: memoTable[i+1][j-1]
        //   2. Pick from (j-1): Remaining for current player is i to (j-2). Score: memoTable[i][j - 2]
        let scoreIfRightPicked = valueFromRight + Math.min(memoTable[i + 1][j - 1], memoTable[i][j - 2]);

        // The current player chooses the move that maximizes their own score
        memoTable[i][j] = Math.max(scoreIfLeftPicked, scoreIfRightPicked);
      }
    }
  }

  // The total score Taro gets from the entire array (from index 1 to numElements)
  let taroScore = memoTable[1][numElements];

  // Calculate the total sum of all elements in the input array
  let totalSum = inputArray.reduce((accumulator, currentVal) => accumulator + currentVal, 0);

  // The problem asks for Taro's score minus Jiro's score.
  // We know: Taro's score + Jiro's score = totalSum
  // Therefore: Jiro's score = totalSum - Taro's score
  // The final result is: Taro's score - (totalSum - Taro's score)
  // Which simplifies to: 2 * Taro's score - totalSum
  return (2 * taroScore) - totalSum;
}

// Main function to handle input and output operations
function processInputAndSolve(inputString) {
  // Split the entire input string into individual lines
  let inputLines = inputString.split('\n');

  // Parse the number of elements from the first line
  let numElements = Number(inputLines[0]);

  // Parse the array of numbers from the second line
  let inputArray = inputLines[1].split(' ').map(valStr => Number(valStr));

  // Call the core logic function to get the final result
  let finalResult = calculateOptimalScore(numElements, inputArray);

  // Output the computed result to the console
  console.log(finalResult);
}

// Helper function to abstract reading from standard input
const getStandardInputContent = () => require('fs').readFileSync('/dev/stdin', 'utf8');

// Execute the main processing function with content read from standard input
processInputAndSolve(getStandardInputContent());
