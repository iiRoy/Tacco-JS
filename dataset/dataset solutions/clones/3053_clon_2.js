// Primary function for processing the character stream
function ProcessSequence( dataSource )
{
    // Convert the input string into an array of individual characters
    let charElements = dataSource.split( '' ) ;

    // Initialize a counter for detected segment alterations
    let segmentAlterations = 0 ;

    // Initialize a boolean flag to track the current alteration state within a sequence
    let currentAlterationState = false ;

    // Iterate through the character elements, starting from the second element
    for ( let charPosition = 1 ; charPosition < charElements.length ; charPosition++ )
    {
        // Check if the current character is identical to the previous one
        // AND if no alteration was previously detected in this sequence
        if ( charElements[charPosition] === charElements[charPosition-1] && !currentAlterationState )
        {
            // Mark an alteration as detected for the current sequence
            currentAlterationState = true ;
            // Increment the total count of alterations
            segmentAlterations++ ;
        }
        // Otherwise, if the current character is different from the previous one
        // AND an alteration was previously detected
        else if ( charElements[charPosition] !== charElements[charPosition-1] && currentAlterationState )
        {
            // Increment the total count of alterations (indicating another change in pattern)
            segmentAlterations++ ;
        }
        // If neither of the above conditions is met (e.g., same characters and alteration was already true,
        // or different characters but no alteration was true)
        else
        {
            // Reset the alteration state, meaning the current sequence is not actively tracking a change
            currentAlterationState = false ;
        }
    }

    // Output the final tally of segment alterations to the console
    console.log( segmentAlterations ) ;
}

// Invoke the main processing function with data read from standard input,
// ensuring the file content is interpreted as UTF-8 encoded text
ProcessSequence( require( "fs" ).readFileSync( "/dev/stdin" , "utf-8" ) ) ;