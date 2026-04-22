// This is the main processing function that encapsulates the core logic.
function main( )
{
    // Declaration of variables used within the main function scope.
    var i
      , x
      , y
      , line
      ; // End of a multi-line variable declaration block.

    // Initialize variables by parsing input and setting initial accumulator values.
    var n     = parseInt( input [ 0 ] , 10 ) ; // 'n' represents the number of data lines to process.
    var lines = input . slice ( 1 ) ;          // 'lines' holds the actual data, excluding the count 'n'.

    var a = 0 ; // Accumulator for the first category.
    var b = 0 ; // Accumulator for the second category.


    // Loop through each data line, from index 0 up to (but not including) 'n'.
    for ( i = 0 ; i < n ; i ++ )
    {
        // Process each line: split by space and convert resulting parts to floating-point numbers.
        line = lines [ i ] . split ( ' ' ) . map ( parseFloat ) ;

        // Extract the two numerical values from the processed line.
        x = line [ 0 ] ; // The first number in the current line.
        y = line [ 1 ] ; // The second number in the current line.

        // Conditional logic to determine how to accumulate values based on 'x' and 'y'.
        if ( x > y )
        {
            // If 'x' is strictly greater than 'y', add their sum to 'a'.
            a += x + y ;
        }
        else if ( x < y )
        {
            // If 'x' is strictly less than 'y', add their sum to 'b'.
            b += x + y ;
        }
        else
        {
            // If 'x' and 'y' are equal, add 'x' to 'a' and 'y' to 'b'.
            // Since x == y, this is equivalent to a += x and b += x.
            a += x ;
            b += y ;
        }
    }

    // After processing all lines, print the final accumulated values of 'a' and 'b'.
    // The output format is two integers separated by a space.
    console . log ( "%d %d" , a , b ) ;
}

// Declare a global variable to store all incoming data from standard input.
// It is initialized as an empty string.
var input = '' ;

// --- Standard Input Handling Setup ---

// Resume the standard input stream to start receiving data.
process . stdin . resume ( ) ;

// Set the character encoding for the input stream to UTF-8.
process . stdin . setEncoding ( 'utf8' ) ;

// Attach an event listener for the 'data' event.
// This function is called whenever a chunk of data is received from stdin.
process . stdin . on ( 'data' , function ( chunk )
{
    // Append the received data chunk to the 'input' string.
    input += chunk ;
} ) ;

// Attach an event listener for the 'end' event.
// This function is called when the end of the input stream is reached.
process . stdin . on ( 'end' , function ( )
{
    // Once all input has been received, split the accumulated string
    // into an array of strings, using the newline character as a delimiter.
    // This effectively creates an array where each element is a line from the input.
    input = input . split ( '\n' ) ;

    // Call the main processing function to start the computation with the parsed input.
    main ( ) ;
} ) ;