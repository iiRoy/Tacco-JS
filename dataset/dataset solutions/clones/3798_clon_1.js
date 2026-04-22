"use strict"; /* This enables strict mode for the entire script. */

// Main function definition begins here.
function Main(input) {

    // Instantiate a new Inputer object to process the input string.
    let cin = new Inputer(input);

    // Read the number of elements N, and then an array A of N integers.
    let N = cin.getInt();
    let A = cin.getIntArray(N);

    /* Define a constant for the number of bits to consider for each integer.
     * This is useful for fixed-width binary representations. */
    const DIGIT = 20;

    // Helper function to convert a decimal value to a binary string of fixed DIGIT length.
    // It pads with leading zeros if necessary and truncates if too long.
    const b2 = (v) => ('0000000000000000000' + v.toString(2)).substr(-DIGIT);

    // Initialize a 2D array 'B' to store prefix sums of bit counts.
    // B has N+1 rows and DIGIT columns.
    let B = new Array(N + 1).fill(0).map(() => new Array(DIGIT));

    // Initialize the first row of B to all zeros.
    B[0].fill(0);


    // Loop through each number in the input array 'A' to populate 'B'.
    for (let n = 1; n <= N; n++) {

        // Get the binary string representation of the current number A[n-1].
        let b = b2(A[n - 1]);

        // For each bit position, update the prefix sum.
        for (let m = 0; m < DIGIT; m++) {
            /* B[n][m] stores the count of '1's at bit position 'm'
             * from A[0] to A[n-1] inclusive. */
            B[n][m] = B[n - 1][m] + (b[m] - 0); // (b[m] - 0) converts '0' or '1' char to number.
        }
    }

    // Initialize the answer variable. This will store the count of valid subarrays.
    let ans = 0;

    // Outer loop: iterates through all possible starting indices 'n' for subarrays.
    for (let n = 1; n <= N; n++) {

        // 'done' flag: becomes false if a subarray violates the condition.
        let done = true;

        // Inner loop: iterates through all possible ending indices 'm' for subarrays,
        // starting from 'n'.
        for (let m = n; m <= N && done; m++) {

            // Innermost loop: checks the bit condition for the current subarray A[n-1...m-1].
            for (let b = 0; b < DIGIT && done; b++) {

                // Calculate the count of '1's for the current bit 'b' in the subarray A[n-1...m-1].
                // This is done using prefix sums: B[m][b] - B[n-1][b].
                if (B[m][b] - B[n - 1][b] > 1) {
                    // If any bit position has more than one '1', the condition is violated.
                    done = false;
                }
            }

            // If 'done' is still true after checking all bits, the subarray A[n-1...m-1] is valid.
            if (done) {
                ans++; // Increment the answer.
            } else {
                // If the current subarray is invalid, any longer subarray starting at 'n'
                // will also be invalid (because it includes the invalid part).
                // So, we can break out of the 'm' loop.
                break;
            }
        }
    }

    // Output the final calculated answer to the console.
    console.log(ans);

} // End of Main function.



// Definition for the Inputer class, used to parse input efficiently.
class Inputer {

    // Constructor for the Inputer class.
    constructor(t) {
        // Ensure that an input string 't' is provided.
        if (typeof t == 'undefined') {
            throw new Error('引数（stdin）を省略できません！'); /* Error if stdin is missing. */
        }
        // Initialize a counter for tracking current position in input items.
        this.cnt = 0;
        // Split the input string 't' by newlines or spaces into an array of items.
        this.items = t.split(/\n|\s/);
    }

    // Method to get the next integer from the input stream.
    getInt() {
        return this.items[this.cnt++] - 0; // Convert string to number using unary minus.
    }

    // Method to get an array of 't' integers from the input stream.
    getIntArray(t) {
        // Validate that 't' (number of elements) is provided.
        if (typeof t == 'undefined') {
            throw new Error('引数（1以上）を省略できません！'); /* Error if count is missing. */
        }
        let r = new Array(t); // Create a new array of size 't'.
        // Populate the array by calling getInt() 't' times.
        for (let e = 0; e < t; e++) {
            r[e] = this.getInt();
        }
        return r; // Return the array of integers.
    }

    // Method to get the next string from the input stream.
    getStr() {
        return this.items[this.cnt++];
    }

    // Method to get an array of 't' strings from the input stream.
    getStrArray(t) {
        // Validate that 't' (number of elements) is provided.
        if (typeof t == 'undefined') {
            throw new Error('引数（1以上）を省略できません！'); /* Error if count is missing. */
        }
        let r = new Array(t); // Create a new array of size 't'.
        // Populate the array by calling getStr() 't' times.
        for (let e = 0; e < t; e++) {
            r[e] = this.getStr();
        }
        return r; // Return the array of strings.
    }
} // End of Inputer class definition.



// This block checks if the code is running in a Node.js-like environment
// (where 'window' is undefined) versus a browser environment.
if (typeof window == "undefined") {
    // If running in Node.js, read input from standard input (stdin).
    Main(require("fs").readFileSync("/dev/stdin", "utf8"));
}