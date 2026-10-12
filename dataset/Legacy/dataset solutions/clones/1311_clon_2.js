( function ( rawData ) {
    // This variable will hold an array of strings, where each string is a line from the input.
    var linesArray = rawData.split( '\n' );

    // Iterate over each line in the processed input array.
    for ( var lineIndex = 0; lineIndex < linesArray.length; lineIndex++ ) {
        // Convert the current line (which is a string) into a numerical value.
        var currentNum = Number( linesArray[ lineIndex ] );

        // Check if the current number is zero, which acts as a termination signal.
        if ( currentNum === 0 ) {
            return; // If it's zero, exit the anonymous function.
        }

        // Perform the digit sum calculation and output the result.
        console.log(
            String( currentNum ) // Convert the number back to its string representation.
                .split( '' )     // Split the string into an array of individual character digits.
                .map( Number )   // Convert each character digit in the array back into a number.
                .reduce( function ( accumulator, currentDigit ) { // Sum all the numbers in the array.
                    return accumulator + currentDigit; // Add the current digit to the running total.
                } )
        );
    }
} )( require( 'fs' ).readFileSync( '/dev/stdin', 'utf8' ) ); // Immediately invoke the function with content read from standard input.
