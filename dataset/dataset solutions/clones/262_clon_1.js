/* This script calculates combinations of digits
 * based on specific rules and then processes queries
 * against the precomputed results.
 *
 * It uses dynamic programming (DP) and backtracking.
 */

// Declare and initialize a 2D array for dynamic programming.
// The maximum size for dp[i] is 10 and for dp[i][j] is 330.
var dp = [];


// Outer loop to initialize the rows of the dp table.
for (var i = 0; i <= 10; i++) {

    dp[i] = []; // Initialize the inner array for the current row.

    /*
     * Inner loop to set initial values for each cell in the current row.
     * All cells are initialized to zero.
     */
    for (var j = 0; j <= 330; j++) {
        dp[i][j] = 0;
    }
}


// Array to keep track of used digits during the recursive process.
var used = [];

// Initialize the 'used' array: all digits 0-9 are initially not used.
for (var i = 0; i <= 9; i++) {
    used[i] = false;
}


/*
 * Recursive function 'bomb' to populate the dp table.
 * It explores combinations of digits.
 * 'sum' is the accumulated value so far.
 * 'cnt' is the current count/depth of digits considered.
 */
function bomb(sum, cnt) {

    // Increment the count for the current (cnt, sum) state.
    // This effectively stores the number of ways to reach this state.
    dp[cnt][sum]++;

    // Move to the next digit position.
    cnt++;

    // Base case: if 11 digits have been placed, stop recursion for this path.
    if (cnt == 11) {
        return;
    }


    // Loop through all possible digits from 0 to 9.
    for (var i = 0; i <= 9; i++) {

        // If the current digit 'i' has already been used in this path, skip it.
        if (used[i]) {
            continue;
        }

        // Mark the digit 'i' as used for the current path.
        used[i] = true;

        // Recursive call: update sum by adding i * cnt.
        // 'cnt' here represents the position (1st, 2nd, etc.) of the digit.
        bomb(sum + i * cnt, cnt);

        // Backtrack: unmark the digit 'i' as used.
        // This allows other recursive paths to use this digit.
        used[i] = false;
    }

}


// Start the recursive calculation.
// Initial call with sum = 0 and count = 0.
bomb(0, 0);


// --- Input Processing Section ---

// Read the entire input from standard input, assuming UTF-8 encoding.
var input = require('fs').readFileSync('/dev/stdin', 'utf8');

// Trim any leading/trailing whitespace from the input and split it into an array of lines.
var arr = input.trim().split("\n");

// Iterate over each line (value 'v') in the input array.
arr.forEach(function (v) {

    // Split the current line by space and convert each part to a number.
    var ns = v.split(" ").map(Number);

    // Extract the two numbers from the parsed line.
    var n = ns[0];
    var s = ns[1];

    // Retrieve the answer from the precomputed dp table.
    // If dp[n][s] is undefined (meaning no combinations led to this state), default to 0.
    var ans = (dp[n][s] == undefined) ? 0 : dp[n][s];

    // Print the calculated answer to the console.
    console.log(ans);

});