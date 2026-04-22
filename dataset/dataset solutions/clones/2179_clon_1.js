/*
 * This JavaScript file contains a program designed to process input data.
 * It primarily focuses on calculating cumulative sums and sliding window sums
 * based on numerical input. The 'use strict' directive is used to ensure
 * modern, safer coding practices are enforced throughout the script.
 */
'use strict'; // Enables strict mode for the entire script, catching common coding errors.

// Define the main function, which serves as the entry point for the program logic.
// It accepts a single argument, 'arg', which is expected to be the raw input string.
const main = arg => { // Start of the primary execution block.

    // Process the raw input string:
    // 1. Trim any leading or trailing whitespace.
    // 2. Split the string into an array of lines based on newline characters.
    const input = arg .trim()
                      .split("\n"); // Each element in 'input' array is a line from the input.

    // Extract the value for 'K' from the first line of input.
    // The first line is split by space, and the second token (index 1) is taken.
    // 'K' is likely intended to be a number, but it's initially stored as a string.
    let K = input[0] // Access the first line of input.
              .split(' ') // Split the line by spaces.
              [1];        // Select the second token (index 1).

    // Extract the array 'P' from the second line of input.
    // The second line is split by space, and each resulting string token
    // is converted into a number using the 'map' function.
    let P = input[1] // Access the second line of input.
              .split(' ') // Split the line by spaces into an array of strings.
              .map(p => Number(p)); // Convert each string element 'p' to a Number.

    // Initialize an empty array named 'sums'.
    // This array will store various calculated sums derived from 'P'.
    let sums = [ ] ;

    // Initialize 'ruisekiwa' (cumulative sums or prefix sums) array.
    // It starts with the first element of 'P'.
    let ruisekiwa = [ P[0] ]; // The first cumulative sum is just the first element.

    // Loop through the 'P' array starting from the second element (index 1)
    // to calculate and store the cumulative sums.
    for ( let i = 1 ; // Initialize loop counter 'i' to 1.
          i < P.length ; // Continue as long as 'i' is less than the length of 'P'.
          i++ ) // Increment 'i' after each iteration.
    {
        // Add the current element P[i] to the previous cumulative sum ruisekiwa[i - 1].
        // Push the result into the 'ruisekiwa' array.
        ruisekiwa.push(ruisekiwa[i - 1] + P[i]);
    } // End of the loop for calculating cumulative sums.

    // Add the cumulative sum up to the (K-1)th index into the 'sums' array.
    // Note: 'K' is implicitly converted to a number when used in array indexing.
    sums.push(ruisekiwa[K - 1]);

    // Loop to calculate sliding window sums of size 'K'.
    // The loop iterates from the beginning of 'P' up to 'P.length - K'
    // to ensure that a full window of size 'K' can always be formed.
    for ( let i = 0 ; // Initialize loop counter 'i' (start of window) to 0.
          i < P.length - K ; // Loop until the window can no longer fit.
          i++ ) // Increment 'i' to slide the window.
    {
        // Calculate the sum of the current window (from index 'i' to 'i + K - 1').
        // This is done by subtracting the cumulative sum up to 'i - 1' (ruisekiwa[i])
        // from the cumulative sum up to 'i + K - 1' (ruisekiwa[i + Number(K)]).
        // 'Number(K)' explicitly converts 'K' to a number for arithmetic operations.
        sums.push(ruisekiwa[i + Number(K)] - ruisekiwa[i]);
    } // End of the loop for calculating sliding window sums.

    // Initialize a dynamic programming array 'dp' with its first element as 0.
    // This array will store sums of consecutive integers (e.g., dp[x] = 1 + 2 + ... + x).
    let dp = [0];

    // Populate the 'dp' array up to 1000.
    // dp[i] will store the sum of all integers from 1 to 'i'.
    for ( let i = 1 ; // Initialize 'i' to 1.
          i <= 1000 ; // Loop as long as 'i' is less than or equal to 1000.
          i++ ) // Increment 'i' after each iteration.
    {
        // Calculate the current dp value by adding 'i' to the previous dp value (dp[i-1]).
        dp.push((dp[i - 1] + i));
    } // End of the loop for populating the 'dp' array.

    // Output a simple string 'hi' to the console.
    // This line might be a placeholder or for debugging purposes.
    console.log( 'hi' );

}; // End of the main function definition.


// Execute the 'main' function.
// It reads the entire content of '/dev/stdin' (standard input)
// as a UTF-8 encoded string and passes it to the 'main' function.
main( require('fs') // Import the Node.js 'fs' (file system) module.
        .readFileSync('/dev/stdin', 'utf8') // Read the file synchronously, specifying UTF-8 encoding.
    ); // Call the 'main' function with the read content.