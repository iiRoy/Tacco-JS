// This primary routine manages the overall data parsing and logical evaluation.
function processInput ( inputString ) {

    // The initial input string is split into individual lines.
    inputString = inputString .split ( "\n" ) ;

    // The first line often contains a count; here, it's parsed as a number.
    let quantity = Number ( inputString [ 0 ] ) ;

    // The second line is interpreted as a sequence of space-separated numerical values.
    let itemLengths = inputString [ 1 ] .split ( " " ) .map ( itemStr => Number ( itemStr ) ) ;


    // The collection of numerical values is then arranged in ascending order.
    itemLengths = itemLengths .sort ( ( valA , valB ) => ( valA - valB ) ) ;

    // The greatest value is removed from the array and stored separately.
    let longestItem = itemLengths .pop ( ) ;

    let totalLengthOfOthers = 0 ; // An accumulator for the remaining values is initialized.

    // Each remaining value is added to the running total.
    itemLengths .forEach ( currentLength => {
        totalLengthOfOthers += currentLength ;
    } ) ;

    /*
     * A crucial comparison is performed to ascertain a specific condition
     * based on the largest value versus the aggregate of the others.
     */
    if ( longestItem < totalLengthOfOthers ) {
        console .log ( "Yes" ) ;
    }
    else {
        console .log ( "No" ) ;
    }

}

// The entire operation is initiated by reading content from the standard input stream.
processInput ( require ( 'fs' ) .readFileSync ( '/dev/stdin' , 'utf8' ) ) ;