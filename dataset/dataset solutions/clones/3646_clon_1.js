/* This JavaScript code calculates the number of ways to form the subsequence "ABC"
 * within a given input string, where '?' acts as a wildcard that can be 'A', 'B', or 'C'.
 * It uses dynamic programming for an efficient solution.
 */

// Global variables declared at the top of the file.
var line; // Will store the single line of input received from stdin.
var S;    // Will store the input line as an array of characters for easier access.

// A large prime number used as a modulus to prevent integer overflow
// during calculations, especially when dealing with large counts.
const MOD = Math.pow(10, 9) + 7;


// Import the 'readline' module, which is essential for reading input
// line by line in Node.js environments.
var readline = require('readline');


// Create an interface for reading and writing.
// 'input' is set to process.stdin (standard input stream),
// 'output' is set to process.stdout (standard output stream).
var rl = readline.createInterface({
 input : process.stdin,
 output: process.stdout,
});


// Event handler for when a line of input is received.
// In this problem, we expect only one line of input.
rl.on('line', function (x) {
 // Store the received line in the 'line' variable.
 line = x;
});


// Event handler for when the input stream closes (e.g., EOF is reached).
// This is where the main logic of the program executes.
rl.on('close', function () {
  // Convert the input string into an array of characters.
  // E.g., "A?C" becomes ['A', '?', 'C'].
  S = line.split("");

  // Declare the dynamic programming table.
  // 'dp' will be a 2D array.
  var dp;
  dp = Array(S.length + 1); // Initialize 'dp' with (S.length + 1) rows.

  // Loop to initialize each row of the 'dp' table.
  // Each row represents a state in the DP.
  for (var i = 0; i <= S.length; i++) {
    // Each row is an array of size 4 (for states 0, 1, 2, 3), initialized with zeros.
    // State 0: looking for 'A'
    // State 1: looking for 'B' (after finding 'A')
    // State 2: looking for 'C' (after finding 'AB')
    // State 3: "ABC" found
    dp[i] = Array(3 + 1).fill(0);
  }

  // Main DP loop: iterates from the end of the string backwards.
  // This approach is common for suffix-based dynamic programming problems.
  for (var i = S.length; i >= 0; i--) { // 'i' represents the current index in the string S.
    for (var j = 3; j >= 0; j--) {   // 'j' represents the current character we are trying to match in "ABC".

      if (i === S.length) {
        // Base case: If we've processed past the end of the string S.
        // If 'j' is 3, it means we have successfully completed matching "ABC".
        // In this scenario, there is 1 way. Otherwise, 0 ways.
        dp[i][j] = (j === 3 ? 1 : 0);
      }
      else {
        // Recursive step: Calculate dp[i][j] based on previous (future in terms of string index) states.

        // Contribution 1: S[i] does NOT match 'ABC'[j] or is a '?' that doesn't form 'ABC'[j].
        // If S[i] is '?', it can be any of the 3 chars (A, B, C).
        // If it's used as something else, it just passes the count from dp[i+1][j].
        dp[i][j] = dp[i + 1][j] * (S[i] === '?' ? 3 : 1);

        // Contribution 2: S[i] DOES match 'ABC'[j] or is a '?' that forms 'ABC'[j].
        // This only happens if we still need to match characters (j < 3).
        if (j < 3 && (S[i] === '?' || S[i] === "ABC"[j])) {
          // Add the number of ways from the next state (i+1) and the next character in "ABC" (j+1).
          dp[i][j] += dp[i + 1][j + 1];
        }

        // Apply the modulo operation to keep the result within the defined MOD.
        dp[i][j] %= MOD;
      }
    }
  }

  // The final answer is stored at dp[0][0].
  // This represents the number of ways to form "ABC" starting from the beginning
  // of the string (index 0) and needing to find the first character ('A', state 0) of "ABC".
  console.log(dp[0][0]); // Output the result.
});