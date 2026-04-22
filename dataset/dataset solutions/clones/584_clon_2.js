let sourceData = require('node:fs') . readFileSync('/dev/stdin', 'utf8');

// Process raw input data by trimming whitespace and splitting into individual lines.
let lineCollection = ( sourceData.trim() ) . split ( '\n' );

// Main loop to handle multiple test cases until a termination condition is met.
while ( true )
{
    // Extract dimensions (N and M) for the current test case.
    // The first line of each test case contains two space-separated numbers.
    let dimensions = lineCollection.shift() . split ( ' ' ) . map ( strVal => parseInt(strVal, 10) );

    let itemCount = dimensions[0]; // N: Represents the number of items or values.
    let maxAllowedSum = dimensions[1]; // M: Represents the maximum permissible sum.

    // Check for the termination condition (N=0 and M=0).
    if ( itemCount === 0 && maxAllowedSum === 0 )
    {
        break; // Exit the loop if both dimensions are zero.
    }

    // Array to store the individual numeric values for the current test case.
    let individualValues = [];

    // Populate the array with N values, parsed as integers.
    for ( let idx = 0; idx < itemCount; idx++ )
    {
        individualValues.push( parseInt(lineCollection.shift(), 10) );
    }

    // Append a zero to the collection as per the problem's logic.
    individualValues.push(0);

    // Array to store all possible sums of two values from 'individualValues'.
    let sumCombinations = [];

    // Generate all unique pairs (i, j where i <= j) and calculate their sums.
    for ( let firstIdx = 0; firstIdx < individualValues.length; firstIdx++ )
    {
        for ( let secondIdx = firstIdx; secondIdx < individualValues.length; secondIdx++ )
        {
            let currentSum = individualValues[firstIdx] + individualValues[secondIdx];

            // Only add sums that do not exceed the 'maxAllowedSum'.
            if ( currentSum > maxAllowedSum )
            {
                continue; // Skip if the sum is too large.
            }
            sumCombinations.push( currentSum ); // Add the valid sum.
        }
    }

    // Sort the generated sums in ascending order for efficient searching.
    sumCombinations.sort( ( valA, valB ) => valA - valB );

    let overallMaximum = 0; // Variable to keep track of the highest valid sum found.

    // Initialize the right pointer for the two-pointer approach.
    let rightPointer = sumCombinations.length - 1;

    // Use a two-pointer technique to find the maximum possible sum of two elements
    // from 'sumCombinations' that does not exceed 'maxAllowedSum'.
    for ( let leftPointer = 0; leftPointer < sumCombinations.length; leftPointer++ )
    {
        // Adjust the right pointer inward if the current sum (left + right) is too large.
        while ( sumCombinations[leftPointer] + sumCombinations[rightPointer] > maxAllowedSum && leftPointer <= rightPointer )
        {
            rightPointer--; // Move right pointer to a smaller value.
        }

        // If the left pointer has crossed the right pointer, no more valid pairs can be formed.
        if ( leftPointer > rightPointer )
        {
            break;
        }

        // Update the overall maximum sum found so far.
        overallMaximum = Math.max( overallMaximum, sumCombinations[leftPointer] + sumCombinations[rightPointer] );
    }

    // Output the final maximum sum for the current test case.
    console.log( overallMaximum );
}