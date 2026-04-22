// Main module for processing input data streams.
// Provides methods to fetch various data formats from a text source.
var TEXT_READER_FACTORY = ( function ( ) {
    /**
     * Initializes a new stream handler for the given input string.
     * @param {string} inputString - The raw text content to be processed.
     * @returns {StreamHandler} A new StreamHandler instance.
     */
    function makeReader ( inputString ) {
        return new StreamHandler( inputString );
    }

    /**
     * @class StreamHandler
     * Handles the parsing and reading of lines from a text stream.
     */
    function StreamHandler ( inputString ) {
        // Store the input string, trimmed and split into individual lines.
        this._textLines = inputString.trim().split( "\n" );
        // Initialize the pointer to the current line being read.
        this._readPosition = 0;
    }

    /**
     * Reads a single token from the current line.
     * If the current line has not been processed into tokens, it will be split and reversed.
     * Advances the line pointer if the current line becomes empty after popping.
     * @param {boolean} isStringOutput - If true, returns the token as a string; otherwise, attempts to convert to a number.
     * @returns {string|number} The extracted token.
     */
    StreamHandler.prototype.getSingleValue = function ( isStringOutput ) {
        let sourceLines = this._textLines;
        let lineIdx = this._readPosition;
        let extractedValue;

        // Check if the current line is still a raw string and needs to be split.
        if ( typeof sourceLines[lineIdx] === "string" ) {
            sourceLines[lineIdx] = sourceLines[lineIdx].split( " " ).reverse( );
        }

        // Pop the last token from the (reversed) array of tokens.
        extractedValue = sourceLines[lineIdx].pop( );

        // If the current line is now empty, move to the next line.
        if ( !sourceLines[lineIdx].length ) {
            this._readPosition++;
        }

        // Return the value, either as a string or converted to a number.
        return isStringOutput ? extractedValue : +extractedValue;
    };

    /**
     * Reads and processes an entire line, splitting it into space-separated values.
     * Advances the line pointer.
     * @param {boolean} isStringOutput - If true, returns an array of strings; otherwise, an array of numbers.
     * @returns {Array<string|number>} An array of values from the line.
     */
    StreamHandler.prototype.getLineValues = function ( isStringOutput ) {
        // Get the current line, split it by spaces, and then advance the line pointer.
        const lineData = this._textLines[this._readPosition++].split( " " );

        // Return values as strings or converted to numbers.
        return isStringOutput ? lineData : lineData.map( val => +val );
    };

    /**
     * Reads multiple lines and processes each into an array of space-separated values.
     * Advances the line pointer by the number of lines read.
     * @param {number} lineCount - The number of lines to read.
     * @param {boolean} isStringOutput - If true, returns a 2D array of strings; otherwise, a 2D array of numbers.
     * @returns {Array<Array<string|number>>} A 2D array of values.
     */
    StreamHandler.prototype.getMultiLineValues = function ( lineCount, isStringOutput ) {
        // Extract the specified number of lines and split each by spaces.
        const processedResult = this._textLines.slice( this._readPosition, this._readPosition += lineCount ).map( val => val.split( " " ) );

        // Return values as strings or converted to numbers.
        return isStringOutput ? processedResult : processedResult.map( row => row.map( val => +val ) );
    };

    /**
     * Reads multiple lines as raw strings.
     * Advances the line pointer by the number of lines read.
     * @param {number} lineCount - The number of lines to read.
     * @param {boolean} isStringOutput - If true, returns an array of strings; otherwise, an array of numbers.
     * @returns {Array<string|number>} An array of raw line contents.
     */
    StreamHandler.prototype.getRawLines = function ( lineCount, isStringOutput ) {
        // Extract the specified number of raw lines.
        const processedResult = this._textLines.slice( this._readPosition, this._readPosition += lineCount );

        // Return values as strings or converted to numbers.
        return isStringOutput ? processedResult : processedResult.map( val => +val );
    };

    // The factory returns the function to create a new reader instance.
    return makeReader;
} ) ( );


// Initialize the data processor by reading content from standard input.
const dataProcessor = TEXT_READER_FACTORY( require( "fs" ).readFileSync( "/dev/stdin", "utf8" ) );


/**
 * Dynamically creates a multi-dimensional array with a specified fill value.
 * The dimensions are provided as additional arguments after the fill value.
 * Example: makeNestedArray(0, 2, 3) creates [[0,0,0],[0,0,0]]
 * @param {*} fillValue - The value to fill the array with.
 * @param {...number} dimensions - The dimensions of the array (e.g., dim1, dim2, dim3).
 * @returns {Array} The newly created multi-dimensional array.
 */
function makeNestedArray ( fillValue ) {
    let passedArguments = arguments;
    let dimensionIndex = passedArguments.length;
    // Start building the array creation string from the innermost dimension.
    let arrayDeclaration = "Array(passedArguments[" + --dimensionIndex + "]).fill(0).map(x=>{return " + fillValue + ";})";

    // Loop to build up the outer dimensions.
    while ( --dimensionIndex ) {
        arrayDeclaration = "Array(passedArguments[" + dimensionIndex + "]).fill(0).map(x=>" + arrayDeclaration + ")";
    }
    // Evaluate the generated string to create the array.
    return eval( arrayDeclaration );
}


// Execute the main logic and print the result to the console.
console.log( mainRoutine( ) );


/**
 * Contains the primary business logic of the program.
 * Reads input values and performs a specific comparison.
 * @returns {string} "Bad" if any two adjacent values are equal, "Good" otherwise.
 */
function mainRoutine ( ) {
    // Read a single string token from the input stream.
    const comparisonSet = dataProcessor.getSingleValue( true );

    // Check if any two adjacent characters in the input string are identical.
    return comparisonSet[0] === comparisonSet[1] ||
           comparisonSet[1] === comparisonSet[2] ||
           comparisonSet[2] === comparisonSet[3] ? "Bad" : "Good";
}