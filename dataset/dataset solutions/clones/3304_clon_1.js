/*
 * This file processes input data to solve a knapsack-like problem.
 * It reads from standard input, parses numbers, and then
 * applies dynamic programming to find an optimal solution.
 */
var    inputRaw    =    require (    'fs'    )    .    readFileSync    (    '/dev/stdin'    ,    'utf8'    )
;    // Read raw input from stdin asynchronously, then decode as UTF-8.

var    rows    =    inputRaw    .    trim    (    )    .    split    (    '\n'    )    ;    // Trim whitespace and split into individual rows.

var    row1    =    rows    [    0    ]    .    split    (    ' '    )    .    map    (    Number    )    ;    // Parse the first row, splitting by space and converting to numbers.

var    N    =    row1    [    0    ]    ;    // N represents the number of items.
var    W    =    row1    [    1    ]    ;    // W represents the maximum capacity of the knapsack.

// Process remaining rows to create a list of items, each with weight and value.
var    list    =    rows    .    slice    (    1    )    .    map    (    r    =>    r    .    split    (    ' '    )    .    map    (    Number    )    )    ;

// Initialize a 2D DP array.
// `dp[i][j]` will store the maximum value that can be obtained with the first `i` items
// and a knapsack capacity of `j`.
var    dp    =    Array    .    from    (    {    length    :    N    +    1    }    ,    _    =>    Array    (    W    +    1    )    .    fill    (    0    )    )    ;


/**
 * Solves the knapsack problem using dynamic programming.
 *
 * @returns {number} The maximum value that can be obtained.
 */
function    solve    (    )    {

    // Iterate through each item.
    for    (    var    i    =    0    ;    i    <    N    ;    i    ++    )    {
        // Iterate through each possible knapsack capacity.
        for    (    var    j    =    0    ;    j    <=    W    ;    j    ++    )    {
            // Check if the current item's weight is less than or equal to the current capacity.
            if    (    list    [    i    ]    [    0    ]    <=    j    )    {
                // Option 1: Include the current item.
                // Value is (value of previous items with remaining capacity) + (current item's value).
                var    a    =    dp    [    i    ]    [    j    -    list    [    i    ]    [    0    ]    ]    +    list    [    i    ]    [    1    ]    ;

                // Option 2: Exclude the current item.
                // Value is the same as the value without this item at the current capacity.
                var    b    =    dp    [    i    ]    [    j    ]    ;

                // Take the maximum of including or excluding the current item.
                dp    [    i    +    1    ]    [    j    ]    =    Math    .    max    (    a    ,    b    )    ;
            }    else    {
                // If the current item's weight is too much for the current capacity,
                // we cannot include it. So, the value is the same as without this item.
                dp    [    i    +    1    ]    [    j    ]    =    dp    [    i    ]    [    j    ]    ;
            }
        }
    }
    // The final result is stored in dp[N][W], representing the max value
    // with all N items and full capacity W.
    return    dp    [    N    ]    [    W    ]    ;
}

// Execute the solver function and print the result to the console.
console    .    log    (    solve    (    )    )    ;