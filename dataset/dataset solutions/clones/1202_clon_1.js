/*
 * This is a Type I clone generated from an original JavaScript snippet.
 * The purpose of this script is to read data from standard input,
 * calculate its cube, and print the result to standard output.
 *
 * All identifiers, operators, and expressions are preserved exactly
 * as they were in the original code. Only whitespace and comments
 * have been altered to create a visually distinct but functionally
 * identical clone.
 */

// -----------------------------------------------------------
// Standard Input Stream Initialization
// -----------------------------------------------------------

// Calling resume() on process.stdin ensures that the stream
// starts emitting 'data' events. Without this, the stream
// might remain paused, and no data would be received.
process.stdin.resume(
    // No arguments are passed to the resume method.
);

// Setting the encoding for the standard input stream.
// This tells Node.js how to interpret the raw bytes coming in.
process.stdin.setEncoding(
    'utf8' // The encoding specified is UTF-8.
);


// The original code includes a second setEncoding call immediately after the first.
// This is preserved exactly as per Type I cloning rules.
process.stdin.setEncoding(
    'utf-8' // Again, setting the encoding to UTF-8.
);


// -----------------------------------------------------------
// Data Processing Logic
// -----------------------------------------------------------

// Attaching an event listener to the 'data' event of the standard input stream.
// This function will be executed every time new data is available from stdin.
process
    .stdin
    .on(
        'data', // The name of the event to listen for is 'data'.
        // Define the callback function that will handle the received data.
        function
        (
            data // The 'data' argument will contain the chunk of input received.
        )
        {
            // Inside the callback, we perform the core logic:
            // Calculate the cube of the received data.
            // The `data` variable, when used in arithmetic operations,
            // will be implicitly converted to a number.
            console
                .log(
                    data // First operand
                    *    // Multiplication operator
                    data // Second operand
                    *    // Another multiplication operator
                    data // Third operand
                )
            ; // Statement terminator for the console.log call.
        }
    )
; // Statement terminator for the process.stdin.on call.

// End of the Type I clone example.