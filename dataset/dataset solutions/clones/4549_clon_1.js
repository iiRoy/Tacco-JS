/*
 * This JavaScript code implements a solution for a specific problem.
 * It processes input to determine an answer based on a series of calculations.
 */

// Define the main function that encapsulates the program logic.
function Main ( input )
{

    // Split the entire input string by newline characters to get an array of lines.
    input = input.split( "\n" ) ;

    // Parse the first line of input to extract 'n', 'a', and 'b'.
    // 'n' represents the number of elements or iterations.
    var n = parseInt( input[ 0 ].split( " " )[ 0 ] ) ;

    // 'a' is a value used in calculations, parsed from the first line.
    var a = parseInt( input[ 0 ].split( " " )[ 1 ] ) ;

    // 'b' is another value used in calculations, also parsed from the first line.
    var b = parseInt( input[ 0 ].split( " " )[ 2 ] ) ;


    // Initialize an empty array 'h' which will store integer values.
    h = new Array( ) ;

    // Declare a variable 'mas' and initialize it to 0. Its purpose isn't immediately clear from this snippet,
    // but it's part of the original logic and must be preserved.
    var mas = 0 ;

    /*
     * Populate the array 'h' with integer values from the input.
     * Each subsequent line of input (starting from the second line, index 1)
     * corresponds to an element in 'h'.
     */
    for ( i = 0 ; i < n ; i++ )
    {
        // Convert the input line to an integer and assign it to the current index of 'h'.
        h[ i ] = parseInt( input[ i + 1 ] ) ;
    }


    // Initialize 'ans' (answer) to 0. This variable will count the iterations or operations.
    var ans = 0 ;

    /*
     * Main loop of the algorithm. It continues as long as the maximum value in 'h' is non-negative.
     * The 'i' counter is incremented in each iteration.
     */
    for ( i = 0 ; Math.max.apply( null, h ) >= 0 ; i++ )
    {

        // Find the index of the maximum element in array 'h'.
        var maxi = h.indexOf( Math.max.apply( null, h ) ) ;

        // Inner loop: Iterate through the array 'h' in reverse order.
        for ( j = h.length - 1 ; j >= 0 ; j-- )
        {
            // Check if the current element is the maximum element found earlier.
            if ( j == maxi )
            {
                // If it's the maximum, subtract 'a' from its value.
                h[ j ] -= a ;
            }
            else
            {
                // If it's not the maximum, subtract 'b' from its value.
                h[ j ] -= b ;

                // If the element's value becomes zero or less, remove it from the array.
                if ( h[ j ] <= 0 )
                {
                    h.splice( j, 1 ) ; // Remove 1 element at index 'j'.
                }
            }
        }

        // Increment the answer counter after each full iteration of the outer loop.
        ans++ ;
    }

    // Output the final calculated answer to the console.
    console.log( '%s', ans ) ;
}

// Invoke the Main function with input read from standard input.
// This is a common pattern for competitive programming in Node.js.
Main ( require( "fs" ).readFileSync( "/dev/stdin", "utf8" ) ) ;