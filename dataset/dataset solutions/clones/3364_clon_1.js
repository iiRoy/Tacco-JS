/*
 * This is a Type I clone of the original JavaScript code.
 * All identifiers, operators, and expressions are identical.
 * Only whitespace and comments have been altered.
 */

var lines = [ ] ;
var a ; // A placeholder variable, not used in the original logic.


/*
 * Initialize the readline interface for input/output operations.
 * This module allows reading input streams line by line.
 */
var readline = require ( "readline" ) ;
var rl = readline . createInterface ( {
    input   :   process . stdin  ,
    output  :   process . stdout
} ) ;


// Event listener for each line of input received.
rl . on ( "line" , function ( x )
{
    lines . push ( x ) ; // Store each line in the 'lines' array.
} ) ;


// Event listener for when the input stream closes.
// This is where the main logic of the program resides.
rl . on ( "close" , function ( )
{
    // Process the first line of input to get L and N.
    var tmp = lines . shift ( ) . split ( " " ) ;

    // Parse L as a Number. L represents the total length.
    var L = Number ( tmp [ 0 ] ) ;

    // Parse N as a Number. N represents the number of points.
    var N = Number ( tmp [ 1 ] ) ;



    // Declare an array X of size N to store the point coordinates.
    var X = Array ( N ) ;

    // Populate the array X with N coordinate values from subsequent input lines.
    for ( var i = 0 ; i < N ; i ++ )
    {
        X [ i ] = Number ( lines [ i ] ) ;
    }

    // Sort the coordinate array X in ascending order.
    // This is crucial for the two-pointer approach used later.
    X . sort ( function ( a , b ) { return ( a - b ) ; } ) ;


    // Initialize pointers for the first scenario (initial move to the left).
    var right = 0 ;
    var left = N - 1 ;

    // Calculate initial distances for left and right movements.
    // a_l: distance from current left end to L.
    // a_r: distance from current right end to 0.
    var a_l = L - X [ left ] ;
    var a_r = X [ right ] ;

    // Variable to store the maximum distance for the 'initial left move' scenario.
    var result_l = 0 ;

    /*
     * Scenario 1: Assume the first move is to the left.
     * This loop simulates the movement for N steps.
     */
    for ( var counter = 0 ; counter < N ; counter ++ )
    {
        // Decision logic for moving left or right.
        // Move left if a_r is less than or equal to a_l, or if it's the very first step.
        if ( a_r <= a_l || counter === 0 )
        {
            result_l += a_l ;       // Accumulate the distance from the left move.
            a_r += a_l ;            // Update the right-side distance based on the left move.
            a_l = X [ left ] - X [ left - 1 ] ; // Calculate new left-side distance.
            left -- ;               // Move the left pointer inwards.
        }
        // Otherwise, move right.
        else
        {
            result_l += a_r ;       // Accumulate the distance from the right move.
            a_l += a_r ;            // Update the left-side distance based on the right move.
            a_r = X [ right + 1 ] - X [ right ] ; // Calculate new right-side distance.
            right ++ ;              // Move the right pointer inwards.
        }
    }


    // Re-initialize pointers and distances for the second scenario (initial move to the right).
    var right = 0 ;
    var left = N - 1 ;

    var a_l = L - X [ left ] ;
    var a_r = X [ right ] ;

    // Variable to store the maximum distance for the 'initial right move' scenario.
    var result_r = 0 ;


    /*
     * Scenario 2: Assume the first move is to the right.
     * This loop also simulates the movement for N steps.
     */
    for ( var counter = 0 ; counter < N ; counter ++ )
    {
        // Decision logic for moving right or left.
        // Move right if a_l is less than or equal to a_r, or if it's the very first step.
        if ( a_l <= a_r || counter === 0 )
        {
            result_r += a_r ;       // Accumulate the distance from the right move.
            a_l += a_r ;            // Update the left-side distance based on the right move.
            a_r = X [ right + 1 ] - X [ right ] ; // Calculate new right-side distance.
            right ++ ;              // Move the right pointer inwards.
        }
        // Otherwise, move left.
        else
        {
            result_r += a_l ;       // Accumulate the distance from the left move.
            a_r += a_l ;            // Update the right-side distance based on the left move.
            a_l = X [ left ] - X [ left - 1 ] ; // Calculate new left-side distance.
            left -- ;               // Move the left pointer inwards.
        }
    }

    // Output the maximum of the two calculated results.
    // This represents the optimal total distance.
    console . log ( Math . max ( result_l , result_r ) ) ;
} ) ;