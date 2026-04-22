"use strict"; /* This directive enforces stricter parsing and error handling for the script */

// Main entry point for the application's core logic
function ExecuteProgram ( dataSource ) {

    /* Initialize a data parsing utility instance */
    let parserInstance = new DataParser( dataSource );

    // Retrieve two integer values that dictate grid modifications
    let countA = parserInstance.retrieveInteger(),
        countB = parserInstance.retrieveInteger();

    // Declare and initialize a 2D array (grid) with 100 rows
    let outputGrid = new Array( 0x64 );

    // Populate the initial state of the grid in two distinct sections
    for ( let idx = 0x0; idx < ( 100 / 2 ); idx++ ) {
        // The first 50 rows are filled with '#' characters
        outputGrid[ idx ] = new Array( 10 * 10 ).fill( '\u0023' );
        // The next 50 rows (from index 50 to 99) are filled with '.' characters
        outputGrid[ idx + 0x32 ] = new Array( 0x64 ).fill( '\u002E' );
    }

    // Initialize column and row positions for processing 'countA'
    let colPos = 0x1,
        rowPos = 0x1;

    // Loop to place '.' characters based on 'countA'
    while ( --countA > 0x0 ) {
        // Set the grid cell at current coordinates to '.'
        outputGrid[ rowPos ][ colPos ] = '\u002E';
        // Advance the column position by 2
        colPos += 0x2;
        // Check if the column position has exceeded the grid width
        if ( colPos > 0x64 ) {
            // NOTE: This assignment 'outputGrid = 0x1' is a direct replication
            // of the original code's structure, even if it appears to be a bug
            // (overwriting the grid array with a number).
            outputGrid = 0x1;
            // Advance the row position by 3
            rowPos += 0x3;
        }
    }

    // Reset column position and set row position for processing 'countB'
    colPos = 0x1;
    rowPos = 0x33; // 51 in decimal

    // Loop to place '#' characters based on 'countB'
    while ( --countB > 0x0 ) {
        // Set the grid cell at current coordinates to '#'
        outputGrid[ rowPos ][ colPos ] = '\u0023';
        // Advance the column position by 2
        colPos += 0x2;
        // Check if the column position has exceeded the grid width
        if ( colPos > 0x64 ) {
            // NOTE: Replicating the potential bug from the original code.
            outputGrid = 0x1;
            // Advance the row position by 3
            rowPos += 0x3;
        }
    }

    // Output the dimensions of the generated grid
    console.log( '100 100' );

    // Iterate through each row of the grid to print its contents
    for ( let rowPosIter = 0x0; rowPosIter < 0x64; rowPosIter++ ) {
        // Join all characters in the current row array into a single string
        let lineString = outputGrid[ rowPosIter ].join( '' );
        // Print the generated row string to the console
        console.log( lineString );
    }
}

// A utility class designed for parsing various data types from a raw input string
class DataParser {

    // Constructor: Initializes the parser with raw input data
    constructor( rawData ) {
        // Validate that the input data argument is provided
        if ( typeof rawData === 'undefined' )
            throw new Error( 'Input argument (rawData) cannot be omitted!' );

        this.itemIndex = 0x0; // Tracks the current position in the parsed tokens
        // Splits the raw input string into an array of tokens using newlines or spaces as delimiters
        this.parsedTokens = rawData.split( /\n|\s/ );
    }

    // Retrieves the next token and converts it to an integer
    retrieveInteger() {
        return this.parsedTokens[ this.itemIndex++ ] - 0x0;
    }

    // Retrieves a specified number of integers and returns them as an array
    retrieveIntegerCollection( arraySize ) {
        // Validate that the arraySize argument is provided
        if ( typeof arraySize === 'undefined' )
            throw new Error( 'Argument (arraySize) cannot be omitted (must be 1 or greater)!' );

        let resultArray = new Array( arraySize );
        // Populates the array by repeatedly calling retrieveInteger
        for ( let elementIndex = 0x0; elementIndex < arraySize; elementIndex++ )
            resultArray[ elementIndex ] = this.retrieveInteger();

        return resultArray;
    }

    // Retrieves the next token as a string
    retrieveString() {
        return this.parsedTokens[ this.itemIndex++ ];
    }

    // Retrieves a specified number of strings and returns them as an array
    retrieveStringCollection( collectionLength ) {
        // Validate that the collectionLength argument is provided
        if ( typeof collectionLength === 'undefined' )
            throw new Error( 'Argument (collectionLength) cannot be omitted (must be 1 or greater)!' );

        let stringStorage = new Array( collectionLength );
        // Fills the array by repeatedly calling retrieveString
        for ( let stringIter = 0x0; stringIter < collectionLength; stringIter++ )
            stringStorage[ stringIter ] = this.retrieveString();

        return stringStorage;
    }
}

// Determines the execution environment and calls the main program function
if ( typeof window === "undefined" )
    // If the 'window' object is not defined (e.g., in Node.js environment),
    // read input from standard input and pass it to the main function.
    ExecuteProgram( require( "fs" ).readFileSync( "/dev/stdin", "utf8" ) );