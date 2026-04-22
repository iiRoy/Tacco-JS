/*
 * This is a Type I clone of an original JavaScript program.
 * It demonstrates extensive modifications to whitespace and comments,
 * while preserving the exact structure, identifiers, and logic
 * as per the Type I clone definition.
 */

var lines = []; // Array to store input lines.

var N, M;       // Variables for problem parameters N and M.

var a, dp;      // Arrays 'a' and 'dp' for dynamic programming.

// Import the 'readline' module to handle standard input.
var readline = require('readline');

// Create an interface for reading input line by line.
var rl = readline.createInterface({
    input: process.stdin,  // Standard input stream.
    output: process.stdout // Standard output stream (not used for writing back, but required).
});

// Event listener for each line of input received.
rl.on(
    'line',
    function (x) {
        // Push the received line into the 'lines' array.
        lines.push(x);
    }
);

// Event listener for when the input stream closes.
rl.on(
    'close',
    function () {

        // Define an array mapping digits to their matchstick counts.
        // Index 0 is not used for actual number, but for alignment.
        // number[1] = 2 matches for digit '1'
        // number[2] = 5 matches for digit '2'
        // ... and so on.
        var number = [0, 2, 5, 5, 4, 5, 6, 3, 7, 6];


        // Parse N and M from the first line of input.
        // N is the total number of matches available.
        // M is the count of available digits.
        N = Number(lines[0].split(" ")[0]);
        M = Number(lines[0].split(" ")[1]);

        // Initialize array 'a' to store available digits and their match counts.
        // It will store objects like { number: digitValue, match: matchCount }.
        a = Array(M + 1);

        // Placeholder for index 0, not used for actual digits.
        a[0] = { number: 0, match: 0 };


        // Process the second line of input to get the available digits.
        var tmp = lines[1].split(" ");

        // Populate the 'a' array with digit information.
        for (var i = 1; i <= M; i++) {
            a[i] = {
                number: Number(tmp[i - 1]),                 // The actual digit value.
                match: Number(number[tmp[i - 1]]),          // The matchstick count for this digit.
            }
        }


        // 'cont' will temporarily hold candidate string representations of numbers.
        var cont = "";

        // 'dp' is the dynamic programming array.
        // dp[w] will store the largest number string that can be formed using 'w' matches.
        dp = Array(N + 1);

        // Initialize all elements of 'dp' to an empty string.
        dp.fill("");


        // Main dynamic programming loop.
        // Iterate through all possible matchstick counts from 1 to N.
        // 'w' represents the current total weight (matchsticks) being considered.
        for (var w = 1; w <= N; w++) {

            // Iterate through each available digit.
            // 'n' represents the index of the current digit in array 'a'.
            for (var n = 1; n <= M; n++) {

                // Calculate the remaining matches if the current digit 'a[n]' is used.
                match = w - a[n].match;


                // If remaining matches are negative, this digit cannot be used.
                if (match < 0) {
                    continue; // Move to the next digit.
                }
                else {
                    // Form a candidate number string by appending the current digit
                    // to the largest number string formed with 'match' matches.
                    cont = dp[match] + a[n].number;

                    // If the current candidate 'cont' is better than what's currently in dp[w]:
                    // 1. If 'cont' is longer, it's a larger number.
                    // 2. If 'cont' has the same length but is lexicographically larger, it's a larger number.
                    if (
                        dp[w].length < cont.length ||
                        (dp[w].length === cont.length && dp[w] < cont)
                    ) {
                        // Update dp[w] with the new, larger number string.
                        dp[w] = cont;
                    }
                }
            }
        }

        // Output the final result: the largest number string that can be formed using N matches.
        console.log(dp[N]);

    }
);