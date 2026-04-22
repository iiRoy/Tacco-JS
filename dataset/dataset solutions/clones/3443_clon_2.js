'use strict'; // Enforce strict parsing and error handling for cleaner code

// A utility class to process input data from standard input.
function DataParser( rawInputString ) {
    let lineArray = rawInputString.split('\n'); // Split the entire input string by newline characters.
    // If the last line is empty (common with terminal input), remove it.
    if ( lineArray[lineArray.length - 1] === '' ) {
        lineArray.pop();
    }
    this.lines = lineArray; // Store all processed lines.
    this.currentLineIndex = 0; // Initialize a pointer for reading lines.
}

// Prototype method to read a line, split it by spaces, and convert parts to integers.
DataParser.prototype.readIntsLine = function() {
    // Retrieve the current line, increment the index, split by space, and map to numbers.
    return this.lines[this.currentLineIndex++].split(' ').map( numericValue => +numericValue );
};

// Prototype method to read all remaining lines as integer vectors.
DataParser.prototype.readAllIntVectors = function() {
    const startIndex = this.currentLineIndex; // Store the current position.
    this.currentLineIndex = this.lines.length; // Advance the pointer to the end.
    // Slice the remaining lines and convert each to a number.
    return this.lines.slice(startIndex).map( numberItem => +numberItem );
};

// Prototype method to read all remaining lines as string vectors.
DataParser.prototype.readAllStringVectors = function() {
    const startIdx = this.currentLineIndex; // Keep track of the starting line index.
    this.currentLineIndex = this.lines.length; // Set the current index to the end of the input.
    // Return all subsequent lines as an array of strings.
    return this.lines.slice(startIdx);
};

// Prototype method to read a specific number of lines as strings.
DataParser.prototype.readNStrings = function( count ) {
    const initialIndex = this.currentLineIndex; // Capture the starting point.
    this.currentLineIndex += count; // Move the pointer forward by the specified count.
    // Extract a segment of lines from the input array.
    return this.lines.slice( initialIndex, initialIndex + count );
};

// Instantiate the input processing mechanism by reading from standard input.
const parserInstance = new DataParser( require("fs").readFileSync("/dev/stdin", "utf8") );

// Anonymous self-executing function to encapsulate the main program logic.
( () => {

    // Read the first line containing N and K values.
    const sizeAndTarget = parserInstance.readIntsLine();
    const arraySize = sizeAndTarget[0]; // Extract N.
    const targetCount = sizeAndTarget[1]; // Extract K.

    // Read the array of numbers for processing.
    const inputNumbers = parserInstance.readIntsLine();

    // Array to store all possible cumulative sums of subarrays.
    const partialSums = [];
    // Iterate through all possible starting points for subarrays.
    for ( let outerIndex = 0; outerIndex < arraySize; outerIndex++ ) {
        let currentSum = 0; // Initialize sum for the current subarray.
        // Iterate through all possible ending points for subarrays starting at outerIndex.
        for ( let innerIndex = outerIndex; innerIndex < arraySize; innerIndex++ ) {
            currentSum += inputNumbers[innerIndex]; // Add the current element to the sum.
            partialSums.push( currentSum ); // Store the cumulative sum.
        }
    }

    // Sort the collected sums in descending order.
    partialSums.sort( ( firstVal, secondVal ) => secondVal - firstVal );

    // Variable to accumulate the maximum XOR sum.
    let xorMaximum = 0;
    // Iterate from the most significant bit (MSB) down to the least significant bit (LSB).
    // The range 41 to 0 covers numbers up to 2^42 - 1, which is sufficient for typical constraints.
    for ( let bitPosition = 41; bitPosition >= 0; bitPosition-- ) {
        // Calculate the value represented by the current bit position.
        let currentBitThreshold = Math.pow( 2, bitPosition );
        // Filter the partial sums to find how many elements satisfy the current bit condition.
        // An element 'e' satisfies if (e & (xorMaximum + currentBitThreshold)) equals (xorMaximum + currentBitThreshold).
        // This checks if all bits set in (xorMaximum + currentBitThreshold) are also set in 'e'.
        let validSubsets = partialSums.filter( elementValue => ( elementValue & ( xorMaximum + currentBitThreshold ) ) === ( xorMaximum + currentBitThreshold ) ).length;

        // If the number of valid subsets is greater than or equal to K,
        // it means we can potentially include this bit in our maximum XOR sum.
        if ( validSubsets >= targetCount ) {
            xorMaximum += currentBitThreshold; // Add the current bit's value to the result.
        }
    }

    // Output the final calculated maximum XOR sum.
    console.log( xorMaximum );

} )();