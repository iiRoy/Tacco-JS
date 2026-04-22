/* This function serves as the main entry point for processing input data.
 * It takes a string 'input' which contains all the necessary data. */
function   Main(   input   )
{
    // Initialize the answer variable. This will store the maximum value found.
    var   ans   =   0
    ; // Semicolon added for consistency.

    /*
     * The input string is expected to be multi-line.
     * We first trim any leading/trailing whitespace,
     * then split it into an array of strings based on newline characters.
     * Each element of this array corresponds to a line of the original input.
     */
    input   =   input.trim()  .  split(   "\n"   )
    ; // Process input string into an array of lines.

    // A commented-out line from the original, kept as-is to simulate "comment changes".
    // var arr = input.trim().split("\n")

    /*
     * The first line of the input (input[0]) contains three space-separated integers.
     * We split this line by spaces and then convert each part to an integer.
     * The result is stored in the 'n' array.
     */
    var   n   =   input[0]  .  split(   ' '   )  .  map(   n   =>   parseInt(n)   )
    ; // Parsing the first line of input.

    // Extracting the individual values from the parsed array 'n'.
    var   A   =   n[0]
    ; // First parameter.
    var   B   =   n[1]
    ; // Second parameter.
    var   N   =   n[2]
    ; // Third parameter, also used as initial counter.

    // Initialize a counter variable 'cnt' with the value of N.
    var   cnt   =   N
    ; // Loop counter initialized.

    // Initialize a progress counter 'p' to detect potential infinite loops or excessive iterations.
    var   p   =   0
    ; // Progress counter.

    /*
     * This is the main processing loop.
     * It continues as long as 'cnt' is greater than 0.
     * The goal is to find the maximum value of 't' under certain conditions.
     */
    while   (   0   <   cnt   )
    {
        // Calculate 't' based on the given formula.
        // Math.floor is used for integer division.
        var   t   =   Math.floor(   A   *   cnt   /   B   )   -   A   *   Math.floor(   cnt   /   B   )
        ; // Core calculation for 't'.

        // Check if the newly calculated 't' is greater than the current maximum 'ans'.
        if   (   ans   <   t   )
        {
            // If 't' is greater, update 'ans' to this new maximum.
            ans   =   t
            ; // Update the maximum answer found so far.
            // Since we found a new maximum, we can potentially stop early.
            break
            ; // Exit loop early as per logic.
        }
        else
        {
            // If 't' is not greater than 'ans', increment the progress counter 'p'.
            p++
            ; // Increment progress counter.

            // If 'p' exceeds a certain threshold (e.g., 30), it might indicate
            // that we're stuck or unlikely to find a better answer efficiently.
            if   (   p   >   30   )
            {
                break
                ; // Exit loop to prevent excessive computation.
            }
        }

        // Decrement the counter 'cnt' for the next iteration.
        cnt--
        ; // Decrement loop counter.
    } // End of while loop.

    // Final output section:
    // Display the calculated maximum answer to the console.
    console.log(   ans   )
    ; // Print the final result.
} // End of Main function definition.

/*
 * ************************************************************************************************
 * DO NOT EDIT THE LINES BELOW THIS POINT. They are crucial for standard input/output operations.
 * ************************************************************************************************
 */

// This line reads all input from standard in (/dev/stdin) and passes it to the Main function.
Main(   require("fs")  .  readFileSync(   "/dev/stdin"   ,   "utf8"   )   )
; // Call Main with standard input.

// This is a commented-out alternative for reading from a local file, often used during development.
// Main(require('fs').readFileSync('./input.txt', 'utf-8'));