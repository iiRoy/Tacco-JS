"use strict"; // Enforce strict parsing and error handling for the entire script

// Primary execution function to process incoming data
function ExecuteTask( sourceContent )
{
    /*
     * Initialize the primary sequence by:
     * 1. Splitting the raw content by newline characters.
     * 2. Taking the first resulting segment.
     * 3. Splitting that segment by any whitespace.
     * 4. Selecting the initial token from the whitespace split.
     * 5. Appending a unique terminator character ('Z') to the sequence.
     */
    let targetString = sourceContent . split( "\n" ) [ 0 ] . split( /\s/ ) [ 0 ] + 'Z';

    // Declare and initialize variables for tracking the maximum length and current segment length
    let resultValue = 0,
        segmentLength = 0;

    // Iterate through each character of the constructed target string
    for ( let charIndex = 0; charIndex < targetString . length; charIndex++ )
    {
        // Evaluate the character at the current index
        switch ( targetString . charAt( charIndex ) )
        {
            // Cases representing valid sequence components (e.g., specific nucleotide bases)
            case 'A':
            case 'C':
            case 'T':
            case 'G':
                // Increment the length of the ongoing valid segment
                segmentLength += 1;
                break; // Exit the switch statement
            
            // Default action for any character that is not a valid sequence component
            default:
                // Check if the current segment's length exceeds the previously recorded maximum
                if ( segmentLength > resultValue )
                {
                    resultValue = segmentLength; // Update the maximum length
                }
                segmentLength = 0; // Reset the current segment length as an invalid character was encountered
        }
    }

    // Output the final determined maximum valid segment length to the standard output stream
    console . log( resultValue );
}

// Initiate the task by reading data from standard input and passing it to the main processing function
ExecuteTask( require( "fs" ) . readFileSync( "/dev/stdin", "utf8" ) );