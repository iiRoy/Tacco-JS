// Function to reorder elements around a chosen pivot within an array segment
function segmentArray( arrayData, startIdx, endIdx )
{
    // The pivot element is chosen from the last position of the current segment
    const pivotVal = arrayData[endIdx];

    // Initialize a pointer, 'lesserPtr', to track the boundary of elements smaller than the pivot
    let lesserPtr = startIdx - 1;

    // Iterate through the array segment from the beginning up to (but not including) the pivot element
    for ( let currentIdx = startIdx; currentIdx < endIdx; currentIdx++ )
    {
        // If the current element encountered is less than or equal to the pivot value
        if ( arrayData[currentIdx] <= pivotVal )
        {
            // Increment the 'lesserPtr' to point to the next position for a smaller element
            lesserPtr++;

            // Perform a swap: move the element at 'currentIdx' to the 'lesserPtr' position
            let temporary = arrayData[lesserPtr];
            arrayData[lesserPtr] = arrayData[currentIdx];
            arrayData[currentIdx] = temporary;
        }
    }

    // After the loop, place the pivot element into its final sorted position
    // It should be placed immediately after all elements that are smaller than it (at lesserPtr + 1)
    let temporary = arrayData[lesserPtr + 1];
    arrayData[lesserPtr + 1] = arrayData[endIdx]; // Move pivot to its final spot
    arrayData[endIdx] = temporary; // Move the element that was at (lesserPtr + 1) to the pivot's old spot

    // Return the final index where the pivot element is now located
    return lesserPtr + 1;
}

// Acquire the 'fs' (file system) module to handle input operations
var rawDataString = require('fs') . readFileSync ( '/dev/stdin', 'utf8' ) ;
// Split the entire raw input string into an array of individual lines
var parsedLines = rawDataString.split ( '\n' ) ;

// Extract the first line from the input, convert it to a number, representing the total element count
var elementCount = +parsedLines.shift ( ) ;
// Extract the next line, split it by spaces, and then transform each resulting string part into a number
var arrayData = parsedLines.shift ( ) . split ( ' ' ) . map (
    function ( itemString ) {
        return +itemString ; // Convert the string item to a number
    }
) ;

// Invoke the partitioning function on the 'arrayData', specifying the full range
// The result is the final index of the pivot element after rearrangement
var pivotResultIdx = segmentArray ( arrayData, 0, arrayData.length - 1 ) ;
// Modify the element at the 'pivotResultIdx' by enclosing its value in square brackets
arrayData[pivotResultIdx] = '[' + arrayData[pivotResultIdx] + ']' ;
// Output the modified array elements, joined by a single space, to the console
console.log ( arrayData.join ( ' ' ) ) ;