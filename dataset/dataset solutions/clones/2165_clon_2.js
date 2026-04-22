"use strict";

/*
 * This program analyzes a multi-line input string to determine a specific
 * output based on a string comparison condition. It processes numeric
 * values and prints adjusted results.
 */
function processInputData( rawInputString )
{
    // Split the entire input content into an array of individual text lines.
    const contentLines = rawInputString
        .trim()
        .split( '\n' );

    // The first line contains space-separated string components.
    let firstLineComponents = contentLines[0]
        .split( ' ' );

    // The second line contains space-separated numbers, which are parsed into integers.
    const numericValues = contentLines[1]
        .split( ' ' )
        .map( valueStr => parseInt(valueStr, 10) );

    // The third line provides a single string for comparison.
    const comparisonTarget = contentLines[2];

    // Evaluate if the comparison target matches the first component of the first line.
    if ( comparisonTarget === firstLineComponents[0] )
    {
        // If a match is found, decrement the first numeric value and output.
        console.log( (numericValues[0] - 1).toString() + " " + numericValues[1].toString() );
    }
    else
    {
        // Otherwise (no match), decrement the second numeric value and output.
        console.log( numericValues[0].toString() + " " + (numericValues[1] - 1).toString() );
    }
}

// Define standard input path and encoding as constants.
const STDIN_SOURCE_PATH = '/dev/stdin';
const TEXT_ENCODING_FORMAT = 'utf8';

// Obtain the Node.js built-in module loader.
const retrieveModule = require;

// Load the file system utility module.
const fileSystemModule = retrieveModule('fs');

// Read the entire content from standard input synchronously and pass it to the processing function.
processInputData( fileSystemModule.readFileSync( STDIN_SOURCE_PATH, TEXT_ENCODING_FORMAT ) );