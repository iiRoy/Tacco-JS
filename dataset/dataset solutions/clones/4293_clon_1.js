/*
 * This is a JavaScript program designed to read input from stdin,
 * process it, and then print a result to stdout.
 *
 * It specifically identifies the unique number among three, assuming two are identical.
 */


// Ensure the standard input stream is open and ready to receive data.
process.stdin.resume();

// Set the character encoding for the input stream to UTF-8.
process.stdin.setEncoding( 'utf8' );


// Declare a global variable to accumulate all incoming data chunks.
var g_input = '';

// Attach an event listener for the 'data' event on the standard input stream.
// This function is executed whenever new data is available.
process.stdin.on ( 'data', function ( chunk ) {
    // Append the received data chunk to the global input string.
    g_input += chunk ;
} ) ;


// Attach an event listener for the 'end' event on the standard input stream.
// This function is executed once all input has been received.
process.stdin.on ( 'end', function ( ) {
    // Split the accumulated input string by newlines (handling both Windows and Unix line endings).
    // Then, pass the resulting array of lines to the Main function for processing.
    Main ( g_input.split ( /\r?\n/ ) ) ;
} ) ;


// The primary function that processes the input data.
// @param {Array<string>} input - An array of strings, where each string is a line from the input.
function Main ( input )
{

    // The first line of input is expected to contain space-separated numbers.
    // Split this line by spaces to get an array of number strings.
    var numbers = input [ 0 ] . split ( ' ' ) ;


    // Check if the first and second numbers are equal.
    if ( numbers [ 0 ] == numbers [ 1 ] )
    {
        // If they are equal, the third number is the unique one.
        console.log ( numbers [ 2 ] ) ;
    }
    // Otherwise, check if the first and third numbers are equal.
    else if ( numbers [ 0 ] == numbers [ 2 ] )
    {
        // If they are equal, the second number is the unique one.
        console.log ( numbers [ 1 ] ) ;
    }
    // If neither of the above conditions is met, it means the second and third numbers must be equal.
    else
    {
        // In this case, the first number is the unique one.
        console.log ( numbers [ 0 ] ) ;
    }


    // Return 0 to indicate successful execution.
    return 0 ;
}

// End of program.