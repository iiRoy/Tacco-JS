function ProcessInputData( rawData )
{
    // Split the raw input string into individual lines
    rawData = rawData.split( '\n' );

    // The first line indicates the number of subsequent data lines
    const numLinesToProcess = Number( rawData[0] );

    // This array will store character arrays, each sorted alphabetically
    let sortedCharArrays = [ ];

    // Loop through each data line from the second line onwards
    for ( let lineIndex = 1; lineIndex < numLinesToProcess + 1; lineIndex++ )
    {
        // Convert the current line string into an array of characters,
        // then sort these characters alphabetically and add to our collection
        sortedCharArrays.push( Array.from( rawData[lineIndex] ).sort( ) );
    }

    // This variable is declared but not used in the original logic,
    // kept for structural similarity as per cloning rules.
    const finalConcatenation = '';

    // The first sorted character array is designated as the initial reference set
    let currentCommonChars = sortedCharArrays.shift( );

    /**
     * Recursively finds the common characters (intersection) among multiple sorted character arrays.
     * It handles character frequencies by removing matched characters from the 'nextSet'.
     *
     * @param {string[]} currentSet - The current set of common characters found so far.
     * @param {string[][]} remainingSets - An array of character arrays yet to be processed.
     * @returns {string[]} An array containing characters common to all sets, respecting frequency.
     */
    function findIntersection( currentSet, remainingSets )
    {
        // Base case: If there are no more sets to compare, return the current common characters
        if ( remainingSets.length === 0 ) return currentSet;

        // Get the next character array from the list of remaining sets
        const nextSet = remainingSets.shift( );

        // This array will store characters that are common between 'currentSet' and 'nextSet'
        const intersectedElements = [ ];

        // Iterate through each character in the 'currentSet'
        for ( let idxCurrent = 0; idxCurrent < currentSet.length; idxCurrent++ )
        {
            // Iterate through each character in the 'nextSet'
            for ( let idxNext = 0; idxNext < nextSet.length; idxNext++ )
            {
                // If a matching character is found
                if ( currentSet[idxCurrent] === nextSet[idxNext] )
                {
                    // Add the common character to our intersection result
                    intersectedElements.push( currentSet[idxCurrent] );
                    // Remove the matched character from 'nextSet' to handle frequency correctly
                    nextSet.splice( idxNext, 1 );
                    // Break from the inner loop as this 'currentSet' character has been matched
                    break;
                }
            }
        }

        // Recursively call the function with the newly found common characters
        // and the rest of the unprocessed sets
        return findIntersection( intersectedElements, remainingSets );
    }

    // Initiate the process of finding the common characters across all sets
    const finalIntersection = findIntersection( currentCommonChars, sortedCharArrays );

    // Check if any common characters were found
    if ( finalIntersection.length === 0 )
    {
        // If no common characters, print an empty line
        console.log( "" );
    }
    else
    {
        // Otherwise, join the common characters into a single string and print it
        console.log( finalIntersection.join( "" ) );
    }
}

// Invoke the main processing function with input read from standard input
ProcessInputData( require( 'node:fs' ).readFileSync( '/dev/stdin', 'utf8' ) );