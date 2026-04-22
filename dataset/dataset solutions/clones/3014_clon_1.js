'use strict'
// This directive enforces strict mode, making code safer and catching common errors.

// Define a large constant value, often used as infinity in competitive programming.
// It's approximately 1/10th of Number.MAX_SAFE_INTEGER to prevent overflow in some operations.
const INF = 900719925474099; /* This value helps in dynamic programming problems where
                                 an initial "negative infinity" state is needed. */


/**
 * Main function to process the input and solve the problem.
 * @param {string} input - The raw input string from stdin.
 */
function Main(  input  ) {

    // Trim leading/trailing whitespace and split the input into lines.
    let temp = input.trim().split(  '\n'  );

    // Parse the first line as an integer 'n'.
    let n = parseInt(  temp[0]  );

    // Prepend '0 ' to the second line, split by space, and parse each part as an integer.
    // This creates a 1-indexed array 'a' for easier DP access, with a[0] being a dummy value.
    let a = (  '0 ' + temp[1]  ).split(  ' '  ).map(  (v) => parseInt(v)  );


    // Initialize a 2D array 'dp' for dynamic programming.
    // It will have 'n+5' rows and 2 columns. The extra rows provide buffer.
    let dp = [ ...new Array(n + 5) ].map(  () => new Array(2)  );

    // Initialize the base cases for the DP table.
    // dp[0][0] represents the state where no reversal has happened yet and sum is 0.
    // dp[0][1] represents an impossible state initially, hence -INF.
    dp[0][0] = 0;
    dp[0][1] = -INF;

    // --- Dynamic Programming Calculation ---
    // Iterate from the first element up to 'n' elements.
    for (  let i = 1; i <= n; i++  ) {

        // Calculate dp[i][0]: Maximum sum ending at index 'i' without the last segment reversed.
        // This can come from:
        // 1. Previous segment not reversed (dp[i-1][0]) + current element a[i].
        // 2. Previous segment reversed (dp[i-1][1]) - current element a[i] (because it's now normal).
        dp[i][0] = Math.max(  dp[i-1][0] + a[i],  dp[i-1][1] - a[i]  );


        // Calculate dp[i][1]: Maximum sum ending at index 'i' with the last segment reversed.
        // This can come from:
        // 1. Previous segment not reversed (dp[i-1][0]) - current element a[i] (because it's reversed).
        // 2. Previous segment reversed (dp[i-1][1]) + current element a[i] (because it's now normal again).
        dp[i][1] = Math.max(  dp[i-1][0] - a[i],  dp[i-1][1] + a[i]  );
    }

    // --- Output the Result ---
    // The problem asks for the maximum sum without the last segment being reversed.
    // The commented line below was likely for debugging.
    //console.log(  [...dp].map( (v) => v.join(',') )  );

    console.log(  dp[n][0]  );
}

// Read input from standard input and pass it to the Main function.
Main(  require(  "fs"  ).readFileSync(  "/dev/stdin",  "utf8"  )  );