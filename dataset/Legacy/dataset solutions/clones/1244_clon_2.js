( function ( incomingData ) {
    // The input string is split by spaces and each part converted to a number.
    const parsedNumbers = incomingData.split( ' ' ).map( Number );

    // Assign the first and second numbers from the parsed array.
    const firstValue = parsedNumbers[ 0 ];
    const secondValue = parsedNumbers[ 1 ];

    // Calculate the integer part of the division.
    let quotientInteger = Math.floor( firstValue / secondValue );
    // Calculate the remainder of the division.
    let remainderValue = firstValue % secondValue;
    // Calculate the floating-point result of the division.
    let quotientFloat = firstValue / secondValue;

    // Print the three calculated values to the console, formatted as integers and a float.
    console.log( '%d %d %d', quotientInteger, remainderValue, quotientFloat );
} )( require( 'fs' ).readFileSync( '/dev/stdin', 'utf8' ) );
