"use strict"; /* Enforce strict mode for modern JavaScript practices. */

/*
 *   Primary function to process input data and generate output.
 *   @param {string} sourceData - The raw input string, typically from stdin.
 */
function ProcessInput( sourceData ) {
    // Prepare the incoming text data: trim, split into lines, and reverse for easy popping.
    let processedLines = sourceData.trim().split('\n').reverse();

    // Initialize an array to accumulate all results before final output.
    let outputCollection = [];

    /**
     *   Fetches the next line from the prepared input array.
     *   @returns {string} The next line of input.
     */
    function retrieveLine() {
        return processedLines.pop();
    }

    /**
     *   Reads a line, splits it by space, and converts each part to an integer.
     *   @returns {number[]} An array of integers.
     */
    function parseNumericLine() {
        return retrieveLine().split(' ').map( individualNumStr => parseInt(individualNumStr, 10) );
    }

    /**
     *   Adds a value to the output collection.
     *   @param {*} itemToOutput - The value to be stored for output.
     */
    function appendResult( itemToOutput ) {
        outputCollection.push( itemToOutput );
    }

    /**
     *   Checks if a specific element exists within a given array.
     *   @param {*} soughtItem - The item to search for.
     *   @param {Array} targetArray - The array to search within.
     *   @returns {boolean} True if the item is found, false otherwise.
     */
    function checkElementPresence( soughtItem, targetArray ) {
        return new Set( targetArray ).has( soughtItem );
    }

    /**
     *   Finds the maximum numeric value in an array.
     *   @param {number[]} numericValues - Array of numbers.
     *   @returns {number} The largest number in the array.
     */
    function locateMaximum( numericValues ) {
        return numericValues.reduce( (valA, valB) => Math.max(valA, valB) );
    }

    /**
     *   Finds the minimum numeric value in an array.
     *   @param {number[]} numericValues - Array of numbers.
     *   @returns {number} The smallest number in the array.
     */
    function locateMinimum( numericValues ) {
        return numericValues.reduce( (valA, valB) => Math.min(valA, valB) );
    }

    /**
     *   Calculates the sum of all numbers in an array.
     *   @param {number[]} numericValues - Array of numbers.
     *   @returns {number} The sum of all numbers.
     */
    function computeSum( numericValues ) {
        return numericValues.reduce( (valA, valB) => valA + valB );
    }

    /**
     *   Sorts an array of objects in-place based on a specified property/index.
     *   @param {Array<Object>} dataRecords - The array of objects to sort.
     *   @param {string|number} propertyIndex - The key or index to sort by.
     */
    function sortRecordsByIndex( dataRecords, propertyIndex ) {
        dataRecords.sort( (recordX, recordY) => recordX[propertyIndex] - recordY[propertyIndex] );
    }

    /**
     *   Checks if all boolean values in an array are true.
     *   @param {boolean[]} booleanStates - Array of boolean values.
     *   @returns {boolean} True if all are true, false otherwise.
     */
    function verifyAllTrue( booleanStates ) {
        return booleanStates.reduce( (stateA, stateB) => stateA && stateB );
    }

    /**
     *   Checks if any boolean value in an array is true.
     *   @param {boolean[]} booleanStates - Array of boolean values.
     *   @returns {boolean} True if any is true, false otherwise.
     */
    function verifyAnyTrue( booleanStates ) {
        return booleanStates.reduce( (stateA, stateB) => stateA || stateB );
    }

    /**
     *   Converts any iterable into a standard JavaScript Array.
     *   @param {Iterable} sourceIterable - The iterable to convert.
     *   @returns {Array} A new array containing elements from the iterable.
     */
    function convertToArray( sourceIterable ) {
        return Array.from( sourceIterable );
    }

    /**
     *   Converts an iterable of string representations of numbers into an array of integers.
     *   @param {Iterable<string>} stringNumbers - Iterable of strings that can be parsed as integers.
     *   @returns {number[]} An array of integers.
     */
    function convertToIntegers( stringNumbers ) {
        return Array.from( stringNumbers, str => parseInt(str, 10) );
    }

    /**
     *   Creates a new array of a specified length, filled with a given value.
     *   @param {*} fillerValue - The value to fill the array with.
     *   @param {number} desiredLength - The length of the new array.
     *   @returns {Array} A new array filled with fillerValue.
     */
    function buildFilledArray( fillerValue, desiredLength ) {
        return Array( desiredLength ).fill( fillerValue );
    }

    /**
     *   Generates a sequence of numbers within a specified range with a given step.
     *   @param {number} sequenceStart - The starting number of the sequence.
     *   @param {number} sequenceEnd - The end number (exclusive) of the sequence.
     *   @param {number} sequenceIncrement - The step size between numbers.
     *   @returns {number[]} An array representing the numeric sequence.
     */
    const generateNumericSequence = ( sequenceStart, sequenceEnd, sequenceIncrement ) => Array.from(
        { length: ( sequenceEnd - sequenceStart ) / sequenceIncrement },
        ( _, indexOffset ) => sequenceStart + ( indexOffset * sequenceIncrement )
    );

    // --- Core Logic Execution ---

    // Read the initial numeric parameter from the input.
    let currentNumber = parseInt( retrieveLine(), 10 );

    // Apply specific logic based on the initial value of 'currentNumber'.
    if ( currentNumber === 1 || currentNumber === 2 ) {
        appendResult( 4 ); // Output a predefined value for these specific cases.
    } else {
        let operationCount = 2; // Initialize a counter for the steps in the sequence.
        // Iterate following the Collatz conjecture rules until the number reaches 1.
        while ( currentNumber !== 1 ) {
            if ( currentNumber % 2 === 1 ) {
                currentNumber = ( 3 * currentNumber ) + 1; // If odd, apply (3n + 1).
            } else {
                currentNumber /= 2; // If even, apply (n / 2).
            }
            operationCount++; // Increment the step counter for each transformation.
        }
        appendResult( operationCount ); // Store the total number of operations.
    }

    // --- End of Core Logic ---

    // Combine all collected output lines into a single string, separated by newlines.
    let finalOutputString = outputCollection.join('\n');

    // Display the final generated output to the console.
    console.log( finalOutputString );

    // Return the final output string.
    return finalOutputString;
}

// Invoke the main processing function, reading input from the standard input stream.
ProcessInput( require('fs').readFileSync('/dev/stdin', 'utf8') );