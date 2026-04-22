"use strict";

/*
 * This module provides a utility for reading structured input.
 * It encapsulates the process of fetching lines from standard input
 * and parsing them into various data types.
 */
const buildReader = ( ) => {
    // Acquire the 'fs' (file system) module to read from standard input.
    // The input is read as a UTF-8 string, trimmed of whitespace, and then
    // split into an array of individual lines based on the newline character.
    const rawData = require("fs") . readFileSync( "/dev/stdin", "utf8" ) . trim() . split( "\n" ) ;

    // An object designed to manage the input data and its current reading position.
    const inputProcessor = {
        "dataLines": rawData,                          // The complete array of input lines.
        "currentPosition": 0,                           // The zero-based index of the next line to be read.
        "totalLines": rawData.length,                 // The total count of lines available in the input.

        /**
         * Determines if there are any remaining lines to be processed.
         * @returns {boolean} Returns 'true' if the 'currentPosition' is less than 'totalLines',
         *                    indicating more input is available; otherwise, returns 'false'.
         */
        "canAdvance": function ( ) {
            return this.currentPosition < this.totalLines;
        },

        /**
         * Retrieves the subsequent line from the input sequence.
         * Increments the 'currentPosition' after fetching the line.
         * @returns {string} The next line of text from the input.
         * @throws {Error} Throws an 'InputBufferExhaustedException' if no more lines can be read.
         */
        "retrieveNext": function ( ) {
            if ( ! this.canAdvance( ) ) {
                throw new Error("InputBufferExhaustedException");
            } else {
                return this.dataLines[ this.currentPosition++ ];
            }
        }
    };
    return inputProcessor;
};

// Initialize a singular instance of the input handling mechanism.
const dataHandler = buildReader();

// A convenience function to simply obtain the next raw line of input.
const fetchLine = ( ) => dataHandler.retrieveNext( );

// A convenience function to parse and return the next line as an integer.
// Specifies radix 10 for robust parsing.
const readInt = ( ) => parseInt( dataHandler.retrieveNext( ) , 10 );

// A convenience function to split the next input line by spaces into an array of strings.
const readStringTokens = ( ) => dataHandler.retrieveNext( ) . split( " " );

// A convenience function to split the next input line by spaces and convert each part to an integer.
const readIntTokens = ( ) => dataHandler.retrieveNext( ) . split( " " ) . map( token => parseInt( token , 10 ) );

// A convenience function to convert the next input line into an array of individual characters.
const readChars = ( ) => dataHandler.retrieveNext( ) . split( "" );

// A convenience function to check if there's more input available for processing.
const hasMoreLines = ( ) => dataHandler.canAdvance( );

// A custom function to output results to the console, acting as a wrapper for console.log.
const displayResult = ( ...args ) => console.log( ...args );

/*
 * This function encapsulates the main computational logic of the program.
 * It reads specific input values, performs a calculation, and displays the outcome.
 */
const PrimaryLogic = ( ) => {
    // Destructure the first line of input into two integer variables, 'valA' and 'valB'.
    const [ valA, valB ] = readIntTokens( );

    // Execute a predefined mathematical operation using 'valA' and 'valB'.
    // The result is then outputted using the 'displayResult' utility.
    displayResult( ( 1900 * valB + 100 * ( valA - valB ) ) * Math.pow( 2 , valB ) );
};

// Initiate the execution of the program's primary logic.
PrimaryLogic( );