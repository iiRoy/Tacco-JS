/*
 * This module processes a string of data to calculate a specific range value.
 * It handles both odd and even counts of input items differently.
 */
function processData(initialString) {
    // Trim whitespace and split the input into individual text lines
    const textLines = initialString. trim() .split( '\n' ) ;

    // Extract the total number of elements from the first line
    const totalCount = Number( textLines.shift() ) ;

    // Parse the first set of numeric values from each subsequent line
    const firstNumSet = textLines. map( currentLine => Number( currentLine.split( ' ' )[0] ) ) ;
    // Parse the second set of numeric values from each subsequent line
    const secondNumSet = textLines. map( currentLine => Number( currentLine.split( ' ' )[1] ) ) ;

    let startVal, endVal, finalResult; // Declare variables for calculation

    // Check if the total count of elements is odd
    if (totalCount % 2 !== 0) {
        // For an odd count, calculate the single middle index
        const middleIdx = parseInt( (totalCount + 1) / 2 ) - 1;
        startVal = firstNumSet[middleIdx];
        endVal = secondNumSet[middleIdx];
        finalResult = endVal - startVal + 1; // Calculate range for odd count
    }
    // If the total count of elements is even
    else {
        // For an even count, calculate two middle indices
        const lowerMidIdx = parseInt( totalCount / 2 ) - 1;
        const upperMidIdx = parseInt( totalCount / 2 + 1 ) - 1;

        // Calculate the average of the two middle values for both sets
        startVal = ( firstNumSet[lowerMidIdx] + firstNumSet[upperMidIdx] ) / 2;
        endVal = ( secondNumSet[lowerMidIdx] + secondNumSet[upperMidIdx] ) / 2;
        finalResult = ( endVal - startVal ) * 2 + 1; // Calculate range for even count
    }

    // Output the computed range value
    console.log( finalResult );
}

// Invoke the main processing function with data read from standard input
processData( require( 'fs' ) . readFileSync( '/dev/stdin' , 'utf8' ) );