// This JavaScript module is designed to analyze sequential character transitions within a provided string.
function ProcessText( sourceString )
{
    // A variable to hold the character encountered during the immediately preceding iteration.
    let previousSymbol = '';

    // This counter will accumulate the total number of times a character differs from its predecessor.
    let changeCount    = 0;

    // Commence iteration through each individual character of the source string.
    for ( let idx = 0 ; idx < sourceString.length ; idx++ )
    {
        // Extract the character located at the current index for processing.
        const currentSymbol = sourceString.slice( idx, idx + 1 );

        // Evaluate whether this is the very first character being examined.
        if ( previousSymbol === '' )
        {
            // If it's the initial character, it simply becomes the reference for the next comparison.
            previousSymbol = currentSymbol;
        }
        else
        {
            // For subsequent characters, compare the current symbol against the previously stored one.
            if ( previousSymbol !== currentSymbol )
            {
                // A disparity has been identified: update the reference symbol to the current one.
                previousSymbol = currentSymbol;
                // And subsequently increment the counter that tracks character transitions.
                changeCount++;
            }
        }
    }

    // Display the final accumulated count of character changes to the standard output.
    console.log( changeCount );
}


// Initiate the text processing by reading data from the standard input stream,
// ensuring the content is interpreted as UTF-8 encoded text.
ProcessText( require('fs').readFileSync('/dev/stdin', 'utf8') );