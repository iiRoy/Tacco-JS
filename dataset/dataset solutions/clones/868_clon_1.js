// This is a Type I clone generated from an original JavaScript source file.
// All identifiers, operators, and expressions remain strictly identical.
// Only whitespace and comments have been extensively altered to create visual distinction.

/*
 *  Original creation metadata:
 *  Created by hiroqn on 13/10/07.
 *  This file processes input to solve a dynamic programming problem.
 */
var fs = require('fs')
  , // Node.js 'fs' module for file system operations.
  length = fs.fstatSync(process.stdin.fd).size
  , // Determine the byte size of the standard input stream.
  buffer = new Buffer(length)
  , // Allocate a new buffer of the determined size to hold input data.
  bytesRead = fs.readSync(process.stdin.fd, buffer, 0, length, 0)
  , // Synchronously read data from stdin into the buffer.
  input = buffer.toString('utf8', 0, bytesRead).split('\n')
; // Convert the buffer to a UTF-8 string, then split it into an array of lines.

// The program's execution begins here.
main();


// -----------------------------------------------------------------------------
// Function: matrix
// Description: Creates and initializes a 2D array (matrix) with a specified value.
//
// Parameters:
//   @param {number} n    - The number of rows for the matrix.
//   @param {number} m    - The number of columns for the matrix.
//   @param {*}      init - The initial value to populate each cell of the matrix.
//
// Returns:
//   @returns {Array<Array<*>>} - A new 2D array (matrix).
// -----------------------------------------------------------------------------
function matrix(n, m, init) {

  var arr = [], // Declaration of the main array that will hold rows.
    i, // Loop counter for iterating through rows.
    j; // Loop counter for iterating through columns.

  // Outer loop: Iterate to create 'n' rows.
  for (i = 0; i < n; i++) {

    arr[i] = []; // Initialize the current row as an empty array.

    // Inner loop: Iterate to populate 'm' columns in the current row.
    for (j = 0; j < m; j++) {

      arr[i][j] = init; // Assign the initial value to the current cell [i][j].
    }
  }

  return arr; // Return the complete 2D array.
}


// -----------------------------------------------------------------------------
// Function: solve
// Description: Solves a dynamic programming problem to find the maximum value
//              that can be achieved for a given melody, using a list of phrases.
//
// Parameters:
//   @param {number}   melody      - The target melody value.
//   @param {Array<Array<number>>} phraseList - An array of phrases. Each phrase
//                                               is an array [s, l, p] where:
//                                               s = start point,
//                                               l = length,
//                                               p = points.
//
// Returns:
//   @returns {number} - The maximum possible value for the given melody.
// -----------------------------------------------------------------------------
function solve(melody, phraseList) {

  var n = phraseList.length
    , // 'n' represents the total count of available phrases.
    dp = matrix(n + 1, melody + 1, 0)
    , // 'dp' is our dynamic programming table.
    // dp[i][j] will store the maximum value obtainable using the first 'i' phrases
    // to achieve a melody value of 'j'. It's initialized with zeros.
    i, j, k
    , // Loop iteration variables.
    s, l, p
    , // Variables to temporarily store the 'start', 'length', and 'points' of a phrase.
    max
  ; // A variable to track the maximum value found in a sub-problem.

  // Outer loop: Iterates through each phrase in the 'phraseList'.
  // 'i' goes from 0 to n-1, representing the index of the current phrase.
  for (i = 0; i < n; i++) {

    // Inner loop: Iterates through all possible melody values up to the target 'melody'.
    // 'j' goes from 0 to 'melody'.
    for (j = 0; j <= melody; j++) {

      // Extract the attributes of the current phrase (phraseList[i]).
      s = phraseList[i][0]; // 's' is the start point of the current phrase.
      l = phraseList[i][1]; // 'l' is the length of the current phrase.
      p = phraseList[i][2]; // 'p' is the points value of the current phrase.

      // Conditional check: Can the current phrase 'i' be placed at melody 'j'?
      // A phrase can be placed if its start point 's' is less than or equal to 'j'.
      if (s <= j) {
        // Debugging line, originally commented out, now just a comment.
        // console.log(i, j); // This line could be activated for tracing DP table updates.

        max = 0; // Initialize 'max' to 0 for finding the best prior state.

        // Innermost loop: This loop looks back in the DP table to find the best
        // previous state 'k' that allows the current phrase to be added.
        // The range for 'k' ensures that 'k' is a valid melody value
        // (k >= 0) and that there's enough space for the phrase (k <= j - s).
        for (k = l > j ? 0 : j - l; k <= j - s; k++) {
          // If a value in the DP table at dp[i + 1][k] is greater than the current 'max',
          // update 'max'. This finds the maximum value from states where the current phrase
          // could logically follow.
          if (max < dp[i + 1][k]) {
            max = dp[i + 1][k];
          }
        }

        // Update the DP table:
        // dp[i + 1][j] is the maximum of two possibilities:
        // 1. Not using the current phrase 'i': represented by dp[i][j].
        // 2. Using the current phrase 'i': represented by (max + p).
        //    'max' here is the best result from previous states that can precede
        //    the current phrase, and 'p' is the points from the current phrase.
        dp[i + 1][j] = Math.max(dp[i][j], max + p);

        // Original commented-out lines. These might represent alternative approaches
        // or debugging steps from the original author.
        // range = dp[i + 1].slice(l > j ? 0: j - l, j - s + 1);
        // dp[i + 1][j] = Math.max(dp[i][j], Math.max.apply(null, max) + p);

      } else {
        // If the current phrase's start point 's' is greater than the current melody 'j',
        // this phrase cannot be used. In this case, the value for dp[i + 1][j]
        // is simply carried over from the state before considering the current phrase.
        dp[i + 1][j] = dp[i][j];
      }
    }
  }

  // Debugging line, originally commented out.
  // console.log(dp); // Uncomment to print the entire DP table at the end of solve.

  // The final answer is located at dp[n][melody], which represents the maximum
  // value obtained using all 'n' phrases for the target 'melody'.
  return dp[n][melody];
}


