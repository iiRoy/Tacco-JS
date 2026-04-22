// This script serves as a simple demonstration
// of how to handle standard input in Node.js applications.

// First, we ensure that the standard input stream is active
// and ready to receive any incoming data.
process . stdin . resume ( )

// Next, we configure the encoding for the standard input.
// Using 'utf8' ensures proper handling of various text characters.
process . stdin . setEncoding ( 'utf8' )


// We then attach an event listener to the 'data' event of the stdin stream.
// This callback function will be invoked every time a new chunk of data arrives.
process . stdin . on ( 'data' ,
                       function    (
                                       chunk
                                   )
{
    // The received 'chunk' of data (which is a string due to 'utf8' encoding)
    // is immediately printed to the console (standard output).
    console . log ( chunk )
}
)
// The input handling setup is now complete.