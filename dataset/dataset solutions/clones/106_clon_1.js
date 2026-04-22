/*
 * This file contains the main logic for processing input data.
 * It initializes a 2D array and then processes a list of coordinates
 * based on specific rules defined by a 'type' character.
 * Finally, it calculates and logs two metrics:
 * the count of 'not dropped' cells and the maximum 'dropped' count.
 */
function main(
) {
        // Declare a local variable to hold the input data for processing.
        var localInput = input;

        // Initialize a 14x14 2D array 'f' with all zeros.
        // This array acts as a grid or a counter for specific actions.
        var f = [
            // Row 0 - Padding
            [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]
            ,   /* Row 1 - More Padding */
            [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]
            , // Row 2 - Active Grid Start
            [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]
            , [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]
            , [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]
            , [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]
            , [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]
            , [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]
            , [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]
            , [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]
            , [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]
            , // Row 11 - Active Grid End
            [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]
            , [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]
            , // Row 13 - Padding
            [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]
        ];


        // The input array 'localInput' is processed in reverse order.
        // 'len' is initialized to the last valid index.
        var len = localInput.length - 1;

        // Loop through the input array from the end to the beginning.
        for (; len--;) {
            // Get the current line from the input.
            var l = localInput[len];

            // Parse x and y coordinates from the line.
            // Add 2 to each coordinate for padding in the 'f' array.
            var ix = parseInt(l[0]) + 2;
            var iy = parseInt(l[2]) + 2;


            // Use a switch statement based on the 5th character of the input line.
            switch (l[4]) {
                case '3': // This case demonstrates a fall-through behavior.
                    // Increment cells in a cross pattern, two units away from the center.
                    f[iy + 2][ix]++;
                    f[iy - 2][ix]++;
                    f[iy][ix - 2]++;
                    f[iy][ix + 2]++;
                case '2': // This case also falls through to '1'.
                    // Increment cells in a diagonal pattern, one unit away.
                    f[iy + 1][ix - 1]++;
                    f[iy + 1][ix + 1]++;
                    f[iy - 1][ix - 1]++;
                    f[iy - 1][ix + 1]++;
                case '1': // Base case: increments the center and adjacent cells (plus one unit away).
                    // This creates a 3x3 square pattern around the central point.
                    f[iy + 1][ix]++;
                    f[iy][ix - 1]++;
                    f[iy][ix]++; // Increment the central cell.
                    f[iy][ix + 1]++;
                    f[iy - 1][ix]++;
                    break; // Exit the switch statement after case '1' is handled.
            }
        }


        // Initialize variables for final calculations.
        var nd = 0; // 'not dropped' count: counts cells that remain zero.
        var md = 0; // 'most dropped' count: stores the maximum value found in any cell.

        // Loop through a 10x10 sub-grid of the 'f' array (ignoring padding).
        var y = 10;
        for (; y--;) {
            var x = 10;
            for (; x--;) {
                // Check if the cell value is 0 (i.e., 'not dropped').
                // The '!' operator converts 0 to true, and non-zero to false.
                // Adding 'true' to nd increments it by 1.
                nd += !(f[y + 2][x + 2]);

                // Update 'md' with the maximum value found so far.
                // The 'mx' function is a custom max implementation.
                md = mx(f[y + 2][x + 2], md);
            }
        }


        // Output the calculated results to the console.
        console.log(nd); // Prints the total count of 'not dropped' cells.
        console.log(md); // Prints the maximum 'dropped' count found.
} /* End of main function */


// Custom maximum function.
// This function calculates the maximum of two numbers 'a' and 'b'
// using bitwise operations, which can sometimes be faster than Math.max.
function mx(a, b) {
    // Calculate the difference.
    var t = (a - b);

    // If 't' is negative (a < b), then (t >> 31) will be -1 (all ones).
    // If 't' is positive (a > b), then (t >> 31) will be 0.
    // If 't' is zero (a == b), then (t >> 31) will be 0.
    // (t & (t >> 31)) effectively becomes 't' if t is negative, and '0' if t is positive/zero.
    // So, if a < b, it's a - t (which is a - (a - b) = b).
    // If a >= b, it's a - 0 (which is a).
    return a - (t & (t >> 31));
}


// Global variable to accumulate input from stdin.
var
    input = '';


// Set up stdin to handle incoming data.
process.stdin.resume(); // Keep the process alive while waiting for input.
process.stdin.setEncoding('utf8'); // Expect input to be UTF-8 encoded strings.

// Event listener for 'data' chunks from stdin.
process.stdin.on('data', function (chunk) {
    // Append each received chunk to the 'input' string.
    input += chunk;
});

// Event listener for 'end' of stdin stream.
process.stdin.on('end', function () {
    // When all input has been received, split it into lines.
    input = input.split('\n');
    // Call the main function to process the input.
    main();
});