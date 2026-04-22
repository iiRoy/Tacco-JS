"use strict"
/*
 * This module provides utilities for reading input from stdin
 * and performing common parsing operations.
 */
const buildSource = () => {
    // Read all input from standard input, decode as UTF-8,
    // trim whitespace, and split into an array of lines.
    const sourceLines = require("fs") .readFileSync( "/dev/stdin" ,  "utf8" ) .trim() .split("\n") ;
    const parserInstance = {
        "collection": sourceLines, // The array of input lines
        "marker": 0,           // Current position (index) in the collection
        "itemCount": sourceLines.length, // Total number of items
        /**
         * Checks if there are more items available to read.
         * @returns {boolean} True if more items exist, false otherwise.
         */
        "moreAvailable": function()  {
            return  this.marker  <  this.itemCount ;
        },
        /**
         * Retrieves the next item from the collection and advances the marker.
         * Throws an error if no more items are available.
         * @returns {string} The next item (line) from the input.
         */
        "fetchNext": function ()  {
            if  ( !this.moreAvailable() )  {
                throw  "InputBoundaryExceeded" ; // Custom error message
            }
            else  {
                return  this.collection[ this.marker++ ] ;
            }
        }
    } ;
    return  parserInstance ;
}

// Initialize the data accessor once
const streamHandler = buildSource() ;

// Helper function to get the next raw string element
const getNextElement = () => streamHandler .fetchNext() ;

// Helper function to parse and retrieve the next integer
const readNumber = () => parseInt( streamHandler .fetchNext() ) ;

// Helper function to get the next line split into strings by space
const parseWords = () => streamHandler .fetchNext() .split(" ") ;

// Helper function to get the next line split into integers by space
const parseNumbers = () => streamHandler .fetchNext() .split(" ") .map( ( entry ) => parseInt(entry) ) ;

// Helper function to get the next line split into characters
const getCharacterArray = () => streamHandler .fetchNext() .split("") ;

// Helper function to check if more data is available
const checkAvailability = () => streamHandler .moreAvailable() ;

// Universal output function
const displayValue = ( ...valuesToPrint ) => console.log( ...valuesToPrint ) ;

/*
 * The main execution routine of the program.
 * Processes input and prints the final calculated result.
 */
const primaryRoutine = () => {
    // Read two integers from the first line of input
    const [ paramA , paramB ] = parseNumbers() ;

    // Calculate the final result based on a conditional logic
    // NOTE: Original code had a typo 'M' instead of 'm'. Corrected to 'paramB'.
    let calculatedAnswer = paramB <= ( 2  * paramA )
        ? Math.floor( paramB / 2 )
        : Math.floor( ( ( 2  * paramA )  + paramB )  / 4 ) ;

    // Output the computed answer to the console
    console.log( calculatedAnswer ) ;
}

// Invoke the main program routine
primaryRoutine() ;