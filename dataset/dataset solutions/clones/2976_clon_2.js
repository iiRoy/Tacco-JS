"use strict"; // Enforce strict parsing and error handling for cleaner code.

/**
 * @class LineStreamProcessor
 * @description This class is designed to efficiently parse a multi-line string input,
 *              treating it as a stream of lines and individual tokens (segments) within those lines.
 *              It maintains internal pointers to the current line and token being processed.
 */
function LineStreamProcessor( sourceTextContent , initialValueParser ) {
    // Internal array holding each line of the input text, split by newline characters.
    this._lineSegments           = sourceTextContent.split( "\n" );

    // Index tracking the current segment (token) within the currently active line.
    this._currentSegmentIndex    = 0;

    // Index tracking the current line number being processed from the input.
    this._currentLineNumber      = 0;

    // The default function to apply for converting segment strings to desired data types,
    // defaulting to the standard Number constructor if none is explicitly provided.
    this._defaultSegmentParser   = initialValueParser || Number;
}

/**
 * @method getNextSegment
 * @description Extracts and returns the next available segment (token) from the input stream.
 *              It automatically advances the internal pointers to the next segment or line.
 * @param {Function} [specificParser] - An optional function to use for parsing the current segment.
 *                                      If not provided, the class's default parser is used.
 * @returns {*} The parsed value of the next segment, or undefined if the end of input is reached.
 */
LineStreamProcessor.prototype.getNextSegment = function( specificParser ) {
    // Retrieve the string content of the line currently being processed.
    let activeLine = this._lineSegments[ this._currentLineNumber ];

    // Only proceed if there is an active line to read from.
    if ( activeLine ) {
        // Clean the line (remove leading/trailing whitespace) and split it into an array of tokens based on spaces.
        const lineTokens = activeLine.trim().split( " " );

        // Get the specific token at the current segment index.
        const segmentValue = lineTokens[ this._currentSegmentIndex ];

        // Advance the segment index for the subsequent read operation.
        this._currentSegmentIndex++;

        // Check if all tokens on the current line have been consumed.
        if ( lineTokens.length === this._currentSegmentIndex ) {
            // If so, reset the segment index and move to the next line.
            this._currentSegmentIndex = 0;
            this._currentLineNumber++;
        }

        // Apply either the provided specific parser or the default parser to the segment value
        // and return the converted result.
        return specificParser ? specificParser( segmentValue ) : this._defaultSegmentParser( segmentValue );
    }

    // If no active line (end of input), return undefined.
    return undefined;
};


/**
 * @method readAllSegmentsInLine
 * @description Reads and processes all segments (tokens) from the current line,
 *              advancing to the next line after completion.
 * @param {Function} [segmentProcessor] - An optional function to apply to each segment in the line.
 *                                        If not provided, the class's default parser is used.
 * @returns {Array<*>} An array containing the processed values of all segments on the line,
 *                     or undefined if no active line.
 */
LineStreamProcessor.prototype.readAllSegmentsInLine = function( segmentProcessor ) {
    // Obtain the complete string content of the current line.
    let entireLineContent = this._lineSegments[ this._currentLineNumber ];

    // Process the line only if it exists.
    if ( entireLineContent ) {
        // Reset the segment index as a new line is being fully processed.
        this._currentSegmentIndex = 0;

        // Increment the line number to point to the next line for future operations.
        this._currentLineNumber++;

        // Split the entire line into segments and apply the provided processor (or default) to each.
        return entireLineContent.split( " " ).map( segmentProcessor || this._defaultSegmentParser );
    }

    // If there is no active line, return undefined.
    return undefined;
};

// Make the LineStreamProcessor class available for import in other modules.
module.exports = LineStreamProcessor;


/**
 * @function executeProcessingLogic
 * @description The primary function that orchestrates the data processing workflow.
 *              It initializes a parser, extracts specific values, and performs a calculation.
 * @param {string} inputStreamContent - The raw textual data read from the input source.
 */
function executeProcessingLogic( inputStreamContent ) {
    // Create an instance of the LineStreamProcessor to handle the input data.
    // The default Number parser will be used for token conversion.
    const dataStreamHandler = new LineStreamProcessor( inputStreamContent );

    // Retrieve the first numeric value from the input stream using the default parser.
    const firstNumericValue = dataStreamHandler.getNextSegment();

    // Retrieve the second numeric value from the input stream, immediately following the first.
    const secondNumericValue = dataStreamHandler.getNextSegment();

    // Perform a basic arithmetic operation on the extracted numbers and print the result.
    console.log( firstNumericValue - secondNumericValue + 1 );
}


// Execute the main processing logic by reading the entire content of standard input
// asynchronously as UTF-8 encoded text and passing it to the function.
executeProcessingLogic( require( "fs" ).readFileSync( "/dev/stdin", "utf8" ) );