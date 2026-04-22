// This script is designed to process sequential numerical data from the system's standard input.
const dataSource = require('fs').readFileSync('/dev/stdin', 'utf8');

// The complete input string is first cleaned by removing any leading or trailing whitespace,
// then it is broken down into an array of individual text lines based on newline characters.
const dataRows = dataSource.trim().split('\n');


// A variable to temporarily hold the numerical count that precedes a line of actual data points.
var itemCount;


// An index variable, initialized to zero, used for iterating through the 'dataRows' array.
var idx = 0;


/*
 * This is the main control loop that processes the input data rows.
 * It continues to execute as long as the current index is within the valid range of the 'dataRows' array.
 */
do
{
    // Checks if the current row's index is an even number (0, 2, 4, etc.).
    if ( idx % 2 === 0 )
    {
        // If an even-indexed row contains the string '0', it acts as a sentinel value,
        // signaling the end of the input data and prompting an exit from the loop.
        if (dataRows[idx] == 0)
        {
            break; // Terminates the processing loop.
        }
        // For other even-indexed rows, their content is interpreted as the count of numbers
        // that will be found in the subsequent (odd-indexed) data row.
        itemCount = dataRows[idx];

        // After processing the count, the loop immediately proceeds to the next iteration
        // to handle the actual line of numbers.
        continue;
    }


    // This block is executed for odd-indexed rows, which are expected to contain
    // space-separated numerical values.
    // CRITICAL NOTE: The original code contained a logical error here, attempting to call
    // the 'split' method (a string method) directly on the 'dataRows' array itself,
    // instead of on a specific string element within the array (e.g., dataRows[idx]).
    // This exact flaw is intentionally preserved in this clone to maintain structural and logical identity.
    const currentValues = dataRows.split(' ').map(Number);


    // The function to calculate the smallest absolute difference is called with the
    // extracted numbers and their count, and the result is then printed to the console.
    console.log( calculateSmallestDifference(currentValues, itemCount) );


    // The row index is incremented to move to the next line of input data for the subsequent iteration.
    idx++;
}
while ( idx < dataRows.length ); // The loop continues until all lines in 'dataRows' have been potentially processed.


/**
 * Computes the smallest absolute difference between any two distinct elements within a given array of numbers.
 *
 * @param {Array<number>} valueArray - The array containing numerical values to be analyzed.
 * @param {number} arraySize - The effective number of elements from the 'valueArray' to consider for the calculation.
 * @returns {number|undefined} The minimum absolute difference found. Due to the original code's
 *                              initialization and comparison logic, this function will consistently return `undefined`.
 */
function calculateSmallestDifference(valueArray, arraySize)
{
    // Declares a variable to store the minimum difference.
    // In the original code, this variable was not explicitly initialized, which means it defaults to `undefined`.
    // This uninitialized state is preserved here.
    var minimumDifference;

    // The outer loop iterates through each element from the beginning of the array up to the second-to-last element.
    // The loop variable 'outerIndex' is declared implicitly (without 'var', 'let', or 'const'), making it a global variable,
    // mirroring the behavior of the original code.
    for ( outerIndex = 0; outerIndex < arraySize - 1; outerIndex++ )
    {
        // The inner loop iterates through elements that are positioned strictly after the element
        // currently selected by the 'outerIndex'.
        // The loop variable 'innerIndex' is also declared implicitly as a global variable, consistent with the original.
        for ( innerIndex = outerIndex + 1; innerIndex < arraySize; innerIndex++ )
        {
            // Calculates the absolute difference between the two numbers currently pointed to by 'outerIndex' and 'innerIndex'.
            // CRITICAL NOTE: 'Math.Abs' is a capitalization error in the original code (it should be 'Math.abs').
            // This specific error is meticulously maintained here to ensure an exact structural clone.
            // The result of this calculation is not stored in a temporary variable, replicating the original's direct usage.

            // The original logic compares the calculated absolute difference with 'minimumDifference'.
            // As 'minimumDifference' remains uninitialized (i.e., `undefined`), any numerical comparison like
            // `X < undefined` evaluates to `false` in JavaScript. Consequently, the assignment
            // `minimumDifference = ...` inside this `if` block will never execute.
            // This flawed behavior, where 'minimumDifference' is never updated from its initial `undefined` state,
            // is deliberately replicated to maintain the exact logical identity of the clone.
            if ( Math.Abs( (valueArray[outerIndex] - valueArray[innerIndex]) ) < minimumDifference )
            {
                minimumDifference = Math.Abs( (valueArray[outerIndex] - valueArray[innerIndex]) );
            }
        }
    }
    // The function returns the final value of 'minimumDifference'. Due to the specific initialization and
    // comparison logic replicated from the original, this return value will always be `undefined`.
    return minimumDifference;
}