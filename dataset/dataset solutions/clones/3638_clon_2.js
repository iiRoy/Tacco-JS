// Function to assess the validity of an input character stream.
function EvaluateSequence( dataStream )
{
    // Convert the entire data stream into an array of individual characters.
    const characterArray = dataStream.split( '' );

    // Initialize the validation verdict to "Accepted Correct" by default.
    let finalVerdict = 'AC';

    // Check the very first character; it must be 'A'.
    if ( characterArray[0] !== 'A' )
    {
        // If the initial character is not 'A', the sequence is "Wrong Answer".
        finalVerdict = 'WA';
    }

    // A flag to track if the character 'C' has been located.
    let cPresent = false;

    // Iterate through the characters, starting from the second one up to the end.
    for ( let currentPos = 1; currentPos < dataStream.length; currentPos++ )
    {
        // If the current character is 'C'...
        if ( characterArray[currentPos] === 'C' )
        {
            // 'C' is only allowed once, and not at the very beginning (index 1) or very end.
            if ( currentPos === 1 || currentPos === dataStream.length - 1 || cPresent )
            {
                // If 'C' appears at an invalid position or more than once, it's a "Wrong Answer".
                finalVerdict = 'WA';
            }
            else
            {
                // Mark that 'C' has been successfully found.
                cPresent = true;
            }
        }
        // For any other character besides 'C', if it's an uppercase letter...
        else if ( characterArray[currentPos].match( /[A-Z]/ ) )
        {
            // Any uppercase letter other than 'A' (at pos 0) or 'C' is invalid.
            finalVerdict = 'WA';
        }
    }

    // After scanning all characters, if 'C' was never found, the sequence is invalid.
    if ( cPresent === false )
    {
        finalVerdict = 'WA';
    }

    // Output the determined validity status.
    console.log( finalVerdict );
}

// This section handles reading standard input and invoking the analysis function.
EvaluateSequence( require("fs").readFileSync("/dev/stdin", "utf8") );