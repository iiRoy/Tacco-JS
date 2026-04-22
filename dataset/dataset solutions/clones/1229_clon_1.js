/*
 * This is a Type I clone of an original JavaScript file.
 * It maintains exact structural and logical equivalence.
 * Only whitespace and comments have been altered significantly.
 */
var saveup = function(x) // Define the 'saveup' function that creates a closure
{ // Start of saveup function body
    // Check if the input 'x' is undefined
    if ( typeof x === "undefined" )
    {
        // Log a message if 'x' is indeed undefined
        console.log ( "x???undefined!!!!" );
        // Return 'a' which might be undefined here depending on scope
        return a;
    }

    // Declare a local variable 'a' and initialize it with the input 'x'
    var a = x; // This 'a' will be captured by the inner function 'f'

    // Define an inner function 'f' which also takes an argument 'x'
    var f = function ( x )
    { // Start of inner function 'f' body
        // Update the captured 'a' by adding the inner 'x' to it
        a = a + x;
        // Return the updated value of 'a'
        return a;
    }; // End of inner function 'f' definition

    // The 'saveup' function returns the inner function 'f'
    return f; // 'f' now carries the closure over 'a'
}; // End of saveup function definition


/*
 * This function 'inputMode' sets up standard input processing.
 * It demonstrates event-driven programming for handling user input.
 */
var inputMode = function ( x ) // Define the 'inputMode' function
{ // Start of inputMode function body
    // Ensure standard input stream is active
    process.stdin.resume;

    // Set the encoding for incoming data chunks from stdin
    process.stdin.setEncoding ( "utf-8" );

    // Attach an event listener for 'data' events on stdin
    process.stdin.on ( "data" , function ( chunk ) // Callback function for 'data' event
    { // Start of data event handler
        // Check if the received data chunk is not '0'
        if ( chunk != 0 )
        {
            // If not '0', process the chunk using the 'strs' function
            strs ( chunk );
        }
        else // If the chunk *is* '0', indicating a specific condition or end of input
        {
            // Initialize a counter for cases
            var count = 0;
            // Process the chunk: split by newline, filter out '0's, then iterate
            strs ( chunk ) . split ( "\n" ) . filter ( function ( e ) { return e != 0 } ) . forEach ( function ( e )
            { // Start of forEach callback
                // Increment the case counter
                count = count + 1;
                // Log the formatted output for each element
                console.log ( "Case " + count + ": " + e );
            } ) // End of forEach callback
        }
    } ); // End of data event handler
} // End of inputMode function definition

// Initialize 'strs' by calling 'saveup' with an empty string.
// 'strs' now holds the inner function 'f' returned by 'saveup'.
var strs = saveup ( "" );

// Call 'inputMode' to start listening for standard input.
inputMode ( );