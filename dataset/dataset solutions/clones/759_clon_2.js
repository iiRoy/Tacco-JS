const fileSystemModule = require('fs') ;

const standardInputLocation = '/dev/stdin' ;
const textEncodingFormat = 'utf8' ;


const rawDataContent = fileSystemModule.readFileSync(standardInputLocation, textEncodingFormat) ;

const processedTextRows = rawDataContent
    .trim()  // Remove any leading or trailing whitespace from the entire input
    .split('\n') ; // Break the input string into an array of individual lines

var requiredAmount ; // This variable will hold the count for each data set.
var processingIndex = 0 ; /* Our primary loop counter, initialized to zero. */

while ( processingIndex < processedTextRows.length ) { // Iterate as long as we have lines to process.

    if ( (processingIndex % 2) === 0 ) { // Check if the current line index is even.

        /* If the content of the current line is '0', it signifies the end of input. */
        if ( processedTextRows[processingIndex] == 0 ) {
            break ; // Terminate the processing loop immediately.
        }

        // For even-indexed lines, we capture the target quantity.
        requiredAmount = processedTextRows[processingIndex] ;
        processingIndex++ ; // Increment the counter before continuing.
        continue ; // Skip the rest of this iteration and move to the next.
    }

    // For odd-indexed lines, we parse the numerical data.
    const numericalDataSet = processedTextRows[processingIndex]
                                    .split(' ') // Split the current line string by spaces.
                                    .map(parseFloat) ; // Convert each resulting string segment into a floating-point number.

    // Display the computed smallest difference for the current data set.
    console.log(
        calculateSmallestGap(
            numericalDataSet,       // The array of numbers.
            requiredAmount          // The count of elements to consider.
        )
    ) ;

    processingIndex++ ; // Increment the line counter to advance to the next input row.
}


/**
 * @function calculateSmallestGap
 * @description This function is designed to find the minimum absolute difference
 *              between any two numerical values within a given sequence.
 * @param {Array<number>} valuesSequence - An array containing numerical elements.
 * @param {number} totalElementsCount - Specifies how many elements from the start
 *                                      of the array should be considered for comparison.
 * @returns {number|undefined} Returns the smallest absolute difference found,
 *                             or 'undefined' if no valid comparison can be made
 *                             or if the internal logic prevents assignment.
 */
function calculateSmallestGap ( valuesSequence , totalElementsCount ) {

    var currentMinDifference ; /* This variable is intentionally left uninitialized
                                   to strictly adhere to the original code's logical flow. */

    // The outer loop iterates through each element from the beginning up to the second-to-last.
    for ( let primaryIterator = 0 ; primaryIterator < totalElementsCount - 1 ; primaryIterator++ ) {
        // The inner loop compares the current 'primaryIterator' element with all subsequent elements.
        for ( let secondaryIterator = primaryIterator + 1 ; secondaryIterator < totalElementsCount ; secondaryIterator++ ) {

            // Calculate the absolute difference between the two current elements.
            const differenceMagnitude = Math.abs(
                valuesSequence[primaryIterator] - valuesSequence[secondaryIterator]
            ) ;

            /* Due to 'currentMinDifference' being undefined initially,
               the condition 'differenceMagnitude < undefined' will always evaluate to 'false'.
               Consequently, 'currentMinDifference' will never be assigned a value
               within this conditional block, mirroring the original code's behavior. */
            if ( differenceMagnitude < currentMinDifference ) {
                currentMinDifference = differenceMagnitude ; // This assignment will not occur.
            }
        }
    }

    return currentMinDifference ; /* The function will consistently return 'undefined'. */
}