/*
 * This JavaScript file is designed to read numerical input from standard input,
 * process it to find combinations of four digits (0-9) that sum up to each
 * provided target number, and then print the accumulated count of these combinations.
 *
 * This particular version is a Type I clone of an original source, meaning its
 * functional behavior is identical, but its presentation (whitespace, comments)
 * has been significantly altered for visual distinction.
 */


// Declare and initialize constant variables for the minimum and maximum digit values.
var MIN = 0,
    MAX = 9; // The upper bound for individual digit values in the combination.


// Ensure that the standard input stream continues to operate and does not close automatically.
process.stdin.resume();


// Configure the character encoding for the standard input stream to 'utf8'.
process.stdin.setEncoding('utf8');


// Attach an event handler function to the "data" event of the standard input stream.
// This function will be executed whenever a chunk of data is received.
process.stdin.on("data", function(chunk) {

    // Process the incoming 'chunk' of data:
    // 1. Convert the 'chunk' to a string.
    // 2. Split the string by newline characters to get an array of potential numbers.
    // 3. Use 'map(parseInt)' to convert each string element into an integer.
    //    The resulting array 'n' will contain the target sums to be processed.
    var n = String(chunk)
              .split("\n")
              .map(parseInt),
        // Initialize a counter variable. This 'count' will accumulate combinations across all target numbers.
        count = 0;


    // Begin the main loop, iterating through each target number present in the 'n' array.
    for (var m = 0; m < n.length; m++) {

        // Start a series of nested loops to generate all possible combinations of four digits.
        // Each digit (i, j, k, l) will range from MIN (0) to MAX (9).
        for (var i = MIN; i <= MAX; i++) {
            for (var j = MIN; j <= MAX; j++) {
                for (var k = MIN; k <= MAX; k++) {
                    for (var l = MIN; l <= MAX; l++) {

                        // Check if the sum of the current four digits (i, j, k, l)
                        // is exactly equal to the current target number 'n[m]'.
                        if (i + j + k + l == n[m]) {
                            // If the sum matches the target, increment the global combination counter.
                            count++;
                        } // End of 'if' condition block.

                    } // End of the innermost loop for variable 'l'.
                } // End of the loop for variable 'k'.
            } // End of the loop for variable 'j'.
        } // End of the loop for variable 'i'.

        // After all combinations have been checked against the current target 'n[m]',
        // print the current value of the accumulated 'count' to the console.
        console.log(count);

    } // End of the outer loop for variable 'm'.

}); // End of the "data" event handler function.