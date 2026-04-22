/*
 * This JavaScript code processes numerical input to generate sequences.
 * It reads a series of start and goal numbers and computes a path
 * between them based on specific, non-trivial rules.
 *
 * This version is a Type I clone, meaning its functionality and structure
 * are identical to the original, with only whitespace and comments altered.
 *
 * Original Author: Unknown
 * Clone Generator: Expert System
 * Date Generated: 2023-10-27
 *
 */


// --- Input Acquisition and Initial Processing ---

// Utilize the Node.js 'fs' module to synchronously read all input
// from standard input ('/dev/stdin') as a UTF-8 string.
var input = require ( 'fs' ) . readFileSync ( '/dev/stdin' , 'utf8' ) ;


// Prepare the input string:
// 1. Remove any trailing newline character to prevent an empty last element.
// 2. Split the processed string into an array of individual lines.
var Arr = ( input . replace ( /\n$/ , "" ) ) . split ( "\n" ) ;


// Extract the first element from the 'Arr' array.
// This element represents the total number of data lines to process.
// The '- 0' operation explicitly converts the string to a number.
var n = Arr . shift ( ) - 0 ;


// --- Main Data Processing Loop ---

// Iterate 'n' times, processing one line of start/goal numbers in each iteration.
for ( var i = 0 ; i < n ; i++ )
{

    // For the current line in 'Arr':
    // 1. Split the string by spaces to get individual number strings.
    // 2. Use 'map(Number)' to convert each string element into an actual number.
    var arr = Arr [ i ] . split ( " " ) . map ( Number ) ;


    // Assign the first number from the parsed array as the starting point 's'.
    var s = arr [ 0 ] ;

    // Assign the second number from the parsed array as the goal point 'g'.
    var g = arr [ 1 ] ;


    // Initialize an array 'ans' to store the sequence of numbers,
    // starting with the initial 's' value.
    var ans = [ s ] ;


    // --- Conditional Logic for Sequence Generation ---

    // Check if the starting number 's' is already equal to the goal 'g'.
    if ( s == g )
    {
        // If they are equal, no path generation is needed.
        // This assignment is redundant but preserved for Type I consistency.
        s = g ;
    }

    // If 's' is less than 'g', increment 's' until it reaches 'g'.
    else if ( s < g )
    {
        do
        {
            s++ ;                 // Increment 's'.
            ans . push ( s ) ;    // Add the new 's' to the sequence.
        } while ( s != g ) ;      // Continue until 's' equals 'g'.
    }

    // If 's' is greater than 'g' AND 's' is less than or equal to 5,
    // decrement 's' until it reaches 'g'.
    else if ( s > g && s <= 5 )
    {
        do
        {
            s-- ;                 // Decrement 's'.
            ans . push ( s ) ;    // Add the new 's' to the sequence.
        } while ( s != g ) ;      // Continue until 's' equals 'g'.
    }

    // This 'else' block handles the remaining case: 's' is greater than 'g'
    // AND 's' is greater than 5.
    else
    {
        do
        {
            s++ ;                 // Increment 's'.
            if ( s == 10 )        // Special condition: if 's' reaches 10...
                s = 5 ;           // ...reset 's' to 5.
            ans . push ( s ) ;    // Add the (potentially modified) 's' to the sequence.
        } while ( s != g ) ;      // Continue until 's' equals 'g'.
    }


    // Output the generated sequence of numbers, with each number separated by a space.
    console . log ( ans . join ( " " ) ) ;

} // End of the 'for' loop.


/*
 * End of the JavaScript file.
 * All original logic, variable names, and operations are preserved.
 * Only formatting, spacing, and comments have been altered to
 * produce a Type I code clone.
 */