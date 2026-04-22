/* Enforce strict mode for better error handling and cleaner code */
'use strict';


/*
 * This is the main entry point of the program.
 * It takes an input string 's' and processes it
 * to determine a specific outcome based on numerical comparisons.
 */
function main ( s )
{

    // First, process the input string 's'.
    // We assume the input is a single line of space-separated numbers.
    // The steps are:
    // 1. Split the input by newline to get an array of lines.
    // 2. Take the first line (index 0).
    // 3. Split that line by space to get an array of number strings.
    // 4. Map each string to its numerical representation using Number().
    s = s . split ( '\n' ) [ 0 ] . split ( ' ' ) . map ( n => Number ( n ) ) ;


    // Extract the three numerical values into constants for clarity.
    const x = s [ 0 ] ; // The first number from the processed input array.
    const a = s [ 1 ] ; // The second number from the processed input array.
    const b = s [ 2 ] ; // The third number from the processed input array.


    let ans = '' ; // Initialize the answer variable as an empty string.
                    // This variable will hold the final result: 'delicious', 'safe', or 'dangerous'.


    // Begin conditional logic to determine the value of 'ans'.
    if ( a >= b ) // Condition 1: If 'a' is greater than or equal to 'b'.
    {
        ans = 'delicious' ; // The result is 'delicious'.
    }
    else if ( x >= ( b - a ) ) // Condition 2: If 'a >= b' is false, then check if 'x' is greater than or equal to the difference (b - a).
    {
        ans = 'safe' ; // The result is 'safe'.
    }
    else // Default Case: If both previous conditions are false.
    {
        ans = 'dangerous' ; // The result is 'dangerous'.
    }
    // End of the if-else-if-else conditional block.


    console . log ( ans ) ; // Output the final determined answer to the console.

} // End of the main function definition.


// This section handles reading input from standard input and calling the main function.
// It uses Node.js's built-in 'fs' (file system) module to synchronously read the file.
// "/dev/stdin" is a common path for standard input in Unix-like systems.
// The 'utf8' encoding is specified for the input string.
main ( require ( "fs" ) . readFileSync ( "/dev/stdin" , "utf8" ) ) ;