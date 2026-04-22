/*
 * This JavaScript file processes input from stdin.
 * It evaluates a sequence of boolean-like operations represented by 'T' and 'F'.
 * The core logic is implemented in a recursive function named 'saiki'.
 */


var input = require( 'fs' ) . readFileSync ( '/dev/stdin' , 'utf8' ) ; // Read raw input from standard input

// Split the input into an array of lines and trim leading/trailing whitespace
var arr = input . trim() . split( "\n" ) ;


// The first line is 'n', which seems to be the number of operations, but is not used in this specific implementation.
var n = arr . shift ( ) ;


// The second line contains the actual boolean-like values, space-separated.
var p = arr . shift ( ) . split ( " " ) ;


/**
 * The 'saiki' function recursively processes the array 'p'.
 * It takes two elements, 'a' and 'b', from the front of the array.
 * Based on their values and whether 'p' is empty, it either
 * pushes a result back onto 'p' or prints the final result.
 * @param {Array<string>} p - An array of 'T' or 'F' strings.
 */
var saiki = function ( p )
{
    // Extract the first two elements for evaluation
    var a = p . shift ( ) ;
    var b = p . shift ( ) ;

    // --- Conditional logic for processing 'a' and 'b' and updating 'p' ---

    // Case 1: Both are 'T', and there are more elements to process.
    if ( a == "T" && b == "T" && p . length != 0 )
    {
        p . unshift ( "T" ) ; // Push 'T' back to the front.
    }
    // Case 2: 'T' and 'F', and there are more elements.
    else if ( a == "T" && b == "F" && p . length != 0 )
    {
        p . unshift ( "F" ) ; // Push 'F' back to the front.
    }
    // Case 3: 'F' and 'T', and there are more elements.
    else if ( a == "F" && b == "T" && p . length != 0 )
    {
        p . unshift ( "T" ) ; // Push 'T' back to the front.
    }
    // Case 4: Both are 'F', and there are more elements.
    else if ( a == "F" && b == "F" && p . length != 0 )
    {
        p . unshift ( "T" ) ; // Push 'T' back to the front.
    }
    // Case 5: Both are 'T', and 'p' is now empty (base case for printing).
    else if ( a == "T" && b == "T" && p . length == 0 )
    {
        console . log ( "T" ) ; // Print "T"
        return ;                  // Exit the function
    }
    // Case 6: 'T' and 'F', and 'p' is empty.
    else if ( a == "T" && b == "F" && p . length == 0 )
    {
        console . log ( "F" ) ; // Print "F"
        return ;                  // Exit the function
    }
    // Case 7: 'F' and 'T', and 'p' is empty.
    else if ( a == "F" && b == "T" && p . length == 0 )
    {
        console . log ( "T" ) ; // Print "T"
        return ;                  // Exit the function
    }
    // Case 8: Both are 'F', and 'p' is empty.
    else if ( a == "F" && b == "F" && p . length == 0 )
    {
        console . log ( "T" ) ; // Print "T"
        return ;                  // Exit the function
    }

    // Recursively call 'saiki' with the modified array 'p'.
    saiki ( p ) ;
} ;

// Initial call to the recursive function with the parsed input array.
saiki ( p ) ;