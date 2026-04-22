/*
 * This is a Type I clone of an existing JavaScript program.
 * The original logic and structure are preserved exactly.
 * Only whitespace and comments have been altered significantly
 * to create a visually distinct but functionally identical version.
 */
'use strict' ; // Enforce strict mode for cleaner code execution.


// Define the main function that processes the input string.
function main ( s )
{

    // Process the input string 's' to extract numerical values.
    // 1. Split by newline to isolate the first line of input.
    // 2. Split the first line by space to get individual string numbers.
    // 3. Map each string number to an actual Number type.
    s = s . split ( '\n' ) [ 0 ] . split ( ' ' ) . map ( x => Number ( x ) ) ;

    // Assign the extracted numbers to meaningful constant variables.
    const a = s [ 0 ] ; // The first integer value.
    const b = s [ 1 ] ; // The second integer value.
    const k = s [ 2 ] ; // The iteration count, also an integer.

    // Initialize a Set data structure to store unique answer values.
    // Using a Set automatically handles duplicate entries.
    let ans = new Set ( ) ;

    // Loop 'k' times to generate potential numbers based on 'a', 'b', and the current iteration 'i'.
    for ( let i = 0 ; i < k ; i ++ )
    {
        // Check a compound condition:
        // - Is (a + i) still less than or equal to 'b'?
        // - OR is (b - i) still greater than or equal to 'a'?
        // This ensures we are within the desired range or generating valid numbers.
        if ( ( a + i ) <= b || ( b - i ) >= a )
        {
            // If the condition is met, add the calculated values to the 'ans' Set.
            // Add the value starting from 'a' and incrementing.
            ans . add ( a + i ) ;
            // Add the value starting from 'b' and decrementing.
            ans . add ( b - i ) ;
        }
        else
        {
            // If the condition is no longer met,
            // further iterations will not produce new valid numbers within the range.
            // Thus, we can safely exit the loop early to optimize performance.
            break ;
        }
    }

    // Convert the Set of unique numbers into a sorted string for output.
    // 1. Use the spread operator `...` to convert the Set into an array.
    // 2. Sort the array numerically in ascending order using a custom comparison function.
    // 3. Join the sorted numbers with newline characters to form a single string.
    ans = [ ... ans ] . sort ( ( a , b ) => a - b ) . join ( '\n' ) ;

    // Print the final, sorted, and newline-separated answer string to the console.
    console . log ( ans ) ;

} // End of the main function definition.


// Execute the main function, providing input from standard input.
// `require("fs")` is used to access Node.js's file system module.
// `readFileSync("/dev/stdin", "utf8")` reads the entire content of the standard input
// as a UTF-8 encoded string, which is then passed to the `main` function.
main ( require ( "fs" ) . readFileSync ( "/dev/stdin" , "utf8" ) ) ;

// End of JavaScript program execution.