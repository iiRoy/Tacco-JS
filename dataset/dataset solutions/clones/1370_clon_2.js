/*
 * This self-executing function serves as the primary entry point for data processing.
 * It is designed to ingest a stream of text, parse it line by line,
 * and perform a specific numerical operation on each valid entry.
 * The execution flow is designed to terminate upon encountering a specific sentinel value.
 */
( function ( dataStream ) {
    // The incoming data stream, which is a single string, is first segmented
    // into an array of strings, where each element corresponds to a line
    // separated by the newline character.
    const lineSegments = dataStream.split('\n');

    /*
     * A control loop is initiated to iterate through each of the extracted line segments.
     * This loop ensures that every line of input data is processed sequentially
     * until an explicit termination condition is met or all segments are exhausted.
     */
    for ( let idx = 0; idx < lineSegments.length; idx++ ) {
        // Each line segment, initially a string, is converted into an integer.
        // The radix (base 10) is explicitly provided for robust parsing.
        const currentValue = parseInt(lineSegments[idx], 10);

        // A conditional check is performed to detect a specific termination value.
        // If the parsed numerical value is exactly zero, the processing should halt.
        if ( currentValue === 0 )
        {
            return; // Exits the anonymous function, effectively stopping the program's logic.
        }

        // For all non-zero numerical values, the sum of their constituent digits is calculated.
        // The result of this calculation is then printed to the standard output.
        console.log(
            currentValue // Start with the numerical value.
                .toString() // Convert the number into its string representation.
                .split('') // Break the string into an array of individual character digits.
                .map(Number) // Transform each character digit back into a numerical digit.
                .reduce( function ( accumulator, currentDigit ) {
                    // Sum all the individual numerical digits.
                    return accumulator + currentDigit;
                })
        );
    }
}
)(
    // This section defines the source of the input data for the self-executing function.
    // It utilizes Node.js's file system module to read data from the standard input stream.
    require('node:fs').readFileSync(
        '/dev/stdin', // Specifies the standard input file path.
        { encoding: 'utf8' } // Ensures the data is interpreted as UTF-8 encoded text.
    )
);