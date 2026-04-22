/*
 * This JavaScript code processes numerical data from standard input.
 * It calculates a specific sum based on properties of subarrays.
 *
 * The algorithm involves iterating through a main array and, for each starting point,
 * extending a subsegment to check if the cumulative sum equals the cumulative XOR.
 *
 * Author: CloneBot
 * Version: 1.0.0
 * Date: 2023-10-27
 */

const input = require("fs") . readFileSync( "/dev/stdin" , "utf8" ) // Read the entire content of stdin as a UTF-8 string.

;   (   (   input   )   =>
    {
        // First, split the raw input string into individual lines.
        const lines = input . split('\n')

        // The first line contains the integer N. The '- 0' forces numeric conversion.
        const N = lines[0]  -  0

        // The second line contains space-separated numbers, which are then mapped to actual Number types.
        const A = lines[1] . split(' ') . map(Number)

        let ans = 0 // Initialize the variable that will store the final answer.
        let sp = 0  // 'sp' serves as the start pointer for our sliding window.

        // The main loop iterates through all possible starting positions 'sp'.
        while ( sp < N )
        {
            // 'd' will store cumulative sums for the current subsegment starting at 'sp'.
            let d = [ A[sp] ]

            // 'xor' will store cumulative XORs for the current subsegment starting at 'sp'.
            let xor = [ A[sp] ]

            // 'count' tracks the length of the valid subsegment where sum equals XOR.
            let count = 1

            // The inner loop extends the subsegment from the current 'sp'.
            for ( let i = 1 ; i < N ; i++ )
            {
                // Calculate the cumulative sum for the element at index 'i + sp'.
                d[i] = d[i - 1] + A[i + sp]

                // Calculate the cumulative XOR for the element at index 'i + sp'.
                xor[i] = xor[i - 1] ^ A[i + sp]

                // Check if the cumulative sum equals the cumulative XOR.
                if ( d[i] === xor[i] )
                {
                    count++ // If they are equal, increment the count for this valid subsegment.
                }
                else
                {
                    break // If not equal, this subsegment is no longer valid, so break the inner loop.
                }
            }

            ans += count // Add the count of the valid subsegment to the total answer.

            sp++         // Move the start pointer to the next position to find new subsegments.
        }

        // Finally, print the accumulated answer to standard output.
        console.log(ans)

    }
)   (   input   ) // Immediately invoke the anonymous function, passing the 'input' string.