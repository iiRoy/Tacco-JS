/*
 * This is a Type I clone of the original JavaScript code.
 * All identifiers, operators, and expressions remain strictly identical.
 * Only whitespace and comments have been altered.
 * The purpose is to demonstrate a visually different but functionally
 * identical code structure.
 */

// Read input from standard input.
var input = require('fs').readFileSync('/dev/stdin', 'utf8');

// Process input into an array of lines.
var arr = input.trim().split("\n");

// Main processing loop.
while (true) {

    // Read the 'n' and 'm' values from the current line.
    var nm = arr.shift().split(" ");

    // Check for termination condition: "0 0".
    if (nm.join(" ") == "0 0") break;

    // Extract n and m.
    var n = nm[0]; // Number of N values.
    var m = nm[1]; // Number of M values.

    // Array to store M values.
    var M = [];
    for (var i = 0; i < m; i++) {
        // Convert string to number (subtracting 0).
        M.push(arr.shift() - 0);
    }

    // Array to store N values.
    var N = [];
    for (var i = 0; i < n; i++) {
        // Convert string to number.
        N.push(arr.shift() - 0);
    }

    // Initialize DP table.
    var dp = [];
    for (var i = 0; i <= n; i++) {
        dp[i] = []; // Initialize inner array.
        for (var j = 0; j <= 255; j++) {
            dp[i][j] = Infinity; // Set initial value to Infinity.
        }
    }

    // Base case for DP: dp[0][128] is 0.
    dp[0][128] = 0;

    // Fill the DP table.
    for (var i = 1; i <= n; i++) { // Iterate through N values.
        for (var j = 0; j <= 255; j++) { // Iterate through possible j values (0-255).

            // Only proceed if the previous state was reachable.
            if (dp[i - 1][j] != Infinity) {
                for (var k = 0; k < m; k++) { // Iterate through M values.

                    var jm = j + M[k]; // Calculate new j value.

                    // Clamp jm between 0 and 255.
                    if (jm < 0) jm = 0;
                    if (jm > 255) jm = 255;

                    // Update DP table: take the minimum cost.
                    dp[i][jm] = Math.min(dp[i][jm], dp[i - 1][j] + Math.pow(N[i - 1] - jm, 2));
                }
            }
        }
    }

    // Find the minimum value in the last row of the DP table.
    var min = Infinity;
    dp[n].forEach(function(v) {
        min = Math.min(min, v); // Update minimum if a smaller value is found.
    });

    // Print the result to console.
    console.log(min);
}