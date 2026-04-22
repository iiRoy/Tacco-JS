/*
 * This is a Type I clone of a JavaScript program.
 * It processes standard input to solve a specific problem.
 * The original logic and structure are preserved exactly.
 * Only whitespace and comments have been altered significantly.
 */

// Resume the standard input stream, ensuring it does not pause automatically.
process.stdin.resume( );


// Set the character encoding for the standard input data to UTF-8.
process.stdin.setEncoding( 'utf8' );


// Declare a global variable to accumulate all incoming data from stdin.
var g_input = '';


// Attach an event listener for 'data' events on the standard input stream.
// This function will be called whenever new data chunks are available.
process.stdin.on( 'data', function ( chunk )
{
    // Append the received data chunk to the global input string.
    g_input += chunk;
} );


// Attach an event listener for 'end' events on the standard input stream.
// This function will execute once all input data has been received.
process.stdin.on( 'end', function ( )
{
    // Split the accumulated input string into an array of lines,
    // handling both Windows (\r\n) and Unix (\n) line endings.
    // Then, pass this array of lines to the Main function for processing.
    Main( g_input.split( /\r?\n/ ) );
} );


/**
 * This is the primary function of the program, where the main logic resides.
 * It takes an array of strings, typically representing lines of input.
 * @param {Array<string>} input - An array of strings, each representing a line of input.
 */
function Main( input )
{
    // Parse the first line of input to extract an integer value 'n'.
    // The radix 10 is specified to ensure decimal parsing.
    var n = parseInt( input[0], 10 );

    // Split the second line of input by spaces to get an array of string values.
    var values = input[1].split( ' ' );

    // Declare and initialize a new array 'p' with a size of 'n'.
    var p = new Array( n );

    // Loop through the 'values' array to populate 'p' with parsed integer values.
    for ( var i = 0; i < n; i++ )
    {
        // Convert each string value from 'values' to an integer and store it in 'p'.
        p[i] = parseInt( values[i], 10 );
    }


    // Initialize a counter to keep track of the number of swap operations performed.
    var swapCount = 0;

    // Iterate through the array 'p' from the first element to the last.
    for ( var i = 0; i < n; i++ )
    {
        // Check if the current element p[i] is equal to its expected 1-based index (i + 1).
        // This condition indicates an element that needs to be moved.
        if ( p[i] == i + 1 )
        {
            // If the current element is the very last element in the array.
            if ( i == n - 1 )
            {
                // Swap the last element with the element immediately preceding it.
                swap( p, i, i - 1 );
                swapCount++; // Increment the swap counter.
            }
            // If the current element is not the last one in the array.
            else
            {
                // Swap the current element with the element immediately following it.
                swap( p, i, i + 1 );
                swapCount++; // Increment the swap counter.
            }
        }
    }

    // Output the final count of swap operations to the console.
    console.log( swapCount );
}


/**
 * A helper function designed to swap two elements within a given array.
 * It performs an in-place swap using a temporary variable.
 * @param {Array<any>} array - The array in which elements are to be swapped.
 * @param {number} src - The index of the first element to be swapped.
 * @param {number} dest - The index of the second element to be swapped.
 */
function swap( array, src, dest )
{
    // Store the value of the element at the source index in a temporary variable.
    var temp = array[src];

    // Assign the value from the destination index to the source index.
    array[src] = array[dest];

    // Assign the temporarily stored value to the destination index, completing the swap.
    array[dest] = temp;
}