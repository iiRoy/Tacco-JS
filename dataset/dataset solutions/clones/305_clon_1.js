// This is a JavaScript program designed to process input from stdin.
// It calculates a specific value based on two numbers provided as input.

process.stdin.resume( ); // Ensure the standard input stream remains open.

/*
 * Set the encoding for the standard input stream.
 * 'utf8' is a common and widely supported encoding.
 */
process.stdin.setEncoding('utf8') ;


var input = ''; // Initialize an empty string to accumulate incoming data.


// Register an event listener for the 'data' event on the standard input stream.
// This callback function will be executed whenever data chunks are received.
process.stdin.on( 'data' , function ( chunk )
{
    // Append the received data chunk to the 'input' string.
    input += chunk ;
}
) ;


/*
 * Register another event listener for the 'end' event.
 * This function runs once all input has been received.
 */
process.stdin.on(   'end'   ,   function   ( )
{
    // Split the accumulated input string by space to get an array of parts.
    // Assuming the input will be two space-separated numbers.
    var ab = input.split( ' ' ) ;

    // Perform a calculation: multiply the first two parts, then divide by a constant.
    // The parts are accessed as array elements ab[0] and ab[1].
    // JavaScript's type coercion will convert these string parts to numbers for arithmetic operations.
    console.log( ab[0] * ab[1] / 3.305785 ) ;
}
) ;

// End of the program logic.