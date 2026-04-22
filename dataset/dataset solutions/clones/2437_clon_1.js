/*
 * This JavaScript code implements a dynamic programming approach
 * to solve a knapsack-like problem or a variation thereof.
 * The initial comment in the original code suggested a concern
 * about "Time Limit Exceeded" (TLE), implying an optimization challenge.
 *
 * This is a Type I clone, meaning only whitespace and comments
 * have been altered. The logic, variable names, and structure
 * remain perfectly identical to the original source.
 */


function Main(input) {

    // Process the raw input string: trim whitespace, split into lines,
    // and then split each line by spaces to form a 2D array of strings.
    input = input
        .trim()
        .split("\n")
        .map(function(x) {
            return x.split(" ");
        });

    // Parse the number of items (N) and the maximum capacity/time (T)
    // from the first line of the input.
    var N = parseInt(input[0][0], 10);
    var T = parseInt(input[0][1], 10);

    // Initialize an array to store pairs of (A, B) values for each item.
    // A typically represents weight/time, B represents value/profit.
    var arr_AB = [];

    // Populate arr_AB by parsing integer values from the subsequent input lines.
    // Note: input[0] was used for N and T, so item data starts from input[1].
    for (var i = 0; i < N; i++) {
        arr_AB.push(
            input[i + 1].map(e => parseInt(e, 10))
        );
    }

    // Sort the items based on their 'A' value (e.g., time/weight).
    // This sorting step is crucial for many DP problems, especially
    // those involving intervals or cumulative values.
    arr_AB.sort((a, b) => a[0] - b[0]);

    // Initialize the dynamic programming table.
    // 'dp' will store states, typically representing maximum values
    // achievable under certain conditions (e.g., up to item 'i' with time 'j').
    var dp = [];
    var Ai, Bi; // Temporary variables to hold A and B values of the current item.

    // Initialize the first row of the DP table.
    // This often represents the state before considering any items.
    // For a knapsack problem, dp[i][j][0] might be max value considering items up to 'i'
    // with exactly 'j' time, and dp[i][j][1] might be max value considering items up to 'i'
    // with at most 'j' time. The `Array.from` creates an array of 'T' elements,
    // each initialized to `[0, 0]`.
    dp.push(Array.from({
        length: T
    }, () => [0, 0]));


    // Main DP loop: iterate through each item.
    for (var i = 0; i < N; i++) {
        // Add a new row for the current item 'i' to the DP table.
        dp.push([]);
        // Extract the 'A' and 'B' values for the current item.
        Ai = arr_AB[i][0];
        Bi = arr_AB[i][1];

        // Inner DP loop: iterate through each possible time/capacity 'j'.
        for (var j = 0; j < T; j++) {
            // Initialize the current cell of the DP table.
            dp[i + 1].push([0, 0]);

            // This commented line was likely for debugging purposes in the original code.
            // console.log(i, j, dp);

            // Decision for dp[i + 1][j][0]:
            // If the current item's 'A' value (time/weight) is less than or equal to 'j',
            // we have two choices:
            // 1. Don't include the current item: value is dp[i][j][0].
            // 2. Include the current item: value is dp[i][j - Ai][0] (value from previous state
            //    with reduced capacity) + Bi (current item's value).
            // We take the maximum of these two options.
            if (Ai <= j) {
                dp[i + 1][j][0] = Math.max(dp[i][j][0], dp[i][j - Ai][0] + Bi);
            } else {
                // If the current item's 'A' value is too large for current capacity 'j',
                // we cannot include it. So, the value is simply from the previous state.
                dp[i + 1][j][0] = dp[i][j][0];
            }

            // Decision for dp[i + 1][j][1]:
            // This state often represents the maximum value achievable considering
            // items up to 'i' with *at most* 'j' time/capacity.
            // It's the maximum of:
            // 1. Value without considering the current item's contribution to this specific state: dp[i][j][1].
            // 2. Value *including* the current item's contribution to state [0] for time 'j':
            //    dp[i][j][0] + Bi. This implies the item was added at time 'j' to a previous state 'dp[i][j][0]'.
            //    This might represent a case where the item is added *after* all other items up to 'i' have been considered,
            //    and it's added at exactly time 'j'.
            dp[i + 1][j][1] = Math.max(dp[i][j][1], dp[i][j][0] + Bi);
        }

    }

    // Output the final result.
    // dp[N][T - 1][1] typically represents the maximum value achievable
    // considering all 'N' items with a total capacity/time of 'T - 1'.
    // The '-1' in 'T - 1' is common when 0-indexed time/capacity is used,
    // and 'T' represents the total number of slots from 0 to T-1.
    console.log(dp[N][T - 1][1]);
}


// This line reads input from standard input (e.g., a file or piped data)
// and passes it to the Main function.
Main(require("fs").readFileSync("/dev/stdin", "utf8"));