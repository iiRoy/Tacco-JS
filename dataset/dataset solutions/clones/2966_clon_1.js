// This JavaScript file processes input data from standard input
// using the 'readline' module to solve a specific algorithmic problem.
// It calculates a result based on relationships defined in the input lines.

var lines = [ ] ; // Initialize an empty array to hold all input lines.
var readline = require ( 'readline' ) ; // Import the built-in 'readline' module.

// Create a readline interface to read input line by line.
var rl = readline . createInterface ( {
    input   :   process . stdin ,   // Set the input stream to standard input.
    output  :   process . stdout    // Set the output stream to standard output (though not used for direct output here).
} ) ;

// Attach an event listener for each 'line' event.
// This function is executed every time a new line of input is received.
rl . on ( 'line' , function ( x )
{
    lines . push ( x ) ; // Add the current line 'x' to the 'lines' array.
} ) ;


// Attach an event listener for the 'close' event.
// This function is executed once the input stream ends (e.g., EOF is reached).
rl . on ( 'close' , function ( )
{
    // Parse the first line of input to extract N and M.
    // The first line is expected to contain two space-separated numbers.
    var N = Number ( lines [ 0 ] . split ( " " ) [ 0 ] ) ; // N is the first number.
    var M = Number ( lines [ 0 ] . split ( " " ) [ 1 ] ) ; // M is the second number.

    // Remove the first line from the 'lines' array as N and M have been extracted.
    lines . shift ( ) ;

    // Process the remaining lines:
    // Each line is split by space, and its parts are converted to numbers.
    // This creates an array of arrays (triplets [x, y, z]).
    var XYZ = lines . map ( i => i . split ( " " ) . map ( i => Number ( i ) ) ) ;

    // Initialize a 'check' array of size N with all elements set to -1.
    // This array will be used to track the state of N elements.
    var check = Array ( N ) . fill ( -1 ) ;
    var ans = 0 ; // Initialize the answer variable to 0.

    // Sort the 'XYZ' array based on the first element (x-coordinate) of each triplet.
    XYZ . sort ( ( a , b ) => a [ 0 ] - b [ 0 ] ) ;

    // Process the sorted XYZ triplets.
    // The loop continues as long as there are elements in XYZ.
    while ( XYZ . length )
    {
        var t = XYZ . shift ( ) ; // Remove and get the first triplet from the array.
        var x = t [ 0 ] ; // Extract the first value.
        var y = t [ 1 ] ; // Extract the second value.
        var z = t [ 2 ] ; // Extract the third value (though 'z' is not used in the logic below).

        // Conditional logic based on the 'check' array for elements x-1 and y-1.
        if ( check [ x - 1 ] !== -1 )
        {
            // If element x-1 is already 'checked' (not -1), then mark y-1 as checked.
            check [ y - 1 ] = 1 ;
        }
        else if ( check [ y - 1 ] !== -1 )
        {
            // Else if element y-1 is already 'checked', then mark x-1 as checked.
            check [ x - 1 ] = 1 ;
        }
        else
        {
            // If neither x-1 nor y-1 are checked, increment the answer and mark both as checked.
            ans ++ ;
            check [ x - 1 ] = 1 ;
            check [ y - 1 ] = 1 ;
        }
    }


    // After processing all triplets, iterate through the 'check' array.
    // This loop counts any remaining elements that are still unchecked (-1).
    for ( var i = 0 ; i < N ; i ++ )
    {
        if ( check [ i ] === -1 )
        {
            ans ++ ; // Increment the answer for each unchecked element.
        }
    }

    // Print the final calculated answer to standard output.
    console . log ( ans ) ;
} ) ;