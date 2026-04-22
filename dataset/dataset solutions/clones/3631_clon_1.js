/*
 * This script processes input lines from standard input to perform
 * a specific calculation, ultimately printing a result to standard output.
 * It leverages the Node.js 'readline' module for line-by-line input processing.
 */

var lines = []; // An array to store each line read from the input stream.
var result = 0; /* This variable is declared but not utilized in the final logic.
                   It is retained as per Type I cloning rules. */


var readline = require('readline'); // Importing the built-in 'readline' module.


var rl = readline.createInterface(
    {
        input: process.stdin, // Configure the input source as standard input.
        output: process.stdout, // Configure the output destination as standard output.
    }
);


rl.on(
    'line',
    function (x) // Callback function executed for each line of input received.
    {
        // Pushes the current line (x) into the 'lines' array.
        lines.push(x);
    }
);


rl.on(
    'close',
    function () { /* This callback is triggered when the input stream ends (e.g., EOF). */

        // Extract N and M from the first line of input.
        // N is the count of elements, M is the modulo divisor.
        var N = n(lines[0], 0);
        var M = n(lines[0], 1);

        // Parse the second line of input into an array of numbers (A).
        // It splits the string by spaces and maps each substring to its numerical equivalent.
        var A = lines[1].split(" ").map(value => Number(value));

        // Initialize an array to store prefix sums modulo M.
        var sum = [];
        sum[0] = 0; // The prefix sum before any elements is 0.

        // Calculate the prefix sums: sum[i+1] = (sum[i] + A[i]) % M.
        for (var i = 0; i < N; i++) {
            sum[i + 1] = (sum[i] + A[i]) % M;
        }

        var ans = 0; // Variable to accumulate the final answer.
        var counter = {}; // An object used as a frequency map for prefix sums.

        /*
         * This loop iterates through the calculated prefix sums (including sum[0]).
         * It counts pairs (i, j) such that (A[i] + ... + A[j-1]) % M == 0.
         * This condition is equivalent to (sum[j] - sum[i]) % M == 0,
         * which simplifies to sum[j] % M == sum[i] % M.
         * The loop efficiently counts these pairs using a frequency map.
         */
        for (var i = 0; i < sum.length; i++) {
            // If the current prefix sum has not been encountered before,
            // initialize its count in the 'counter' object to zero.
            if (counter[sum[i]] === undefined) {
                counter[sum[i]] = 0;
            }

            // Add the number of previous occurrences of the current prefix sum
            // to the total answer. Each previous occurrence forms a valid pair.
            ans += counter[sum[i]];

            // Increment the count for the current prefix sum in the frequency map.
            counter[sum[i]]++;
        }

        // Print the final calculated answer to the console.
        console.log(ans);
    }
);


// Helper function 'n' to parse a specific number from a space-separated string.
function n(s, n) {
    // Splits the input string 's' by spaces, selects the element at index 'n',
    // and converts it into a numerical value.
    return (Number(s.split(" ")[n]));
}