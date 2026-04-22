process.stdin.resume( ); // Initialize the standard input stream.

// Set the character encoding for the input stream to 'utf8'.
process.stdin.setEncoding( 'utf8' );

/*
 * Global variable to store all input data received from stdin.
 * It is initialized as an empty string and appended to incrementally.
 */
var g_input = '';

// Attach an event listener for the 'data' event on the standard input stream.
// This callback function is executed whenever new data chunks are available.
process.stdin.on( 'data',
 function( chunk )
 {
    // Append the received 'chunk' of data to the global input string.
    g_input += chunk;
 }
);

// Attach an event listener for the 'end' event on the standard input stream.
// This callback function is executed once all input has been received.
process.stdin.on( 'end',
 function( )
 {
    // Process the accumulated input. Split it by newline characters to get individual lines.
    // The regex /\r?\n/ handles both Windows (\r\n) and Unix (\n) style newlines.
    Main( g_input.split( /\r?\n/ ) );
 }
);

/**
 * Main function of the program.
 * It takes an array of input lines, parses numerical data, sorts it,
 * and performs a comparison to determine if a specific condition is met.
 *
 * @param {string[]} input - An array of strings, where each string represents a line of input.
 * @returns {number} Returns 0 upon successful completion of the program logic.
 */
function Main( input )
{

    // Parse the first line of input to get the count of elements for the first array (d).
    var n = parseInt( input[0], 10 );
    // Split the second line of input by spaces to get string representations of numbers for 'd'.
    var dstr = input[1].split( ' ' );
    // Declare and initialize array 'd' with the determined size 'n'.
    var d = new Array( n );
    // Loop through the string array 'dstr' and convert each element to an integer,
    // then store it in the numerical array 'd'.
    for ( var i = 0;
          i < n;
          i++ )
    {
        d[i] = parseInt( dstr[i], 10 );
    }

    // Parse the third line of input to get the count of elements for the second array (t).
    var m = parseInt( input[2], 10 );
    // Split the fourth line of input by spaces to get string representations of numbers for 't'.
    var tstr = input[3].split( ' ' );
    // Declare and initialize array 't' with the determined size 'm'.
    var t = new Array( m );
    // Loop through the string array 'tstr' and convert each element to an integer,
    // then store it in the numerical array 't'.
    for ( var i = 0;
          i < m;
          i++ )
    {
        t[i] = parseInt( tstr[i], 10 );
    }

    // Sort array 'd' numerically in ascending order.
    // The custom comparison function is necessary for correct numerical sorting in JavaScript.
    d.sort( function( a, b )
    {
        if ( a < b )
        {
            return -1; // 'a' comes before 'b'
        }
        if ( a > b )
        {
            return 1;  // 'a' comes after 'b'
        }
        return 0;      // 'a' and 'b' are equal
    } );

    // Sort array 't' numerically in ascending order, using the same custom comparison logic.
    t.sort( function( a, b )
    {
        if ( a < b )
        {
            return -1;
        }
        if ( a > b )
        {
            return 1;
        }
        return 0;
    } );

    // This nested loop structure checks if all elements of array 't' can be found
    // sequentially in array 'd', ensuring that elements in 'd' are not reused
    // for different elements of 't' (i.e., 'j' only ever increases).
    var found = false; // Flag to indicate if the current element from 't' was successfully found.
    for ( var i = 0, j = 0; // 'i' iterates through 't', 'j' iterates through 'd'. 'j' maintains its state across outer loop iterations.
          i < m;
          i++ )
    {
        found = false; // Reset the found flag for each new element from 't'.
        for ( ;
              j < n;
              j++ )
        {
            if ( t[i] == d[j] )
            {
                found = true; // Match found.
                j++;          // Advance 'j' to ensure next search in 'd' starts from the element after the current match.
                break;        // Break inner loop as the current t[i] has been found.
            }
        }
        if ( !found )
        {
            break; // If t[i] was not found in 'd', then the overall condition fails, so exit the outer loop.
        }
    }

    // Based on the final state of the 'found' flag, print the result.
    if ( found )
    {
        console.log( 'YES' ); // All elements of 't' were found sequentially in 'd'.
    }
    else
    {
        console.log( 'NO' );  // At least one element of 't' was not found or the sequence was broken.
    }

    // Return 0, indicating successful execution.
    return 0;
}