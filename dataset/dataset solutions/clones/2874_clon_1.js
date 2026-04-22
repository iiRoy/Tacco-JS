/*
 * This is a JavaScript program designed to process input lines
 * and determine a "Yes" or "No" outcome based on a set of specific
 * conditions applied to parsed numerical parameters and a character string.
 * It leverages Node.js's 'readline' module for standard I/O operations.
 */

// Initialize an array to hold all lines read from standard input.
var   lines   =   [];


// Load the 'readline' module, which provides an interface for reading data
// from a Readable stream (like process.stdin) one line at a time.
var   readline   =   require('readline');

// Establish the readline interface, configuring it to use standard input
// for reading and standard output for writing (though this program
// primarily writes to stdout via console.log).
var   rl   =   readline.createInterface(
    {
        input:  process.stdin,    // Specifies the input stream as standard input.
        output: process.stdout    // Specifies the output stream as standard output.
    }
);

// Register an event listener for the 'line' event.
// This function will be executed every time a new line of input is received.
rl.on(
    'line',
    function ( x )
    {
        // Append the received line 'x' to the 'lines' array.
        // Each input line is stored for later processing.
        lines.push(x);
    }
);

// Register an event listener for the 'close' event.
// This function will be executed once the input stream ends (e.g., EOF is received).
// All core logic of the program resides within this callback.
rl.on(
    'close',
    function ( )
    {
        // Parse the first line of input (lines[0]) to extract five numerical parameters.
        // These parameters are space-separated.
        var   N   =   Number( lines[0].split(" ")[0] ); // First parameter
        var   A   =   Number( lines[0].split(" ")[1] ); // Second parameter
        var   B   =   Number( lines[0].split(" ")[2] ); // Third parameter
        var   C   =   Number( lines[0].split(" ")[3] ); // Fourth parameter
        var   D   =   Number( lines[0].split(" ")[4] ); // Fifth parameter

        // The second line of input (lines[1]) is treated as a string,
        // which is then split into an array of individual characters.
        var   S   =   lines[1].split("");

        // Initialize a boolean flag. This flag will be set to 'true' if
        // a specific pattern of three consecutive dots is found under certain conditions.
        var   flag   =   false;

        // Commence a loop to iterate through each character of the string 'S'.
        // The loop inspects character patterns and their positions relative to
        // the parsed numerical parameters.
        for  (
            var   i   =   0;                 // Initialize loop counter 'i' to 0.
            i   <   S.length;                // Continue as long as 'i' is within the bounds of string 'S'.
            i++                              // Increment 'i' after each iteration.
        )
        {
            // Condition 1: Check for two consecutive '#' characters.
            // If 'S[i]' and 'S[i+1]' are both '#' AND
            // if the current index 'i' is within the range A to Math.max(C, D) (inclusive for i+1),
            // then the program immediately outputs "No" and terminates.
            if  (
                    ( S[i]  ===  "#"  &&  S[i + 1]  ===  "#" )
                    &&
                    ( A <= i  &&  i + 1 <= Math.max(C, D) )
                )
            {
                console.log("No"); // Print "No" to standard output.
                return(0);         // Exit the program with a status code of 0.
            }

            // Condition 2: Check for three consecutive '.' characters.
            // If 'S[i]', 'S[i+1]', and 'S[i+2]' are all '.' AND
            // if the current index 'i' is greater than or equal to B AND
            // if (i+3 is less than or equal to D OR i+1 is equal to D),
            // then set the 'flag' to true. This flag indicates a specific
            // sub-condition has been met, which might affect later decisions.
            if  (
                    ( S[i]  ===  "."  &&  S[i + 1]  ===  "."  &&  S[i + 2]  ===  "." )
                    &&
                    ( B <= i  &&  ( i + 3 <= D  ||  i + 1  ===  D ) )
                )
            {
                flag   =   true; // Set the flag to true.
            }
        }

        // Final condition check after the loop has completed.
        // This complex condition determines if a "No" should be outputted
        // based on the values of C, D, and the 'flag'.
        if  (
                D < C                                     // Is D strictly less than C?
                &&
                ( S[D - 2]  ===  "#"  ||  S[D]  ===  "#" ) // Is there a '#' at index D-2 or D?
                &&
                ( S[B - 2]  ===  "#"  ||  S[B]  ===  "#" ) // Is there a '#' at index B-2 or B?
                &&
                flag  ===  false                         // Has the three-consecutive-dots flag remained false?
            )
        {
            console.log("No"); // If all parts of this final condition are true, output "No".
            return(0);         // Terminate the program.
        }

        // If none of the "No" conditions (either in the loop or the final check)
        // were met, then the program concludes with a "Yes".
        console.log("Yes"); // Print "Yes" to standard output.
    }
);