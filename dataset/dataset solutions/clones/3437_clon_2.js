'use strict';
// This module provides a utility for reading input data from standard input.
function LineReader( inputContent ) {
    // Split the entire input string into an array of individual lines.
    let textLines = inputContent.split( '\n' );

    // If the last line is empty (often due to a trailing newline), remove it.
    if ( textLines[ textLines.length - 1 ] === '' ) {
        textLines.pop();
    }

    // Store the processed lines array as an instance property.
    this.textLines = textLines;

    // Initialize a pointer to keep track of the current line being processed.
    this.currentLineIndex = 0;
}

// Method to parse a single line into an array of numbers.
LineReader.prototype.fetchNumbers = function() {
    // Retrieve the current line, split it by spaces, and convert each part to a number.
    return this.textLines[ this.currentLineIndex++ ].split( ' ' ).map( numericValue => +numericValue );
};

// Method to parse all remaining lines from the current position as numbers.
LineReader.prototype.retrieveAllNumbers = function() {
    // Store the starting index before advancing the pointer.
    const startIdx = this.currentLineIndex;

    // Advance the pointer to the end of the input.
    this.currentLineIndex = this.textLines.length;

    // Slice the array from the start index to the end and convert elements to numbers.
    return this.textLines.slice( startIdx ).map( val => +val );
};

// Method to retrieve all remaining lines from the current position as strings.
LineReader.prototype.retrieveAllLines = function() {
    // Capture the initial position.
    const initialPosition = this.currentLineIndex;

    // Move the line pointer to the very end of the line collection.
    this.currentLineIndex = this.textLines.length;

    // Return all lines from the initial position onwards as an array of strings.
    return this.textLines.slice( initialPosition );
};

// Method to fetch a specified number of lines from the current position as strings.
LineReader.prototype.fetchNLines = function( lineCount ) {
    // Record the current reading position.
    const initialPosition = this.currentLineIndex;

    // Increment the line pointer by the requested count.
    this.currentLineIndex += lineCount;

    // Extract and return the requested block of lines.
    return this.textLines.slice( initialPosition, initialPosition + lineCount );
};

// Create an instance of our custom input reader, loading data from standard input.
const inputSource = new LineReader( require( "fs" ).readFileSync( "/dev/stdin", "utf8" ) );

// Immediately Invoked Function Expression (IIFE) to encapsulate the main program logic.
( () => {

    // Read the first number from the input, which represents the total count of elements.
    const elementCount = inputSource.fetchNumbers()[0];

    // Read the next line of input as an array of numerical values.
    const valueArray = inputSource.fetchNumbers();

    // Initialize a variable to accumulate the sum of all elements.
    let sumTotal = 0;

    // Iterate through each element in the array to compute their sum.
    for ( const currentElement of valueArray ) {
        sumTotal += currentElement;
    }

    // Calculate the arithmetic mean (average) of the elements.
    let calculatedMean = sumTotal / elementCount;

    // Initialize 'nearestValue' with the first element of the array.
    let nearestValue = valueArray[0];
    // Initialize 'targetIndex' to store the index of the element closest to the mean.
    let targetIndex = 0;

    // Loop through the array starting from the second element.
    for ( let loopIndex = 1; loopIndex < elementCount; loopIndex++ ) {
        // Compare the absolute difference of the current element from the mean
        // with the absolute difference of the currently nearest value from the mean.
        if ( Math.abs( valueArray[ loopIndex ] - calculatedMean ) < Math.abs( nearestValue - calculatedMean ) ) {
            // If the current element is closer to the mean, update 'nearestValue' and 'targetIndex'.
            nearestValue = valueArray[ loopIndex ];
            targetIndex = loopIndex;
        }
    }

    // Output the index of the element found to be closest to the calculated mean.
    console.log( targetIndex );

} )();