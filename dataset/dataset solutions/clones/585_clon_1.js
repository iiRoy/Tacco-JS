/*
 * This JavaScript code reads a series of test cases, each consisting of a list of numbers.
 * For each test case, it attempts to minimize the length of a string formed by these numbers
 * by applying a "bomb" operation. The bomb operation removes sequences of four or more
 * identical digits (1s, 2s, or 3s). The code explores different initial modifications
 * to the number sequence to find the absolute minimum length.
 */

/**
 * Applies a "bomb" operation to a given string `x`.
 * The operation repeatedly removes any sequence of four or more consecutive '1's, '2's, or '3's.
 * It updates a global `min` variable with the shortest string length found after all bombs.
 *
 * @param {string} x The input string to apply the bomb operation on.
 */
function bomb( x )
{
    // L stores the length of the string before the last replacement.
    // It's used to detect if any changes occurred in an iteration.
    var L = 0 ;

    // Continue looping as long as replacements are being made,
    // meaning the string length is still changing.
    while ( L != x . length )
    {
        // Record the current length before attempting a replacement.
        L = x . length ;
        // Replace all occurrences of four or more consecutive '1's, '2's, or '3's with an empty string.
        x = x . replace ( /1{4,}|2{4,}|3{4,}/g , "" ) ;
    }

    // After all possible bomb operations, update the global minimum length.
    min = Math . min ( min , x . length ) ;
}

// Read the entire input from standard input as a UTF-8 string.
var input = require ( 'fs' ) . readFileSync ( '/dev/stdin' , 'utf8' ) ;

// Trim leading/trailing whitespace from the input and then split it into an array of lines.
var Arr = ( input . trim ( ) ) . split ( "\n" ) ;

// Main loop to process multiple test cases.
// It continues indefinitely until a specific termination condition is met.
while ( true )
{
    // Shift the first line from the array, convert it to a number, and store it as N.
    // N represents the number of elements in the current test case.
    var N = Arr . shift ( ) - 0 ;

    // If N is 0, it signifies the end of input, so break out of the loop.
    if ( N == 0 )
    {
        break ; // Terminate the program.
    }

    // Initialize an empty array to store the numbers for the current test case.
    var arr = [ ] ;

    // Loop N times to populate the 'arr' array with numbers from the input.
    for ( var i = 0 ; i < N ; i ++ )
    {
        // Shift the next line, convert it to a number, and push it into 'arr'.
        var v = Arr . shift ( ) - 0 ;
        arr . push ( v ) ;
    }

    // Initialize 'min' to positive infinity. This variable will store the
    // smallest string length found across all permutations.
    var min = Infinity ;

    // Convert the initial array of numbers into a single string.
    // Although not directly used for bomb, 'arr' itself is used for slicing.
    var str = arr . join ( "" ) ; // This line is present in the original, keeping it for Type I.

    // Iterate through each possible position in the array.
    // In each iteration, we consider two ways to modify the array:
    // 1. Replacing the current element with the next one.
    // 2. Replacing the current element with the previous one.
    for ( var i = 0 ; i < N ; i ++ )
    {
        // Create a shallow copy of the original array for modification scenario A.
        var A = arr . slice ( ) ;
        // Create another shallow copy for modification scenario B.
        var B = arr . slice ( ) ;

        // Scenario A: If the current element is not the last one,
        // replace it with the value of the next element.
        if ( i < N - 1 )
        {
            A [ i ] = A [ i + 1 ] ;
        }

        // Scenario B: If the current element is not the first one,
        // replace it with the value of the previous element.
        if ( i > 0 )
        {
            B [ i ] = B [ i - 1 ] ;
        }

        // Convert array A into a string and apply the bomb operation.
        // The global 'min' variable will be updated if a shorter length is found.
        bomb ( A . join ( "" ) ) ;

        // Convert array B into a string and apply the bomb operation.
        // The global 'min' variable will be updated again if a shorter length is found.
        bomb ( B . join ( "" ) ) ;
    }

    // After processing all modifications for the current test case,
    // print the overall minimum length found to the console.
    console . log ( min ) ;
}