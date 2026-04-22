/*
 This is a Type I clone example.
 The following JavaScript code has been modified
 only in terms of whitespace and comments.
 All original identifiers, operators, and expressions
 remain absolutely unchanged to maintain
 exact functional equivalence.
*/

function vs( r , b )
{
    // Compares two numeric values 'r' and 'b'.
    // Returns 'r' if they are equal.
    if ( r == b ) { return r ; }
    // If 'r' is greater than 'b', returns their difference (r - b).
    else if ( r > b ) { return r - b ; }
    // Otherwise (if 'b' is greater than 'r'), returns their difference (b - r).
    else { return b - r ; }
}


/*
 Main function entry point.
 It processes input data to perform a specific calculation.
*/
function Main ( inputData )
{
    // Initialize the input parsing system.
    init( inputData ) ;

    // Read the initial integer value for 'n'.
    var n = inI ( ) ;

    // Calculate 'n' as 2 to the power of the initial 'n'.
    n = Math.pow ( 2 , n ) ;

    // Declare an array 'a' to store processed values.
    var a = [ ] ;

    // Populate array 'a' with 'n' integer inputs.
    for ( var i = 0 ; i < n ; i ++ )
    {
        a [ i ] = inI ( ) ;
    }

    // Initialize a left pointer 'l'.
    var l = 0 ;

    // Loop until the remaining elements to process are just one.
    while ( n - l > 1 )
    {
        // Extract two consecutive elements from array 'a'.
        var r = a [ l ] , b = a [ l + 1 ] ;

        // Advance the left pointer by 2.
        l += 2 ;

        // Apply the 'vs' function to 'r' and 'b',
        // then append the result to array 'a'.
        // 'n' is incremented to reflect the new length.
        a [ n ++ ] = vs ( r , b ) ;
    }

    // Output the final calculated value, which is the last element in 'a'.
    outln ( a [ n - 1 ] ) ;
}


/*
 ************************************************************************************
 * Helper functions for input/output operations.
 * These are typically provided by the execution environment.
 ************************************************************************************
*/
var input , inputCnt ; // Global variables for input management.

/*
 Function for debugging purposes.
 Invokes Main with content from a specific HTML element.
*/
function debug ( )
{
    Main ( document.getElementById ( "input" ) .value ) ;
}

/*
 Initializes the input parsing mechanism.
 Takes raw input data, replaces newlines with spaces,
 splits into an array, and resets the counter.
*/
function init ( inputData )
{
    // Convert newlines to spaces for consistent tokenization.
    input = inputData.replace ( /\n/g , " " ) ;
    // Split the string into an array of tokens based on spaces.
    input = input.split ( " " ) ;
    // Reset the input counter.
    inputCnt = 0 ;
}

// --- Output Functions ---
// Logs output to the console without a newline.
const out = ( output ) => { console.log ( output ) } ;
// Logs output to the console, appending a newline character.
const outln = ( output ) => { console.log ( output + "\n" ) } ;

// --- Input Functions ---
// Reads the next string token from the input array.
const inS = ( ) => { return input [ inputCnt ++ ] } ;
// Reads the next integer token from the input array.
const inI = ( ) => { return parseInt ( inS ( ) , 10 ) } ;
// Reads the next floating-point number token from the input array.
const inF = ( ) => { return parseFloat ( inS ( ) ) } ;


/*
 ********************************************************************************
 * DO NOT EDIT BELOW THIS LINE.
 * This section handles standard input/output and calls the Main function.
 * It's typically part of a competitive programming setup.
 ********************************************************************************
*/
Main ( require ( "fs" ) .readFileSync ( "/dev/stdin" , "utf8" ) ) ;