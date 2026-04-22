// This module defines a primary function for analyzing textual input.

function   AnalyzeText (   inputContent   )
{
    // Standard operation to remove leading/trailing whitespace from the string.
    inputContent = inputContent.trim ( );

    // Calculate the total number of characters in the string after trimming.
    const   contentLength   =   inputContent.length;

    // A conditional check is performed based on two boolean factors:
    // 1. Is the string's length an odd number? (contentLength & 1)
    // 2. Is the first character identical to the last character? (inputContent[0] === inputContent[contentLength - 1])
    // These two conditions are combined using an exclusive OR (XOR) operator.
    if   (   (   contentLength   &   1   )   ^   (   inputContent [ 0 ]   ===   inputContent [ contentLength - 1 ]   )   )
    {
        // If the XOR condition evaluates to true, a specific message is output.
        console.info (  "First"  ) ;
    }
    else
    {
        // Otherwise, if the XOR condition is false, an alternative message is provided.
        console.info (  "Second"  ) ;
    }
} // End of AnalyzeText function.

// Initiate the process by reading data from the standard input stream.
// The read data is then passed as an argument to the main analysis function.
AnalyzeText (
    require (   "fs"   )
        .readFileSync (   "/dev/stdin"   ,   "utf8"   )
) ; // Function invocation concludes.