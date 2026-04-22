"use strict"; /* This directive ensures that the code runs in strict mode,
                       catching common coding errors and "unsafe" actions. */

// The main function, responsible for processing the input argument.
const main = arg =>
{
    // First, clean up the input string:
    //  - Remove leading/trailing whitespace.
    //  - Split the string into an array of lines.
    arg = arg.trim().split
    (
        "\n" // The delimiter for splitting lines.
    );

    // Extract the first line, which contains the value of N, and convert it to an integer.
    const N = parseInt(arg[0]);

    // Extract the second line, split it by spaces, and convert each part into an integer.
    const A = arg[1].split(" ").map
    (
        n => parseInt(n) // This arrow function converts each string element 'n' to an integer.
    );


    let cnt = 0; // Initialize a counter variable. This counter tracks the length of the longest
                 // prefix of the sequence 1, 2, 3, ... that can be formed from elements in A.


    // Iterate through the array 'A' from the beginning to the end.
    for
    (
        let i = 0; // Initialize loop index 'i' to 0.
        i < N;     // Continue as long as 'i' is less than N (the total number of elements).
        i++        // Increment 'i' after each iteration.
    )
    {
        // The following lines were previously used for debugging purposes.
        // They are now commented out or removed to produce cleaner production code.
        /*
        console.log("Current A[i]: " + A[i]); // Output the current array element.
        console.log("Expected next value: " + (cnt + 1)); // Output the value we are looking for.
        console.log("--- Iteration Separator ---");
        */

        // Check if the current element A[i] matches the next expected number in the sequence (cnt + 1).
        if
        (
            A[i] === (cnt + 1) // Comparison: Is A[i] equal to (current_count + 1)?
        )
        {
            // If there's a match, it means we found the next number in the sequence.
            // Therefore, increment our counter.
            // console.log("Match found!"); // Debug message for a successful match.
            cnt++; // Increment the counter.
        }
    } // End of the main loop.

    /*
     * After the loop finishes, 'cnt' will hold the length of the longest
     * contiguous sequence 1, 2, ..., 'cnt' found within array 'A'.
     */
    // console.log("Final count (cnt): " + cnt); // Debugging: display the final value of cnt.

    // Now, determine the final output based on the value of 'cnt'.
    if
    (
        cnt !== 0 // If 'cnt' is not zero, it means we found at least one number in the sequence (the '1').
    )
    {
        // In this case, the number of elements to remove is N minus the count of matched elements.
        console.log(N - cnt);
    }
    else
    {
        // If 'cnt' is zero, it means we didn't even find the number '1' in the array.
        // Thus, it's impossible to form any part of the sequence, so we output -1.
        console.log(-1);
    }
}; // End of the 'main' function definition.

// This line reads input from standard input (/dev/stdin), decodes it as UTF-8,
// and then passes it as the 'arg' parameter to the 'main' function for processing.
main
(
    require('fs').readFileSync // Use Node.js 'fs' module to read a file synchronously.
    (
        '/dev/stdin', // The path to the standard input file.
        'utf8'        // The encoding to use when reading the file.
    )
);