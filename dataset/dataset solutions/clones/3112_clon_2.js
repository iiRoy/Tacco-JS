/* This module provides utilities for parsing input data. */
var DATA_RETRIEVER = ( function ( ) {

    /**
     * Factory function to create a new LineProcessor instance.
     * @param {string} rawData - The raw string input to be processed.
     * @returns {LineProcessor} An instance of the LineProcessor.
     */
    function initializeReader ( rawData ) {
        return new LineProcessor( rawData ) ;
    }

    /**
     * Constructor for processing input data line by line.
     * @param {string} initialString - The complete input string.
     */
    function LineProcessor ( initialString ) {
        /* Store processed lines, trimming whitespace and splitting by newline. */
        this._dataRows = initialString . trim ( ) . split ( "\n" ) ;
        /* Initialize the current reading position to the first line. */
        this._readPosition = 0 ;
    }

    /**
     * Extracts a single token from the current line.
     * If the line is a string, it's split and reversed before popping.
     * Advances the internal line pointer if the current line becomes empty.
     * @param {boolean} keepOriginalType - If true, returns the token as a string; otherwise, converts to a number.
     * @returns {string|number} The extracted token.
     */
    LineProcessor . prototype . extractValue = function ( keepOriginalType ) {
        var currentRows = this._dataRows ,
            currentPos = this._readPosition ,
            extractedItem ;

        // If the current line hasn't been processed into an array of tokens yet,
        // split it by space and reverse the order for easier popping from the end.
        if ( typeof currentRows [ currentPos ] === "string" ) {
            currentRows [ currentPos ] = currentRows [ currentPos ] . split ( " " ) . reverse ( ) ;
        }

        // Pop the last token from the current line's array.
        extractedItem = currentRows [ currentPos ] . pop ( ) ;

        // If the current line is now empty after popping, advance to the next line.
        if ( ! currentRows [ currentPos ] . length ) {
            this._readPosition ++ ;
        }

        // Return the item as a string or a number based on the flag.
        return keepOriginalType ? extractedItem : + extractedItem ;
    } ;

    /**
     * Reads and processes an entire line, splitting it into elements.
     * Advances the internal line pointer.
     * @param {boolean} keepOriginalType - If true, returns elements as strings; otherwise, converts to numbers.
     * @returns {Array<string|number>} An array of elements from the line.
     */
    LineProcessor . prototype . getLineElements = function ( keepOriginalType ) {
        /* Retrieve the current line and advance the pointer. */
        var lineContent = this._dataRows [ this._readPosition ++ ] . split ( " " ) ;

        /* Return elements as strings or mapped to numbers. */
        return keepOriginalType ? lineContent : lineContent . map ( item => + item ) ;
    } ;

    /**
     * Reads a specified number of lines, splitting each into elements, forming a matrix.
     * Advances the internal line pointer by the number of lines read.
     * @param {number} lineCount - The number of lines to read.
     * @param {boolean} keepOriginalType - If true, returns elements as strings; otherwise, converts to numbers.
     * @returns {Array<Array<string|number>>} A 2D array (matrix) of elements.
     */
    LineProcessor . prototype . getMultiLineData = function ( lineCount , keepOriginalType ) {
        /* Slice the required number of lines and map each to an array of string elements. */
        var collectedData = this._dataRows . slice ( this._readPosition , this._readPosition += lineCount ) . map ( rowEntry => rowEntry . split ( " " ) ) ;

        /* Return the matrix, with inner elements optionally converted to numbers. */
        return keepOriginalType ? collectedData : collectedData . map ( row => row . map ( element => + element ) ) ;
    } ;

    /**
     * Reads a specified number of raw lines without splitting them into elements.
     * Advances the internal line pointer by the number of lines read.
     * @param {number} lineCount - The number of raw lines to read.
     * @param {boolean} keepOriginalType - If true, returns lines as strings; otherwise, converts to numbers.
     * @returns {Array<string|number>} An array of raw lines.
     */
    LineProcessor . prototype . getRawLines = function ( lineCount , keepOriginalType ) {
        /* Slice the required number of raw lines. */
        var retrievedLines = this._dataRows . slice ( this._readPosition , this._readPosition += lineCount ) ;

        /* Return the lines, optionally converted to numbers. */
        return keepOriginalType ? retrievedLines : retrievedLines . map ( value => + value ) ;
    } ;

    /* Return the factory function to initialize the reader. */
    return initializeReader ;

} ) ( ) ;

// Create an instance of the data handler by reading input from stdin.
var dataHandler = DATA_RETRIEVER ( require ( "fs" ) . readFileSync ( "/dev/stdin" , "utf8" ) ) ;

// Output the result of the main puzzle-solving function.
console . log ( solvePuzzle ( ) ) ;

/**
 * Main function to solve the puzzle logic.
 * This function reads input, processes it, and returns the result.
 * @returns {string|number} The final computed result.
 */
function solvePuzzle ( ) {
    /* Read the total count of elements from the first line. */
    var elementCount = dataHandler . extractValue ( ) ;
    /* Read the array of numbers from the second line. */
    var initialArray = dataHandler . getLineElements ( ) ;
    /* Initialize an array to store the ordered output. */
    var outputOrder = [ ] ;

    /* If the sequence cannot be fully extracted, return -1. */
    if ( findSequence ( initialArray ) === false ) return -1 ;

    /* Reverse the collected output order and join with newlines for the final result. */
    return outputOrder . reverse ( ) . join ( "\n" ) ;

    /**
     * Recursive helper function to find and extract elements in a specific order.
     * It looks for an element `i+1` at index `i` from the end of the array.
     * @param {Array<number>} currentArr - The current array segment being processed.
     * @returns {boolean} True if a valid sequence can be formed, false otherwise.
     */
    function findSequence ( currentArr ) {
        // Base case: if the array is empty, a valid sequence has been found.
        if ( currentArr . length === 0 ) return true ;

        // Iterate from the end of the array backwards.
        for ( var loopIndex = currentArr . length - 1 ; loopIndex >= 0 ; loopIndex -- ) {
            // Check if the element at loopIndex is equal to (loopIndex + 1).
            // This is the specific condition for extraction.
            if ( currentArr [ loopIndex ] === loopIndex + 1 ) {
                // If condition met, push the element to the output stack.
                outputOrder . push ( currentArr [ loopIndex ] ) ;
                // Recursively call with the element removed.
                // The array is split into two parts around the removed element and then concatenated.
                return findSequence ( currentArr . slice ( 0 , loopIndex ) . concat ( currentArr . slice ( loopIndex + 1 ) ) ) ;
            }
        }
        // If no element satisfies the condition in the current array, no valid sequence can be formed.
        return false ;
    }
}