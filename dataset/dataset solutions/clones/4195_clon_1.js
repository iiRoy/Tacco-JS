/*
 * This script processes input from standard input to solve a specific problem.
 * It uses a depth-first search (DFS) algorithm to find an optimal solution.
 *
 * Author: Code Clone Generator
 * Date: 2023-10-27
 */

// Resume stdin to prevent the process from exiting immediately.
process.stdin.resume();
// Set the encoding for standard input to UTF-8.
process.stdin.setEncoding('utf8');

/**
 * Global variable to store all incoming data chunks from stdin.
 * @type {string}
 */
var g_input = '';

// Event listener for 'data' event on stdin.
// Appends each chunk of data received to the g_input string.
process.stdin.on('data', function (chunk) {
    g_input += chunk; // Concatenate the new chunk to the global input.
});

// Event listener for 'end' event on stdin.
// This event fires when all input has been received.
process.stdin.on('end', function () {
    // Split the accumulated input by newlines (handling both Windows and Unix line endings).
    // Then, pass the resulting array of lines to the Main function.
    Main(g_input.split(/\r?\n/));
});


/**
 * The main function that orchestrates the problem-solving logic.
 * It parses input, initializes data structures, and calls the DFS function.
 *
 * @param {string[]} input - An array of strings, where each string is a line from the input.
 * @returns {number} - Returns 0 upon successful execution.
 */
function Main(input) {

  // Parse the first line to get the value of 'n'.
  var n = parseInt(input[0], 10);

  // Initialize a 2D array 'f' of size n x 10.
  var f = new Array(n);
  // Loop to populate the 'f' array.
  for (var i = 0; i < n; i++) {
    f[i] = new Array(10); // Each row is an array of 10 elements.
    // Split the current input line by space to get arguments for this row.
    var args = input[1 + i].split(' ');
    // Populate the 10 columns of the current row.
    for (var j = 0; j < 10; j++) {
      f[i][j] = parseInt(args[j], 10); // Convert string argument to integer.
    }
  }

  // Initialize another 2D array 'p' of size n x 10.
  var p = new Array(n);
  // Loop to populate the 'p' array.
  for (var i = 0; i < n; i++) {
    p[i] = new Array(10); // Each row is an array of 10 elements.
    // The input lines for 'p' start after 'n' lines of 'f' data.
    var args = input[1 + n + i].split(' ');
    // Populate the 10 columns of the current row.
    for (var j = 0; j < 10; j++) {
      p[i][j] = parseInt(args[j], 10); // Convert string argument to integer.
    }
  }

  // Initialize a boolean array 'open' of size 10, filled with false.
  // This array represents the state of 10 possible options (e.g., shops, periods).
  var open = new Array(10);
  open.fill(false); // All options are initially considered 'closed'.

  // Initialize the return value for the main function.
  var ret = 0;
  // Call the depth-first search function to calculate the optimal result.
  // The DFS starts with index 0, the initial 'open' state, and the 'f' and 'p' arrays.
  ret = dfs(0, open, f, p);

  // Print the final calculated result to the console.
  console.log(ret);

  // Return 0 indicating successful execution.
  return 0;
}


/**
 * Performs a depth-first search (DFS) to explore different combinations of 'open' states.
 * This function is recursive and calculates the maximum possible score based on the 'f' and 'p' matrices.
 *
 * @param {number} i - The current index being considered (from 0 to 9). Represents a specific option/period.
 * @param {boolean[]} open - An array indicating which options are currently 'open'.
 * @param {number[][]} f - The 'f' matrix representing some characteristic of items/shops.
 * @param {number[][]} p - The 'p' matrix representing profit/points based on conditions.
 * @returns {number} - The maximum score achievable from the current state.
 */
function dfs(i, open, f, p) {

  // Base case: If all 10 options have been considered (i.e., i reaches 10).
  if (i >= 10) {

    // Check if all options are still closed.
    var allClosed = true;
    for (var i = 0; i < open.length; i++) {
      if (open[i]) {
        allClosed = false; // Found at least one open option.
        break;             // No need to check further.
      }
    }

    // If no options were opened, return a very small number to indicate an invalid path.
    if (allClosed) {
      return Number.MIN_SAFE_INTEGER;
    }

    // Initialize an array 'both' to count overlaps.
    var both = new Array(10);
    both.fill(0); // Fill with zeros.

    // Calculate 'both' values based on 'f' matrix and 'open' state.
    for (var i = 0; i < f.length; i++) {
      for (var j = 0; j < 10; j++) {
        // If an option 'j' is open AND f[i][j] is 1, increment count for 'both[i]'.
        if (open[j] && f[i][j] == 1) {
          both[i]++;
        }
      }
    }

    // Calculate the total return based on 'p' matrix and 'both' counts.
    var ret = 0;
    for (var i = 0; i < p.length; i++) {
      ret += p[i][both[i]]; // Add profit from p for the corresponding count.
    }

    return ret; // Return the calculated score for this specific combination of 'open' states.
  }

  // Recursive step: Explore two possibilities for the current option 'i'.

  var ret1 = 0; // Score if option 'i' is NOT opened.
  var ret2 = 0; // Score if option 'i' IS opened.

  // Possibility 1: Do not open the current option 'i'.
  // Recursively call dfs for the next option (i + 1) with the current 'open' state.
  ret1 = dfs(i + 1, open, f, p);

  // Possibility 2: Open the current option 'i'.
  open[i] = true; // Set the current option 'i' to true (open).
  // Recursively call dfs for the next option (i + 1) with the modified 'open' state.
  ret2 = dfs(i + 1, open, f, p);
  open[i] = false; // Backtrack: Reset the current option 'i' to false (closed) for other branches.

  // Compare the results from both possibilities and return the maximum.
  if (ret1 > ret2) {
    return ret1; // If not opening 'i' yields a better score.
  }
  else {
    return ret2; // If opening 'i' yields a better score (or they are equal).
  }
}