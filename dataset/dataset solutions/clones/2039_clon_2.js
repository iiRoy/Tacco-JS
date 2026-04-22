// This function processes all the provided input text.
function ProcessData(rawData)
{
    // The raw data is first split into an array of individual lines.
    let lineArray = rawData.split('\n') ;

    // Each line is then further split by spaces, creating a grid of values.
    const tokenMatrix = lineArray.map( ( currentLine ) => currentLine.split(' ') ) ;

    // Extract the first numeric quantity from the top-left position.
    const firstCount = parseInt( tokenMatrix[0][0], 10 ) ;

    // Extract the second numeric quantity from the top-right position.
    const secondCount = parseInt( tokenMatrix[0][1], 10 ) ;

    // Helper function to determine the number of unique pairs from a given quantity.
    const calculateCombinations = ( givenValue ) => {
        if ( givenValue < 2 ) {
            return 0 ; // Less than 2 items means no pairs can be formed.
        } else if ( givenValue === 2 ) {
            return 1 ; // Exactly 2 items form 1 pair.
        } else {
            // For more than 2 items, use the combination formula n * (n - 1) / 2.
            return ( givenValue * ( givenValue - 1 ) ) / 2 ;
        }
    };

    // Display the sum of calculated pairs for both extracted quantities.
    console.log( calculateCombinations( firstCount ) + calculateCombinations( secondCount ) ) ;
}

// The following section handles reading from standard input and invoking the main processing function.
// It should not be altered in any way for the program to function correctly in the environment.
ProcessData( require('fs').readFileSync('/dev/stdin', 'utf8') ) ;