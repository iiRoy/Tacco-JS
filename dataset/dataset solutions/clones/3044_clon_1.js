'use strict'; // This directive enforces strict mode for the entire script.

/*
 * Main function to process the input and compute the result.
 * It takes a string as input, parses it, and performs dynamic programming
 * calculations to arrive at a final answer, which is then printed to the console.
 *
 * @param {string} input - The raw input string, typically read from standard input.
 */
function         Main(  input  )
{

    // Define a very large number M.
    // This value (2^50) is used later in floating-point calculations
    // for scaling or normalization purposes within a specific algorithm.
    var M = Math.pow(2, 50);

    // Define a constant K, which is a large prime number.
    // It is used as a modulo operator throughout the calculations
    // to keep intermediate and final results within a manageable range
    // and to prevent integer overflows, common in combinatorial problems.
    const K = 998244353; // The modulo constant.

    // Process the raw input string:
    // 1. `trim()`: Removes any leading or trailing whitespace.
    // 2. `split(/\s+/)`: Splits the string into an array of substrings,
    //    using one or more whitespace characters as a delimiter.
    // 3. `map(x=>x-0)`: Converts each string element in the array to a number.
    //    Subtracting 0 is a common and concise way to coerce a string to a number.
    input = input.trim().split(/\s+/).map(x => x - 0);


    // Extract the first number from the processed input array.
    // `shift()` removes the first element from an array and returns it.
    // This value, N, typically represents the count of subsequent items
    // or the size of a primary dimension in the problem.
    var N = input.shift();


    // Calculate the sum of all remaining numbers in the `input` array.
    // `reduce()` applies a function against an accumulator and each element
    // in the array (from left to right) to reduce it to a single value.
    var sum = input.reduce((a, c) => a + c);


    // Calculate `half`, which is the floor of the total sum divided by 2.
    // This is often a crucial value in dynamic programming problems,
    // particularly those involving partitioning a set into two subsets
    // with sums close to half the total sum.
    var half = Math.floor(sum / 2);


    // Initialize an array named `factor`.
    // It starts with the value 3. This array will store a sequence
    // of numbers derived by multiplying by 2 and taking modulo K.
    var factor = [3];

    // Populate the `factor` array.
    // This loop runs `N-1` times. In each iteration, it calculates the
    // next element by taking the previous element, multiplying it by 2,
    // and then applying the modulo `K`. This effectively generates
    // `3 * 2^i % K` for `i` from 0 to `N-1`.
    for ( let i = 0; i < N - 1; i++ )
    {
        factor.push(factor[i] * 2 % K); // Adds (factor[i] * 2) % K to the array.
    }


    // Declare a 3-dimensional array `dp` for dynamic programming.
    // This array will store intermediate results to avoid redundant computations.
    var dp = [];

    // Detailed comment explaining the DP state definition:
    // `dp[i][j][k]` represents the number of ways to choose `j` elements
    // from the first `i` elements of the `input` array such that their
    // sum is exactly `k`. This is a classic state for subset sum type problems.
    // The dimensions are:
    // - `i`: index of items considered (from 0 to N).
    // - `j`: number of items chosen (from 0 to i).
    // - `k`: target sum (from 0 to half).
    for ( let i = 0; i <= N; i++ ) { // Iterate from 0 up to N for the number of items considered.
        dp[i] = []; // Initialize the second dimension for the current 'i'.
        for ( let j = 0; j <= i; j++ ) { // Iterate from 0 up to 'i' for the number of items chosen.
            dp[i][j] = []; // Initialize the third dimension for the current 'i' and 'j'.
            for ( let k = 0; k <= half; k++ ) { // Iterate from 0 up to 'half' for the target sum.
                dp[i][j][k] = 0; // Initialize each DP state with 0.
            }
        }
    }

    // Base case for the DP table:
    // There is exactly one way to choose 0 items from 0 items to achieve a sum of 0.
    dp[0][0][0] = 1;


    // Fill the DP table using nested loops.
    // This is the core dynamic programming part, building up solutions
    // for larger subproblems from solutions of smaller subproblems.
    for ( let i = 0; i < N; i++ ) { // Outer loop: Iterates through each item in the original `input` array (0 to N-1).
        for ( let j = 0; j <= i; j++ ) { // Middle loop: Iterates through the count of items chosen so far (0 to `i`).
            for ( let k = 0; k <= half; k++ ) { // Inner loop: Iterates through possible sums (0 to `half`).

                // Transition 1: Do NOT include the current item `input[i]`.
                // The number of ways to get sum `k` using `j` items from `i+1` items
                // is at least the number of ways to get sum `k` using `j` items from `i` items.
                dp[i + 1][j][k] += dp[i][j][k];
                dp[i + 1][j][k] %= K; // Apply modulo K to keep the result within bounds.
            }

            // Transition 2: DO include the current item `input[i]`.
            // This loop considers sums `k` that are large enough to accommodate `input[i]`.
            for ( let k = input[i]; k <= half; k++ ) {
                // If we include `input[i]`, we need to have chosen `j` items before (now `j+1` total)
                // and the sum must have been `k - input[i]` from the previous `i` items.
                dp[i + 1][j + 1][k] += dp[i][j][k - input[i]];
                dp[i + 1][j + 1][k] %= K; // Apply modulo K.
            }
        }
    }


    // Initialize the final answer variable.
    // It starts with 1 and will be accumulated based on further calculations.
    var ans = 1;

    // Calculate (3^N) % K and store it in `ans`.
    // This loop multiplies `ans` by 3, `N` times, applying modulo `K` in each step.
    for ( let i = 0; i < N; i++ )
    {
        ans *= 3;
        ans %= K;
    }


    // Perform further modifications to `ans` based on the DP results and `factor` array.
    // This section likely involves complex combinatorial logic specific to the problem.
    for ( let i = 0; i < N; i++ ) {
        let p = factor[i]; // Get a precomputed value from the `factor` array.

        // Calculate `q`. This involves summing up specific DP states.
        // `dp[N][i]` represents considering all `N` items, and choosing `i` items.
        // The `reduce` function iterates through possible sums `j` for these `i` items.
        let q = dp[N][i].reduce(function (b, c, j) {
            // Only consider sums `j` that are less than or equal to `half`.
            if (j <= half)
            {
                b += c; // Accumulate the count `c` into `b`.
            }
            b %= K; // Apply modulo K to `b` after each potential addition. This is always executed.
            return b; // Return the updated accumulator.
        }, 0) % K; // The initial value for `b` is 0. A final modulo K is applied to the result of `reduce`.

        // Perform calculations involving `p`, `q`, and `M`.
        // These might be related to specific counting techniques or problem constraints.
        let n = Math.round(p * q / M) + 1; // Calculate 'n', potentially for division.
        let r = (p - p % n) / n; // Calculate 'r', which is effectively floor(p / n).

        // Subtract a complex term from `ans`, ensuring modulo K.
        // The term is `((r * q % K) * n + (p % n) * q) % K`.
        ans -= ((r * q % K) * n + (p % n) * q) % K;
    }

    // Normalize `ans` to be within the [0, K-1] range.
    // The first `% K` handles positive values.
    // Adding `K` ensures `ans` is positive if it became negative due to subtraction.
    // The final `% K` brings it back into the desired range.
    ans %= K;
    ans += K;
    ans %= K;


    // Apply special adjustments to `ans` if the total sum is an even number.
    if ( sum % 2 === 0 )
    {
        // Iterate through all possible counts of items `j` (from 0 to N).
        for ( let j = 0; j <= N; j++ ) {
            // Add `3` times the number of ways to achieve a sum of `half`
            // using `j` items from all `N` items.
            ans += 3 * dp[N][j][half];
            ans %= K; // Apply modulo K to this addition.
        }
    }


    // Output the final computed answer to the console.
    console.log(ans);
}


// Read the entire content of standard input synchronously.
// The `require('fs')` module is used to access the file system.
// `readFileSync('/dev/stdin', 'utf8')` reads from stdin as a UTF-8 string.
// The read content is then passed as an argument to the `Main` function.
Main(require('fs').readFileSync('/dev/stdin', 'utf8'));