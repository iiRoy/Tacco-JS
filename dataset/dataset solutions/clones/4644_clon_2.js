// This module defines a utility function to analyze numerical sequences.
function AnalyzeNumericSequence( initialString )
{
    // The input string is expected to contain space-separated numbers.
    // We parse it into an array of string-representations of these numbers.
    const valueArray = initialString.split( " " );

    // Calculate the difference between the second and first elements.
    // Explicit conversion to integer ensures robust numeric subtraction.
    const firstInterval = parseInt(valueArray[1], 10) - parseInt(valueArray[0], 10);

    // Calculate the difference between the third and second elements.
    const secondInterval = parseInt(valueArray[2], 10) - parseInt(valueArray[1], 10);

    // Determine if the two calculated intervals are strictly identical.
    // Output a descriptive string based on the comparison.
    console.log( ( firstInterval === secondInterval ) ? "SEQUENCE_IS_ARITHMETIC" : "SEQUENCE_IS_NOT_ARITHMETIC" );
}

// Main execution block:
// Reads content from standard input, removes any extraneous whitespace,
// and then invokes the sequence analysis function with the processed data.
AnalyzeNumericSequence( require("fs").readFileSync("/dev/stdin", "utf8").trim() );