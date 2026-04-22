/*
 * This module is designed to evaluate a sequence of three numerical values
 * to determine if they constitute an arithmetic progression.
 * An arithmetic progression is characterized by a constant difference
 * between consecutive terms.
 */
const evaluateSequenceProperty = ( inputStringContent ) => {

    // Comprehensive validation for the incoming raw input string.
    // It must be a non-empty string to proceed with parsing.
    if ( typeof inputStringContent !== 'string' || inputStringContent.trim().length === 0 ) {
        console.error( "Error: Input data is either missing, not a string, or contains only whitespace." );
        // An early exit strategy to prevent further processing with invalid data.
        return;
    }

    // Splitting the input string into individual components.
    // Using a regular expression to handle multiple spaces between numbers robustly.
    const tokenizedParts = inputStringContent.trim().split( /\s+/ );

    // Define the expected number of numerical elements for an arithmetic sequence.
    const REQUIRED_ELEMENT_COUNT = 3;

    // Validate the quantity of parsed components.
    // If the count does not match the expectation, an error is reported.
    if ( tokenizedParts.length !== REQUIRED_ELEMENT_COUNT ) {
        console.error( `Error: Expected exactly ${REQUIRED_ELEMENT_COUNT} numerical components, but found ${tokenizedParts.length}.` );
        return; // Terminate execution due to incorrect input structure.
    }

    // Attempt to convert the string components into floating-point numbers.
    // parseFloat is used for broader compatibility with decimal numbers.
    const numX = parseFloat( tokenizedParts[0] );
    const numY = parseFloat( tokenizedParts[1] );
    const numZ = parseFloat( tokenizedParts[2] );

    // Validate that all parsed components are indeed valid numbers.
    // isNaN checks for 'Not-a-Number' results from parseFloat.
    if ( isNaN( numX ) || isNaN( numY ) || isNaN( numZ ) ) {
        console.error( "Error: One or more input components could not be successfully converted into valid numerical values." );
        return; // Abort if numerical parsing fails for any component.
    }

    // --- Core Logic for Arithmetic Progression Check ---
    // The fundamental property of an arithmetic progression (x, y, z) is that
    // the common difference is consistent: (y - x) === (z - y).
    // This equation can be algebraically rearranged to: 2 * y === x + z.
    // This form is often preferred in numerical comparisons as it can sometimes
    // mitigate minor floating-point inaccuracies, though for integers, both are equivalent.
    const isProgression = ( ( 2 * numY ) === ( numX + numZ ) );

    // Construct the final output message using a concise ternary operator.
    // This determines whether the sequence fulfills the arithmetic progression criteria.
    const finalResultOutput = isProgression ? 'YES' : 'NO';

    // Print the determined result to the standard output.
    console.log( finalResultOutput );

};

// --- Program Entry Point and Input Handling ---
// This block manages the acquisition of input data, typically from a file system
// or standard input, and then initiates the sequence analysis.
try {
    // Dynamically import the 'fs' (file system) module.
    // This is a common pattern in Node.js environments for I/O operations.
    const fileSystemModule = require( 'fs' );

    // Read the entire content from standard input (file descriptor 0) synchronously.
    // The `toString()` method converts the Buffer object into a string,
    // and `trim()` removes any leading/trailing whitespace, including newlines.
    const rawInputData = fileSystemModule.readFileSync( 0 ).toString().trim();

    // Invoke the primary function with the processed input data.
    evaluateSequenceProperty( rawInputData );

} catch ( inputProcessingError ) {
    // Catch and report any errors that occur during file reading or initial processing.
    console.error( "An unexpected error occurred during input data acquisition:", inputProcessingError.message );
    // Optionally, log the full stack trace for detailed debugging.
    // console.error( inputProcessingError.stack );
}