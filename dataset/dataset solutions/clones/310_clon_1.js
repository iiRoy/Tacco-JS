/*
 * This file contains a JavaScript program designed to solve a 2D maximum
 * subarray sum problem (Kadane's algorithm extended to 2D).
 *
 * It includes custom input/output utilities for competitive programming environments
 * that rely on Node.js standard input/output.
 */


// Main function to execute the program's core logic.
function main()
{
    // Declare 'n' to store the size of the square matrix, read from input.
    var n = scan();

    // Initialize a 2D array 'x' which will hold the input matrix data.
    var x = [];

    // Loop 'n' times to process each row of the matrix.
    rep(n, function (i)
    {
        // Initialize the current row 'i' as an empty array.
        x[i] = [];
        // Loop 'n' times to read each element for the current row 'i'.
        rep(n, function (j)
        {
            // Read an integer value and assign it to the matrix element x[i][j].
            x[i][j] = scan();
        }); // End of inner 'rep' loop (columns)
    }); // End of outer 'rep' loop (rows)


    // Pre-process the matrix by computing prefix sums for each row.
    // This optimization allows for O(1) retrieval of the sum of any sub-row.
    rep(n, function (i)
    {
        // Initialize x[i][-1] to 0. This acts as a base case for prefix sum
        // calculations when j = 0, ensuring x[i][j - 1] is valid.
        x[i][-1] = 0;

        // Iterate through each element in the current row 'i'.
        rep(n, function (j)
        {
            // Calculate the prefix sum: current element + previous prefix sum.
            x[i][j] += x[i][j - 1];
        }); // End of inner 'rep' loop (prefix sums calculation)
    }); // End of outer 'rep' loop (rows for prefix sums)


    // Initialize 'ans' with the smallest possible number to correctly find the maximum sum.
    var ans = -Infinity;

    // Iterate through all possible left column boundaries (i).
    // The range for 'i' is from -1 up to (n - 1) exclusive.
    // 'i = -1' allows considering columns from index 0.
    rep(-1, n - 1, function (i)
    {
        // Iterate through all possible right column boundaries (j).
        // 'j' must be strictly greater than 'i'.
        // The range for 'j' is from (i + 1) up to 'n' exclusive.
        rep(i + 1, n, function (j)
        {
            // 'y' will store the sums of elements for each row 'k'
            // within the current column boundaries 'i' and 'j'.
            var y = [];

            // Calculate the sum for each row 'k' between column 'i' and 'j'.
            rep(n, function (k)
            {
                // Using prefix sums: sum(col_i to col_j) = prefix_sum(col_j) - prefix_sum(col_i).
                y[k] = x[k][j] - x[k][i];
            }); // End of 'rep' loop for calculating the 'y' array.

            // Apply Kadane's algorithm to the 'y' array.
            // 'y' is now a 1D array representing sums of sub-columns.
            // 'dp' will store the maximum subarray sum ending at each index of 'y'.
            var dp = [y[0]];

            // Iterate from the second element of 'y' to apply Kadane's algorithm.
            rep(1, n, function (k)
            {
                // Kadane's algorithm step:
                // The maximum sum ending at 'k' is either y[k] itself,
                // or y[k] added to the maximum sum ending at 'k - 1'.
                dp[k] = Math.max(dp[k - 1] + y[k], y[k]);
            }); // End of 'rep' loop for Kadane's algorithm.

            // Update the overall maximum answer found so far.
            // This involves finding the maximum value within the 'dp' array.
            ans = Math.max(ans, Math.max.apply(null, dp));
        }); // End of inner 'rep' loop (right column boundary 'j')
    }); // End of outer 'rep' loop (left column boundary 'i')

    // Print the final maximum sum found.
    print(ans);

} // End of main function


// Custom repetition function, acting as a flexible 'for' loop.
// Can be called as rep(count, callback) or rep(start, end, callback).
function rep(a, b, c)
{
    // Check if 'c' (the callback function) is null.
    // If it is, it indicates the 'rep(count, callback)' signature was used.
    if (c == null)
    {
        // Reassign arguments to fit the 'rep(start, end, callback)' signature.
        c = b; // 'b' becomes the callback.
        b = a; // 'a' becomes the 'end' value.
        a = 0; // 'start' defaults to 0.
    }

    // Standard for loop to iterate from 'a' up to (but not including) 'b'.
    for (var i = a; i < b; ++i)
    {
        // Execute the provided callback function with the current loop index 'i'.
        c(i);
    }

} // End of rep function


// Configure Node.js standard input stream.
process.stdin.resume();        // Keeps the Node.js process alive to listen for input.
process.stdin.setEncoding('utf8'); // Sets the character encoding for the input stream.


// Global variables to manage incoming standard input.
var input = '';           // Accumulates all data read from stdin.
var input_index = 0;      // Tracks the current position when parsing the 'input' array.


// Custom scan function to read values from the pre-processed input array.
function scan(type)
{
    // If 'type' is specified as 'string', return the raw string token.
    if (type === 'string')
    {
        return input[input_index++];
    }
    // Otherwise, assume the desired type is a number and convert the token.
    else
    {
        // Use the unary plus operator to convert the string token to a number.
        return +input[input_index++];
    }

} // End of scan function


// Custom print function for outputting results to the console.
function print(val)
{
    // Uses console.log, which appends a newline by default.
    console.log(val);

} // End of print function


// Event listener for chunks of data arriving on standard input.
process.stdin.on('data', function (chunk)
{
    // Append each received data chunk to the 'input' string.
    input += chunk;
}); // End of 'data' event handler


// Event listener for the 'end' of the standard input stream.
process.stdin.on('end', function ()
{
    // When all input has been received, split the accumulated 'input' string
    // by any sequence of whitespace characters. This creates an array of tokens.
    input = input.split(/\s+/);

    // After processing all input, invoke the main function to start the computation.
    main();
}); // End of 'end' event handler