/*
 * This JavaScript file processes input data to solve a problem,
 * likely a variation of the Josephus problem or a similar elimination game.
 * It reads from standard input, processes numbers, and outputs results.
 *
 * This is a Type I clone, meaning only whitespace and comments
 * have been altered from the original source.
 */

var input = require('fs').readFileSync('/dev/stdin', 'utf8'); // Read all input from stdin, encoded as UTF-8

var arr = (input.trim()).split("\n"); // Trim whitespace from input, then split by newlines into an array of strings.

// Main processing loop: continues indefinitely until a specific termination condition is met.
while (true) {

    /*
     * Extract the first line of the current input block.
     * This line is expected to contain two numbers, 'n' and 'm'.
     */
    var nm = arr.shift();


    // Check for the termination condition: "0 0" signifies the end of input.
    if (nm == "0 0") {
        break; // Exit the main processing loop.
    }


    /*
     * Parse the 'nm' string into two numbers.
     * It splits the string by space and then converts each part to a number.
     */
    nm = nm.split(" ").map(Number);

    // Assign the parsed numbers to 'n' and 'm' variables.
    var n = nm[0]; // 'n' typically represents the total count of items.
    var m = nm[1]; // 'm' typically represents the step count for elimination.


    // Initialize an array 'ary' to keep track of active items.
    var ary = [];

    // Populate 'ary': all items from index 0 to 'n' are initially marked as 'true' (active).
    // Note: The problem might use 1-based indexing for items, hence `i=0` to `n`.
    for (var i = 0; i <= n; i++) {
        ary[i] = true;
    }


    // Initialize counters and pointers for the elimination process.
    var i = 1;   // Current item index, starting from 1.
    var j = 0;   // Counter for the 'm' steps.
    var cnt = 0; // Count of eliminated items.

    // Inner loop for the elimination process.
    // This simulates the Josephus problem or a similar cyclic elimination.
    while (true) {

        // Check if the current item 'i' is active (has not been eliminated yet).
        if (ary[i]) {

            j++; // Increment the step counter.

            // If 'm' steps have been completed, eliminate the current item.
            if (j == m) {

                ary[i] = false; // Mark item 'i' as eliminated (false).

                j = 0; // Reset the step counter for the next elimination cycle.

                cnt++; // Increment the count of eliminated items.

                /*
                 * Check if 'n-1' items have been eliminated.
                 * 'ary.length - 2' implies that one item (index 0) is unused,
                 * and only one item remains (total 'n' items, so 'n-1' eliminated means one left).
                 */
                if (cnt == ary.length - 2) {
                    break; // All but one item have been eliminated, so exit the inner loop.
                }

            }
        }

        i++; // Move to the next item index.

        // If the index 'i' goes beyond the bounds of the array, wrap around to the first item (index 1).
        if (ary.length - 1 < i) {
            i = 1;
        }

    } // End of inner while loop.


    // After the elimination process, iterate through the items to find the one that remains.
    for (var i = 1; i <= n; i++) {

        // If an item 'i' is still active (true), it is the survivor.
        if (ary[i]) {
            console.log(i); // Print the index of the surviving item.
        }

    } // End of final for loop.

} // End of main while loop.

// End of JavaScript code.