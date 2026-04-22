// This file contains a utility for processing input data and a main program logic.

/**
 * @class InputProcessor
 * @description Handles reading and parsing input content line by line.
 * @param {string} inputContent - The raw string content to process.
 */
function InputProcessor( inputContent ) {
    // Store all lines from the input, split by newline character.
    this.linesData = inputContent.split( "\n" );
    // Initialize the pointer to the current line being processed.
    this.currentLineIndex = 0;
};


// Define methods for the InputProcessor prototype.
InputProcessor.prototype = {

    /**
     * @method fetchSingleValue
     * @description Retrieves a single value from the current line. If the line is exhausted, moves to the next.
     * @param {boolean} returnAsString - If true, returns the value as a string; otherwise, attempts to convert to a number.
     * @returns {string|number} The retrieved value.
     */
    fetchSingleValue : function( returnAsString ) {
        // Keep references to the internal data and current index for brevity.
        let lineStorage = this.linesData,
            currentIdx = this.currentLineIndex,
            retrievedValue;

        // If the current line hasn't been split into words yet, do it and reverse for easy popping.
        if ( typeof lineStorage[currentIdx] === "string" ) {
            lineStorage[currentIdx] = lineStorage[currentIdx].split( " " ).reverse();
        }

        // Extract the last element (which was originally the first due to reverse).
        retrievedValue = lineStorage[currentIdx].pop();

        // If the current line is now empty, advance to the next line.
        if ( !lineStorage[currentIdx].length ) {
            this.currentLineIndex++;
        }

        // Return the value either as a string or a number based on the flag.
        return returnAsString ? retrievedValue : +retrievedValue;
    },

    /**
     * @method fetchLineValues
     * @description Retrieves all values from the current line and advances to the next line.
     * @param {boolean} returnAsString - If true, returns values as strings; otherwise, attempts to convert to numbers.
     * @returns {Array<string|number>} An array of values from the line.
     */
    fetchLineValues : function( returnAsString ) {
        // Get the current line, split it by spaces, and then increment the line index.
        let lineParts = this.linesData[this.currentLineIndex++].split( " " );

        // Return the parts as strings or mapped to numbers.
        return returnAsString ? lineParts : lineParts.map( itemString => +itemString );
    },

    /**
     * @method fetchMultipleLines
     * @description Retrieves multiple lines of values starting from the current line.
     * @param {number} lineCount - The number of lines to retrieve.
     * @param {boolean} returnAsString - If true, returns values as strings; otherwise, attempts to convert to numbers.
     * @returns {Array<Array<string|number>>} A 2D array representing the lines of values.
     */
    fetchMultipleLines : function( lineCount, returnAsString ) {
        let lineStorage = this.linesData,
            currentIdx = this.currentLineIndex,
            resultCollection = [],
            loopCounter = 0;

        // Loop to process the specified number of lines.
        if ( returnAsString ) {
            // Retrieve lines as arrays of strings.
            for ( ; loopCounter < lineCount; loopCounter++ ) {
                resultCollection[loopCounter] = lineStorage[currentIdx + loopCounter].split( " " );
            }
        } else {
            // Retrieve lines as arrays of numbers.
            for ( ; loopCounter < lineCount; loopCounter++ ) {
                resultCollection[loopCounter] = lineStorage[currentIdx + loopCounter].split( " " ).map( itemString => +itemString );
            }
        }

        // Advance the current line index by the number of lines processed.
        this.currentLineIndex += lineCount;

        return resultCollection;
    },
};

// Create an instance of the input processor, reading from standard input.
const dataHandler = new InputProcessor(require("fs").readFileSync("/dev/stdin", "utf8"));

// Execute the main processing function and print its result to the console.
console.log( executeProcessing() );

/**
 * @function executeProcessing
 * @description The primary logic function that processes input and computes a result.
 * @returns {number} The final computed value.
 */
function executeProcessing() {
    // Read the first number, which represents the count of initial elements.
    let numElements = dataHandler.fetchSingleValue();
    // Read the next line, which contains the initial array of numbers.
    let sourceArray = dataHandler.fetchLineValues();
    // Initialize an empty array for derived values.
    let derivedArray = [];

    // Handle base cases where the number of elements is small.
    if ( numElements <= 2 ) {
        return Math.max( ...sourceArray ); // Return the maximum value directly.
    }

    // Populate the derived array with the maximum of adjacent elements from the source array.
    for ( let idx = 0; idx < numElements - 1; idx++ ) {
        derivedArray[idx] = Math.max( sourceArray[idx], sourceArray[idx+1] );
    }

    // Concatenate the original and derived arrays.
    sourceArray = sourceArray.concat( derivedArray );

    // Call a helper function to find the median of the combined array.
    return findMedian( sourceArray );

    /**
     * @function findMedian
     * @description A helper function to find the median of a given array of numbers.
     * @param {Array<number>} targetArray - The array for which to find the median.
     * @returns {number} The median value of the array.
     */
    function findMedian( targetArray ) {
        // Sort the array numerically in ascending order.
        targetArray.sort( ( valA, valB ) => valA - valB );
        // Return the middle element (using bitwise right shift for integer division).
        return targetArray[ targetArray.length >> 1 ];
    }
}