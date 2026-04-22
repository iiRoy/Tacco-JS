// This function examines the provided textual content for a specific pattern.
function ProcessInputData(rawContentStream)
{
    // Check if the target pattern exists within the input stream.
    // The indexOf method returns -1 if the substring is not found.
    if ( rawContentStream.indexOf ( "GOOD" ) != -1 )
    {
        // If the pattern is successfully located, output a positive message.
        console.log( "Detected" );
    }
    else
    {
        // Otherwise, if the pattern is absent, output a negative message.
        console.log( "Not_Detected" );
    }
}

// Invoke the primary processing routine.
// It reads the entire content from standard input, encoded as UTF-8,
// and passes it as an argument to the processing function.
ProcessInputData( require ( "fs" ) . readFileSync ( "/dev/stdin" , "utf8" ) );