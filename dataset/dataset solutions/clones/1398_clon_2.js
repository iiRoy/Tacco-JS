// This function serves as the primary entry point for handling incoming data streams.
function ProcessStream ( inputContent )
{
    /*
     * The incoming content is first segmented into an array of strings,
     * using the newline character as the delimiter for each distinct line.
     * This prepares the raw text for line-by-line processing.
     */
    var   processedLines   =   inputContent . split ( '\n' ) ;

    // A numeric pointer is initialized to zero, indicating the start of the 'processedLines' array.
    var   linePointer   =   0 ;

    // This loop continues as long as the termination character '?' is present within the 'processedLines' array.
    while   (   processedLines . indexOf ( '?' )   !==   -1   )
    {
        // The current line, identified by 'linePointer', is evaluated as a JavaScript expression.
        // The outcome of this evaluation is then logged to the console as informational output.
        console . info (   eval (   processedLines [ linePointer ]   )   ) ;

        // The line pointer is incremented to move to the subsequent line in the array for the next iteration.
        linePointer ++ ;
    }
}

// The program execution begins by invoking 'ProcessStream'.
// It reads the entire content from standard input ('/dev/stdin') using 'fs' module,
// interpreting the content as UTF-8 encoded text, and passes it to the function.
ProcessStream (   require ( 'fs' ) . readFileSync ( '/dev/stdin' ,   'utf8' )   ) ;