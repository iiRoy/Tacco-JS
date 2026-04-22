/*
 * This JavaScript program reads input from standard input,
 * processes it in a loop, and then prints a result to the console.
 * It appears to simulate some kind of game or resource distribution.
 */

// Import the 'fs' module to interact with the file system,
// specifically to read from standard input.
var input = require( 'fs' ).readFileSync( '/dev/stdin' ,  'utf8' ) ;


// Process the raw input: trim whitespace and split into an array of lines.
var Arr = ( input.trim( ) ) . split( "\n" ) ;


// Main processing loop. It continues indefinitely until a specific condition is met.
while ( true )
{
    // Retrieve the first line from the array and store it in 'np'.
    var np = Arr.shift( ) ;

    // Check for the termination condition: if 'np' is "0 0", exit the loop.
    if ( np == "0 0" )
    {
        break ; // Exit the 'while' loop.
    }

    // Parse 'np': split by space and convert parts to numbers.
    np = np.split( " " ).map( Number ) ;

    // Extract 'n' and 'p' values from the parsed 'np' array.
    var n = np[ 0 ] ;
    var p = np[ 1 ] ;

    // Initialize an array 'arr' of size 'n' with all elements set to 0.
    var arr = [ ] ;
    for ( var i = 0 ; i < n ; i++ )
    {
        arr.push( 0 ) ;
    }

    // Initialize a counter 'j' for array indexing.
    var j = 0 ;

    /*
     * This inner loop runs for a fixed number of iterations (1,000,000).
     * It simulates the core logic of the problem.
     */
    for ( var i = 0 ; i < 1000000 ; i++ )
    {
        // If 'j' reaches the end of 'arr', reset it to 0 (circular access).
        if ( j == arr.length )
        {
            j = 0 ;
        }


        // Check if 'p' (current resource/value) is greater than 0.
        if ( p > 0 )
        {
            p-- ;      // Decrement 'p'.
            arr[j]++ ; // Increment the element at index 'j' in 'arr'.

            // If 'p' becomes 0 after decrementing, check for a specific condition.
            if ( p == 0 )
            {
                // Calculate the sum of all elements in 'arr'.
                var sum = arr.reduce( function ( a , b ) { return a + b ; } ) ;

                // If the sum minus the current element 'arr[j]' is 0,
                // it implies 'arr[j]' holds the entire sum.
                if ( sum - arr[j] == 0 )
                {
                    console.log( j ) ; // Print the index 'j'.
                    break ;            // Exit the inner 'for' loop.
                }
            }
        }
        else // If 'p' is not greater than 0 (i.e., p is 0).
        {
            p = arr[j] ; // Assign the value of 'arr[j]' to 'p'.
            arr[j] = 0 ; // Set 'arr[j]' to 0.
        }

        j++ ; // Increment 'j' for the next iteration.
    }
}