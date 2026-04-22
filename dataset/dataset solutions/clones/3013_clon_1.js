/*
 * This file contains a JavaScript program for processing an array of numbers.
 * The primary function `Main` takes an input string, parses it, and
 * calculates a specific result based on the logic described within.
 */

// Define the main function that processes the input.
function   Main(input)
{
    "use strict"; // Enforce strict mode for cleaner code.

    // Split the input string into an array of lines.
    const lines = input.split("\n");

    // Parse the first line to get the number of elements.
    const n = parseInt(lines[0], 10);

    // Parse the second line to get the array of numbers.
    // Each string element is converted to an integer.
    const as = lines[1].split(" ").map(s => parseInt(s, 10));


    let ans = 0; // Initialize the answer accumulator.

    // Initialize 'current' and 'next' values for processing.
    // 'current' will hold the previously processed number.
    // 'next' will hold the number to be processed in the current iteration.
    let current = 0, next = as[0];

    // Loop through the array from the first element up to the second-to-last.
    // The last element is handled outside the loop.
    for ( let i = 0;
           i < n - 1;
           i++ )
    {
        // Update 'current' to the value of 'next' from the previous iteration.
        current = next;

        // Get the next element from the array.
        next = as[i + 1];

        // --- Conditional logic for calculating 'ans' ---

        // Case 1: Both 'current' and 'next' have the same sign (both non-negative or both negative).
        if ( (current >= 0 && next >= 0) ||
             (current < 0 && next < 0) )
        {
            ans += Math.abs(current); // Add the absolute value of 'current' to 'ans'.
            next = Math.abs(next);    // Convert 'next' to its absolute value for subsequent processing.
            continue;                 // Move to the next iteration.
        }
        // Case 2: 'current' is non-negative and 'next' is negative.
        else if ( current >= 0 && next < 0)
        {
            if (current > Math.abs(next))
            {
                ans += current; // If 'current' is greater than absolute 'next', add 'current'.
            }
            else
            {
                // Check the sign of the element two positions ahead.
                if (as[i + 2] >= 0)
                {
                    ans += current; // If next-next is non-negative, add 'current'.
                }
                else
                {
                    ans -= current; // Otherwise, subtract 'current'.
                    next = -next;   // Invert the sign of 'next'.
                }
            }
            continue; // Move to the next iteration.
        }
        // Case 3: 'current' is negative and 'next' is non-negative.
        else
        {
            if (Math.abs(current) > next)
            {
                ans -= current; // If absolute 'current' is greater than 'next', subtract 'current'.
                next = -next;   // Invert the sign of 'next'.
            }
            else
            {
                // Check the sign of the element two positions ahead.
                if (as[i + 2] < 0)
                {
                    ans -= current; // If next-next is negative, subtract 'current'.
                    next = -next;   // Invert the sign of 'next'.
                }
                else
                {
                    ans += current; // Otherwise, add 'current'.
                }
            }
            continue; // Move to the next iteration.
        }
    }

    // After the loop, add the final 'next' value to 'ans' and print the result.
    console.log(ans + next);
}

// Call the Main function with input read from standard input.
Main(require("fs").readFileSync("/dev/stdin", "utf8"));