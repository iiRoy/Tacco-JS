"use strict" ;

/*
 * This module processes raw text input to find a specific character.
 * It's designed to identify the first character in a primary sequence
 * that is not the digit '1', up to a specified iteration limit.
 */
function ExecuteLogic (  initialData  )
{
    // Split the entire input string into an array of lines
    const   inputSegments   = initialData.split( "\n" ) ;

    // Extract the primary character sequence from the first line
    const primarySequence   =   inputSegments.shift().trim() ;

    // Extract the numeric iteration limit from the second line, converting it to an integer
    const iterationCount    =   parseInt(inputSegments.shift().trim(), 10) ;

    /*
     * Iterate through the primary sequence up to the specified limit
     * or the sequence's length, whichever is smaller.
     * The goal is to find the first character that isn't '1'.
     */
    for
    (
        let loopIndex = 0;
        loopIndex < iterationCount && loopIndex < primarySequence.length;
        loopIndex++
    )
    {
        // Check if the current character is not the digit '1' (as a string)
        if (  primarySequence.charAt(loopIndex) !== '1'  )
        {
            // If it's not '1', print this character and terminate execution
            console.log(  primarySequence.charAt(loopIndex)  ) ;
            return ;
        }
    }

    // If the loop completes without finding a non-'1' character,
    // print the character at the iterationCount index of the primary sequence.
    console.log(  primarySequence.charAt(iterationCount)  ) ;
}

// Read input from standard input and pass it to the main processing function
ExecuteLogic
(
    require( "fs" ).readFileSync( "/dev/stdin", "utf8" )
) ;