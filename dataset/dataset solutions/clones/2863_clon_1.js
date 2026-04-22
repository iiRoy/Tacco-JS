var lines = []; // This array will store all input lines read from stdin.

var MOD = 1000000007; // A constant for modulo operations, typically used in problems involving large numbers to prevent overflow.

var N, M; // N and M are variables that will store the two numbers from the first line of input.
var a; // 'a' will be an array storing the subsequent input numbers.
var memo; // 'memo' will be used for memoization in the dynamic programming approach.

// Import the 'readline' module to handle input from the console.
var readline = require('readline');

// Create an interface for reading input line by line.
var rl = readline.createInterface(
    {
        input:  process.stdin,  // Standard input stream.
        output: process.stdout  // Standard output stream (though not directly used for printing here, it's part of the interface).
    }
);

// Event listener for each line of input received.
rl.on(
    'line',
    function (x) {
        // Add the current line 'x' to the 'lines' array.
        lines.push(x);
    }
);


// Event listener for when the input stream is closed (end of input).
rl.on(
    'close',
    function () {

        // Parse the first line of input to get N and M.
        // lines[0] contains "N M", so we split it by space.
        N = Number(lines[0].split(" ")[0]); // Convert the first part to a number and assign to N.
        M = Number(lines[0].split(" ")[1]); // Convert the second part to a number and assign to M.

        lines.shift(); // Remove the first line (N and M) from the 'lines' array, as it has been processed.

        // Process the remaining lines to populate array 'a'.
        // Each line is converted to a number.
        a = lines.map(
            i => Number(i)
        );

        // Initialize the memoization array.
        // It's filled with zeros, indicating that no results have been computed yet for any 'n'.
        memo = Array(N).fill(0);

        // Call the main dynamic programming function (dfs) starting from n=0
        // and print its result to the console.
        console.log(dfs(0));

    }
);

/**
 * Depth-First Search (DFS) function with memoization to solve the problem.
 * This function calculates the number of ways to reach N.
 *
 * @param {number} n The current position or step in the sequence.
 * @returns {number} The number of ways to reach N from position 'n'.
 */
function dfs(n) {

    // If the result for 'n' has already been computed and stored in memo, return it directly.
    if (memo[n]) {
        return (memo[n]);
    }

    // Base case: If the current position 'n' exceeds N, it's an invalid path.
    // Return 0 ways.
    if (N < n) {
        return (0);
    }

    // Base case: If the current position 'n' is exactly N, we have found one valid path.
    // Return 1 way.
    if (n === N) {
        return (1);
    }

    // If 'n' is less than N and not yet memoized, proceed with calculations.
    else {

        // Loop through the 'a' array (of length M).
        // The original code's logic here seems to have a peculiar structure:
        // 'res' is reset in each iteration, and the return condition `if (n === a[i])`
        // suggests a check against 'a' elements.
        // The final `memo[n] = res` will store only the result of the *last* iteration.
        // This structure is preserved exactly as per Type I cloning rules.
        for (
            var i = 0;
            i < M;
            i++
        ) {

            var res = 0; // Initialize result for the current path segment.

            // If the current position 'n' is one of the "forbidden" positions listed in 'a'.
            // This path is invalid, so return 0 ways.
            if (n === a[i]) {
                return (0);
            }

            // If 'n' is not a forbidden position, continue exploring paths.
            else {
                // Explore taking 1 step forward (n + 1).
                res += dfs(n + 1);
                res %= MOD; // Apply modulo to prevent integer overflow.

                // Explore taking 2 steps forward (n + 2).
                res += dfs(n + 2);
                res %= MOD; // Apply modulo again.
            }
        }
    }

    // Store the computed result for 'n' in the memoization array before returning.
    memo[n] = res;

    // Return the calculated number of ways for position 'n'.
    return (memo[n]);
}