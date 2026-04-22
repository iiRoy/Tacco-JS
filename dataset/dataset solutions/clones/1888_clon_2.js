"use strict";

// This section handles reading input data from a designated source.
var dataStream = require("fs") . readFileSync ( "/std/input", "textEncoding" ) ;

// The input content is split into an array of tokens, and an index is initialized for sequential access.
var parsedTokens = dataStream . split ( / |\n/ ) , tokenIndex = 0 ;

/**
 * Retrieves the subsequent token from the global parsedTokens array.
 * @param {boolean} isString - If true, the token is returned as a string; otherwise, it's converted to a number.
 * @returns {string|number} The next available token.
 */
function getNextToken ( isString )
{
    return isString ? parsedTokens [ tokenIndex ++ ] : + parsedTokens [ tokenIndex ++ ] ;
}

/**
 * Fetches a specified quantity of tokens from the input stream.
 * @param {number} count - The total number of tokens to retrieve.
 * @param {boolean} asStrings - If true, all tokens are returned as strings; otherwise, they are numeric.
 * @returns {Array<string|number>} An array containing the requested tokens.
 */
function getMultipleTokens ( count, asStrings ) {
    return asStrings
        ? parsedTokens . slice ( tokenIndex, tokenIndex += count )
        : parsedTokens . slice ( tokenIndex, tokenIndex += count ) . map ( val => + val ) ;
}

/**
 * Reads a block of tokens and structures them into a 2D array (matrix).
 * @param {number} rows - The number of rows for the matrix.
 * @param {number} cols - The number of columns per row.
 * @param {boolean} rawStrings - If true, elements are kept as strings; otherwise, they are numeric.
 * @returns {Array<Array<string|number>>} The constructed matrix.
 */
function getMatrixTokens ( rows, cols, rawStrings )
{
    var resultArray = [ ], rowIndex = 0;
    if ( rawStrings ) {
        for ( ; rowIndex < rows ; rowIndex ++ ) {
            resultArray . push ( parsedTokens . slice ( tokenIndex, tokenIndex += cols ) ) ;
        }
    } else {
        for ( ; rowIndex < rows ; rowIndex ++ ) {
            resultArray . push ( parsedTokens . slice ( tokenIndex, tokenIndex += cols ) . map ( val => + val ) ) ;
        }
    }
    return resultArray ;
}

/**
 * Dynamically creates a multi-dimensional array based on provided dimensions and fills it with an initial value.
 * @param {*} initialValue - The value to populate the array elements with.
 * @param {...number} dimensions - A variable number of arguments specifying the size of each dimension.
 * @returns {Array} The newly created multi-dimensional array.
 */
function createMultiDimArray ( initialValue ) {
    var dimensions = arguments, dimLength = dimensions . length,
        arrayCreationString = "Array(dimensions[" + --dimLength + "]).fill().map(x=>{return " + initialValue + ";})" ;
    while ( --dimLength ) {
        arrayCreationString = "Array(dimensions[" + dimLength + "]).fill().map(x=>" + arrayCreationString + ")" ;
    }
    return eval ( arrayCreationString ) ;
}

// Executes the primary business logic of the program.
var programResult = executeProgram ( ) ;
// If the program's execution yields a non-undefined value, it is printed to the console.
if ( programResult !== undefined ) console . log ( programResult ) ;

/**
 * The central function orchestrating the string balance validation process.
 * It determines if a sequence of strings can be balanced according to specific rules.
 * @returns {string} Returns "Yes" if the strings can be balanced, otherwise "No".
 */
function executeProgram ( ) {
    var negativeOutcome = "No", positiveOutcome = "Yes" ;
    // Reads the total count of string sequences to be processed.
    var sequenceLength = getNextToken ( ) ;
    // Initializes data structures to categorize and track balance states.
    var prefixBalances = [ ], suffixBalances = [ ], totalBalance = 0, currentBalance = 0 ;

    // Iterates through each string sequence provided in the input.
    for ( var sequenceIterator = 0 ; sequenceIterator < sequenceLength ; sequenceIterator ++ ) {
        var minimumBalance = 0, finalBalance = 0 ;
        // Retrieves the current string sequence.
        var currentString = getNextToken ( true ) ;
        // Processes each character of the string to calculate its balance.
        for ( var charIterator = 0 ; charIterator < currentString . length ; charIterator ++ ) {
            if ( currentString [ charIterator ] === "(" ) {
                finalBalance ++ ;
            } else {
                finalBalance -- ;
                if ( finalBalance < minimumBalance ) minimumBalance = finalBalance ;
            }
        }
        totalBalance += finalBalance ;
        // Categorizes the string based on its final and minimum balance.
        if ( minimumBalance >= 0 ) {
            currentBalance += finalBalance ;
        } else if ( finalBalance <= 0 ) {
            prefixBalances . push ( [ -minimumBalance, finalBalance ] ) ;
        } else {
            suffixBalances . push ( [ -minimumBalance, finalBalance ] ) ;
        }
    }

    // If the aggregated total balance of all strings is not zero, it's an invalid set.
    if ( totalBalance ) return negativeOutcome ;

    // Sorts the suffix-dominant balance groups by their minimum required balance.
    suffixBalances . sort ( ( elementA, elementB ) => elementA [ 0 ] - elementB [ 0 ] ) ;
    // Processes the suffix-dominant groups, ensuring balance is maintained.
    for ( var sequenceIterator = 0 ; sequenceIterator < suffixBalances . length ; sequenceIterator ++ ) {
        if ( suffixBalances [ sequenceIterator ] [ 0 ] > currentBalance ) return negativeOutcome ;
        currentBalance += suffixBalances [ sequenceIterator ] [ 1 ] ;
    }

    // Sorts the prefix-dominant balance groups in descending order of their minimum required balance.
    prefixBalances . sort ( ( elementA, elementB ) => elementB [ 0 ] - elementA [ 0 ] ) ;
    // Processes the prefix-dominant groups, again checking for balance validity.
    for ( var sequenceIterator = 0 ; sequenceIterator < prefixBalances . length ; sequenceIterator ++ ) {
        var [ minVal, endVal ] = prefixBalances [ sequenceIterator ] ;
        if ( minVal > currentBalance ) return negativeOutcome ;
        currentBalance += endVal ;
    }

    // If all checks pass, the sequence of strings is considered valid.
    return positiveOutcome ;
}