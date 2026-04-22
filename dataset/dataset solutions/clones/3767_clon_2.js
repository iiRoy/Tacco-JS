const LINE_BREAK_CHAR = "\n";
const WHITESPACE_DELIMITER = " ";
const EMPTY_TEXT_SEGMENT = ""; // A constant for an empty string, not used in this specific logic but kept for consistency.

/*
 * Primary function to process an input string and compute a specific arithmetic result.
 * This routine expects a string containing two space-separated integers on a single line.
 *
 * @param {string} rawInputString - The complete input data as a single string.
 * @returns {number} The calculated numerical result based on the input integers.
 */
function ComputeSequenceSum( rawInputString )
{
    // Normalize and tokenize the input string.
    // First, remove leading/trailing whitespace, then split the string by line breaks.
    // Each resulting line is subsequently split by spaces, and all generated arrays
    // are then flattened into a single, comprehensive list of tokens.
    let inputTokenArray = [].concat(
        ...rawInputString
            .trim()
            .split( LINE_BREAK_CHAR )
            .map( singleLine => singleLine.split( WHITESPACE_DELIMITER ) )
    );

    // Helper function designed to extract the next token from the `inputTokenArray` as a string.
    const retrieveNextString = () => inputTokenArray.shift();

    // Helper function to extract the next token and convert its value to an integer,
    // using base 10 for parsing.
    const retrieveNextInteger = () => parseInt( retrieveNextString(), 10 );

    // Retrieve the two primary numerical values required for the calculation
    // from the beginning of the token list.
    let valueOne = retrieveNextInteger();
    let valueTwo = retrieveNextInteger();

    // Calculate the numerical difference between the second and first values.
    // This represents the length or span of the sequence.
    let numericDifference = valueTwo - valueOne;

    // Perform the final calculation based on the derived difference and the second value.
    // The formula effectively computes the sum of integers from 1 up to 'numericDifference' (inclusive),
    // and then subtracts the 'valueTwo' from this sum. This corresponds to a specific series problem.
    return ( numericDifference * ( numericDifference + 1 ) / 2 ) - valueTwo;
}

// If your primary interest lies solely in the core algorithmic logic above,
// you may safely disregard the subsequent code block, which handles environment-specific
// execution and result display mechanisms.

const STANDARD_INPUT_PATH_IDENTIFIER = "/dev/stdin";
const UTF8_ENCODING_SPECIFIER = "utf8";
const DEFAULT_COLUMN_WIDTH = 40; // Standard width for text area displays.

/*
 * This self-executing anonymous function is responsible for detecting the current
 * execution environment (Node.js or browser) and orchestrating the input processing
 * and output display accordingly. It is not an integral part of the core calculation.
 */
( function( testInputDataContent, calculationOutcome, outcomeDataType ) {
    // Determine if the code is running within a Node.js environment by checking
    // for the global 'require' function.
    if ( typeof require !== "undefined" )
    {
        // In a Node.js context:
        // Read the input data directly from the standard input stream (stdin),
        // using UTF-8 encoding. Then, pass this data to the main calculation function
        // and print the resulting outcome to the console.
        console.log( ComputeSequenceSum( require("fs").readFileSync( STANDARD_INPUT_PATH_IDENTIFIER, UTF8_ENCODING_SPECIFIER ) ) );
    }
    else
    {
        // In a browser environment or other non-Node.js context:
        // First, clean up the embedded test data string by splitting it into lines,
        // removing the initial and final (empty) lines, and then rejoining it.
        testInputDataContent = testInputDataContent.split( LINE_BREAK_CHAR ).slice( 1, -1 ).join( LINE_BREAK_CHAR );

        // Execute the main calculation function using the prepared test data.
        // A try-catch block is employed to gracefully capture and report any errors
        // that might occur during the processing.
        calculationOutcome = ( function() {
            try {
                return ComputeSequenceSum( testInputDataContent );
            }
            catch ( processingErrorObject ) {
                // If an error is caught, return its stack trace or message for debugging.
                return processingErrorObject.stack || processingErrorObject.message;
            }
        } )();

        // Ascertain the JavaScript data type of the computed outcome.
        outcomeDataType = typeof calculationOutcome;

        // If the calculation outcome is not already a string, convert it into a
        // JSON string representation for consistent display.
        if ( "string" !== outcomeDataType )
        {
            calculationOutcome = JSON.stringify( calculationOutcome );
        }

        // Utilizing jQuery (assuming '$' is globally available), dynamically
        // construct and append HTML elements to the document's body to display
        // the input data, its type, and the final calculation result.
        $( "<form>" )
            .append(
                [
                    [ 10, testInputDataContent ], // Configuration for displaying the initial input data (10 rows).
                    0,                            // A zero serves as a placeholder to insert a line break.
                    [ 1, outcomeDataType ],       // Configuration for displaying the result's data type (1 row).
                    0,                            // Another line break placeholder.
                    [ 10, calculationOutcome ]    // Configuration for displaying the final calculated outcome (10 rows).
                ].map( function( displayItemConfiguration ) {
                    // For each configuration item, create either a <textarea> or a <br> element.
                    return $(
                        displayItemConfiguration ? "<textarea>" : "<br>", // Conditional element generation.
                        displayItemConfiguration && {
                            rows: displayItemConfiguration[0],  // Set the visible number of text rows.
                            cols: DEFAULT_COLUMN_WIDTH,         // Establish a fixed column width.
                            text: displayItemConfiguration[1]   // Assign the textual content to display.
                        }
                    );
                } )
            )
            .appendTo( "body" ); // Attach the newly created form and its contents to the HTML document's body.
    }
} ) (
    `
54 65
`
);