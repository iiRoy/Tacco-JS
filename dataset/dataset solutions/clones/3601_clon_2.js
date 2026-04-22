'use strict'; // Enforces stricter parsing and error handling in the code.

/*
 * This primary routine orchestrates the processing of incoming data.
 * It expects a string containing two numerical values separated by a space,
 * performs a specific arithmetic calculation, and then outputs the result.
 * The core logic computes the product of (first_value - 1) and (second_value - 1).
 */
function ProcessInputAndCalculate( dataString ) {
    // Divide the input string into individual string components based on the space delimiter.
    // Subsequently, transform each string component into its numerical representation.
    const numericCollection = dataString
        .split( ' ' ) // Splits the input text into an array of string numbers.
        .map( ( stringElement ) => {
            // Converts each string element into a true JavaScript number.
            return Number( stringElement );
        } );

    // Execute the core arithmetic operation: (first number - 1) multiplied by (second number - 1).
    // This effectively calculates the area of a grid with dimensions one less than the input values.
    const computedOutcome = ( numericCollection[0] - 1 ) * ( numericCollection[1] - 1 );

    // Display the final calculated numerical outcome to the standard output stream.
    console.log( computedOutcome );
}

// Initiate the application by reading data from the standard input.
// The file system module is utilized to synchronously read the content of /dev/stdin
// as a UTF-8 encoded string, which is then passed to our processing function.
ProcessInputAndCalculate( require( 'fs' ) . readFileSync( '/dev/stdin', 'utf8' ) );