// -----------------------------------------------------------------------------
// Function: main
// Description: The primary function that orchestrates the program's flow.
//              It reads input, processes melody queries, and outputs results.
// -----------------------------------------------------------------------------
function main() {

  var n = input.shift() - 0
    , // Read the first line of input, convert to a number, and store as 'n' (number of phrases).
    phraseList = []
  ; // Initialize an empty array to store the parsed phrase data.

  // Loop to read 'n' lines, each representing a phrase.
  // 'i' is declared globally or in a wider scope and reused.
  for (i = 0; i < n; i++) {
    // For each line:
    // 1. input.shift() removes and returns the next line.
    // 2. .split(' ') splits the line into an array of strings by space.
    // 3. .map(Number) converts each string in the array to a number.
    // 4. phraseList.push() adds this array of numbers (a phrase) to phraseList.
    phraseList.push(input.shift().split(' ').map(Number));
  }

  // Original commented-out code blocks. These might have been for:
  // - Re-assigning 'n' (potentially redundant if 'n' was already phraseList.length).
  // - Sorting the phraseList, possibly by points (a[2]), which might be a
  //   different approach not used in the final DP solution.
  // n = phraseList.length;
  // phraseList.sort(function (a, b) {
  //   return a[2] - b[2];
  // });
  // console.log(phraseList); // Debug line to inspect the sorted/parsed phrase list.


  var m = input.shift() - 0
    , // Read the next line of input, convert to a number, and store as 'm' (number of melodies to process).
    melodyList = []
    , // Initialize an empty array to store the target melody values.
    melody
    , // Variable to hold the current melody being processed.
    ans = []
    , // Array to store the calculated maximum values for each melody.
    i, j, k
    , // Loop counter variables (re-declared/re-used for scope management).
    max
    , // Variable to store the result from the 'solve' function for a single melody.
    flag = true
  ; // A boolean flag to track if all melodies could be composed (i.e., no result was 0).

  // Loop to read 'm' lines, each representing a target melody value.
  for (i = 0; i < m; i++) {
    melodyList.push(input.shift() - 0); // Read, convert to number, and add to melodyList.
  }

  // Loop to process each melody in the 'melodyList'.
  for (i = 0; i < m; i++) {

    melody = melodyList[i]; // Get the current target melody value.

    // Call the 'solve' function to calculate the maximum value for the current melody.
    max = solve(melody, phraseList);

    // Debugging line, originally commented out.
    // console.log(max); // Uncomment to output the max value for each individual melody.

    // Check the result for the current melody.
    if (max === 0) {
      flag = false; // If 'max' is 0, it means this melody could not be composed. Set flag to false.
    } else {
      ans.push(max); // If 'max' is not 0, add the result to the 'ans' array.
    }
  }

  // After processing all melodies, check the 'flag'.
  if (!flag) {
    // If 'flag' is false, at least one melody could not be composed.
    console.log(-1); // Output -1 as per problem specification.
    return; // Terminate the 'main' function.
  }

  // If 'flag' is still true (all melodies were composed successfully),
  // iterate through the 'ans' array and print each result on a new line.
  ans.forEach(function (i) {
    console.log(i); // Print the calculated maximum value.
  });

}

// End of Type I cloned JavaScript code.