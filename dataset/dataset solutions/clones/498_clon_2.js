/*
 * This module provides a core mathematical operation function,
 * often used in contexts like quaternion algebra or complex vector transformations.
 * It also includes logic to read and process multiple sets of input data
 * from standard input, applying the core function to each set.
 */

// This function performs a specific type of product or transformation
// on two sets of four numerical components (e.g., quaternions or 4D vectors).
// The parameters represent the components of the two input entities.
function computeProductVector(
    primaryX,
    primaryY,
    primaryZ,
    primaryW,
    secondaryX,
    secondaryY,
    secondaryZ,
    secondaryW
)
{
    // Initialize the four resultant components based on the first input's
    // primaryX component multiplied by all components of the second input.
    let productComponentA = primaryX * secondaryX;
    let productComponentB = primaryX * secondaryY;
    let productComponentC = primaryX * secondaryZ;
    let productComponentD = primaryX * secondaryW;

    // Adjust the resultant components by incorporating terms from
    // the primaryY component of the first input.
    productComponentB += primaryY * secondaryX;
    productComponentA -= primaryY * secondaryY;
    productComponentD += primaryY * secondaryZ;
    productComponentC -= primaryY * secondaryW;
             
    // Further adjust the resultant components using terms from
    // the primaryZ component of the first input.
    productComponentC += primaryZ * secondaryX;
    productComponentD -= primaryZ * secondaryY;
    productComponentA -= primaryZ * secondaryZ;
    productComponentB += primaryZ * secondaryW;
             
    // Final adjustments to the resultant components using terms from
    // the primaryW component of the first input.
    productComponentD += primaryW * secondaryX;
    productComponentC += primaryW * secondaryY;
    productComponentB -= primaryW * secondaryZ;
    productComponentA -= primaryW * secondaryW;

    // Return the final set of four computed components as an array.
    return [
        productComponentA,
        productComponentB,
        productComponentC,
        productComponentD
    ];
}


// --- Main program execution block ---

// Read all incoming data from the standard input stream as a UTF-8 string.
let inputDataString = require('fs') . readFileSync(
    '/dev/stdin',
    'utf8'
);

// Process the acquired string data:
// 1. Remove any leading or trailing whitespace.
// 2. Split the string into an array, where each element is a line from the input.
let processedLines = ( inputDataString.trim() ) . split( "\n" );

// The very first line of the input is expected to contain the total count
// of subsequent test cases. Extract this number and convert it to a float.
let totalTestCases = processedLines.shift() - 0.0;

// Loop through each test case specified by the totalTestCases count.
for ( let currentCaseIndex = 0 ; currentCaseIndex < totalTestCases ; currentCaseIndex++ )
{
    // For the current line (representing a single test case):
    // 1. Split the line string into individual string components based on spaces.
    // 2. Convert each string component into a numerical value.
    let currentInputValues = processedLines[currentCaseIndex] . split(" ") . map( Number );
    
    // Invoke the core computation function, passing the parsed numbers
    // as individual arguments using the `apply` method.
    // `null` is used as the `this` context since it's not relevant here.
    let computedResultVector = computeProductVector.apply( null, currentInputValues );
    
    // Output the resulting array of components to the console.
    // The components are joined together by spaces to form a single line of output.
    console.log( computedResultVector . join( " " ) );
}