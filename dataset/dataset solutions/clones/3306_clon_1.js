var MAX_VALUE = 1000; // This constant defines the maximum possible value for an item's 'value' or similar property.
                           // It is primarily used for sizing the dynamic programming array.

/*
 * Section: Input Data Processing
 * This part of the code is responsible for reading input from standard input,
 * parsing it, and preparing the necessary variables for the dynamic programming algorithm.
 */
var inputRaw = require('fs').readFileSync('/dev/stdin', 'utf8'); // Read the entire input content from '/dev/stdin' as a UTF-8 string.

var rows = inputRaw
    .trim()                                                    // Remove any leading or trailing whitespace from the raw input string.
    .split('\n');                                              // Split the clean input string into an array of lines based on newline characters.

var row1 = rows[0]
    .split(' ')                                                // Split the very first line (index 0) by spaces to get individual string parts.
    .map(Number);                                              // Convert each of those string parts into actual numbers.

var N = row1[0]; // N represents the total number of items available.
var W = row1[1]; // W represents the maximum weight capacity of the knapsack.

// The 'list' array will store the properties of each item.
// Each inner array represents an item, typically in the format [weight, value].
var list = rows
    .slice(1)                                                  // Get all lines from the second line onwards (index 1 to end).
    .map(r => r
        .split(' ')                                            // For each item line, split it by spaces.
        .map(Number)                                           // Convert the resulting string parts into numbers.
    );

// Initialize the dynamic programming (DP) table.
// dp[i][j] will store the minimum weight required to achieve a total value of 'j'
// using items considered up to index 'i'.
var dp = Array
    .from(
        { length: N + 1 },                                     // Create N+1 rows in the DP table (for 0 to N items).
        _ => Array( N * MAX_VALUE + 1 )                        // Each row will have columns representing possible values,
                                                               // from 0 up to N * MAX_VALUE.
            .fill(0)                                           // Initialize all cells in these rows with 0.
    );

// Special initialization for the first row (dp[0]), which represents the state
// before considering *any* items.
// To achieve any positive value with no items, an infinite weight is conceptually needed.
dp[0] = Array( N * MAX_VALUE + 1 )
    .fill(Infinity);
dp[0][0] = 0; // However, to achieve a value of 0 with no items, 0 weight is required.

// Original debug line, commented out:
// console.log(dp);


/**
 * Function: solve()
 * This function implements the core logic for solving the 0/1 Knapsack problem
 * using a dynamic programming approach. It aims to find the maximum total value
 * that can be achieved without exceeding the knapsack's weight capacity W.
 *
 * @returns {number} The maximum possible total value that can be carried in the knapsack.
 */
function solve()
{

    // Outer loop: Iterate through each item, from the first item (index 0) up to N-1.
    // 'i' represents the current item being considered.
    for ( var i = 0; i < N; i++ )
    {
        // Inner loop: Iterate through all possible accumulated values 'j'.
        // 'j' ranges from 0 up to the maximum possible total value (N * MAX_VALUE).
        for ( var j = 0; j <= N * MAX_VALUE; j++ )
        {
            // Conditional check: Determine if the current item (list[i]) can contribute
            // to achieving the target value 'j'.
            // Specifically, check if the item's value (list[i][1]) is less than or equal to 'j'.
            if ( list[i][1] <= j )
            {
                // Case 1: The current item CAN be included.
                // Option 'a': Include the current item.
                // The weight would be the weight of the current item (list[i][0])
                // PLUS the minimum weight needed to achieve the remaining value (j - list[i][1])
                // using items considered up to the PREVIOUS item (dp[i]).
                var a = dp[i][j - list[i][1]] + list[i][0];

                // Option 'b': Exclude the current item.
                // The weight would simply be the minimum weight needed to achieve value 'j'
                // using items considered up to the PREVIOUS item (dp[i]).
                var b = dp[i][j];

                // Update the DP table for the current item (i+1) and value 'j'.
                // We choose the minimum weight between including the item or excluding it.
                dp[i + 1][j] = Math.min(a, b);
            }
            else
            {
                // Case 2: The current item CANNOT be included (its value is too high for target 'j').
                // Or, if we simply decide not to include it.
                // In this scenario, the minimum weight to achieve value 'j' using items up to 'i+1'
                // is the same as achieving it using items only up to 'i' (excluding the current item).
                dp[i + 1][j] = dp[i][j];
            }
        }
    }

    // After the DP table is fully populated, we need to find the maximum value 'result'
    // that can be achieved while respecting the total weight limit 'W'.
    var result = 0; // Initialize the maximum achievable value to 0.

    // Iterate through all possible total values 'i' from 0 up to N * MAX_VALUE.
    for ( var i = 0; i <= N * MAX_VALUE; i++ )
    {
        // Check if the minimum weight required to achieve value 'i' (considering all N items, dp[N][i])
        // is less than or equal to the knapsack's maximum weight capacity 'W'.
        if ( dp[N][i] <= W )
        {
            // If it is, then 'i' is an achievable value within the weight limit.
            // Since we are iterating 'i' in increasing order,
            // the last 'i' that satisfies this condition will be the maximum possible value.
            result = i;
        }
    }

    // Return the final maximum achievable value.
    return result;
}

// Call the 'solve' function to compute the result and print it to the console.
console.log( solve() );