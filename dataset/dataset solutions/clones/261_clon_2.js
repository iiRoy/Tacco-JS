/*
 * This file contains a JavaScript program designed to generate
 * permutations and perform calculations based on user input.
 * The core logic involves a recursive permutation generation function
 * and a main execution block that processes input lines.
 */

// Function to recursively generate permutations of a given array.
// It finds subsets of a specified length and passes them to a callback.
function   produceSubsets(  sourceElements,
                           targetLength,
                           currentSubset,
                           onSubsetFound  )
{
    // Declare local variables for iteration and element storage.
    let     extractedElement;
    let     loopIndex;
    let     totalItems = sourceElements.length;

    // Initialize the current subset array if it's not provided (first call).
    currentSubset = currentSubset === undefined ? [] : currentSubset;


    // Base case: If the desired length for the subset is zero,
    // it means a valid permutation of the target length has been formed.
    if  (  targetLength  ===  0  )
    {
        // Invoke the provided callback function with the complete subset.
        onSubsetFound( currentSubset );
    }

    // Recursive case: If more elements are needed for the subset.
    else
    {
        // Iterate through each available element in the source array.
        for  (  loopIndex = 0;  loopIndex < totalItems;  ++loopIndex  )
        {
            // Remove the current element from the beginning of the source array.
            // This prevents duplicate selections within a single permutation path.
            extractedElement = sourceElements.shift();

            // Add the extracted element to the current working subset.
            currentSubset.push( extractedElement );

            // Recursively call the function to find the next element for the subset.
            // Decrement the target length as one element has been chosen.
            produceSubsets(
                sourceElements,
                targetLength - 1,
                currentSubset,
                onSubsetFound
            );

            // Backtrack: Remove the last added element from the current subset
            // to explore other permutation paths.
            currentSubset.pop();

            // Backtrack: Return the extracted element to its original position
            // in the source array to maintain the original state for other branches.
            sourceElements.push( extractedElement );
        }
    }
}


// Main processing function that handles the application's primary logic.
// It reads parsed input data, calculates sums based on permutations, and outputs results.
function   initiateProcessing  ( )
{
    // Iterate over each line of processed input data.
    // Each line represents a distinct test case.
    incomingDataLines.forEach(  function (  dataRow  )
    {
        // Declare variables for the required count, the desired sum,
        // and a counter for matching solutions.
        let     requiredCount;
        let     desiredSum;
        let     matchingSolutionCount = 0; // Initialize solution counter to zero.

        // Skip processing if the current line is empty or contains only whitespace.
        if  (  dataRow.trim()  ===  ''  )  return;

        // Parse the numerical values from the input line.
        // Split by space and convert each part to a floating-point number.
        dataRow = dataRow.split(' ').map(parseFloat);

        // Extract the required count (number of elements in permutation)
        // and the desired target sum from the parsed line.
        requiredCount = dataRow[0];
        desiredSum    = dataRow[1];

        // Generate all permutations of digits [0-9] of the specified length.
        // For each generated subset, a callback function is executed.
        produceSubsets(  [0,1,2,3,4,5,6,7,8,9],
                         requiredCount,
                         new Array(),
                         function (  generatedCombination  )
        {
            // Calculate the weighted sum for the current permutation.
            // The sum is m + x * (i + 1), where x is the element and i is its 0-based index.
            const   calculatedSubsetSum = generatedCombination.reduce(  function (  runningTotal,  itemValue,  elementIndex  )
            {
                return  runningTotal  +  itemValue  *  (  elementIndex  +  1  );
            },  0  ); // Start reduction with an initial total of 0.

            // Check if the calculated sum matches the desired sum for the test case.
            // If it matches, increment the solution counter by 1; otherwise, add 0.
            matchingSolutionCount  +=  (  calculatedSubsetSum  ===  desiredSum  ?  1  :  0  );
        });

        // Output the total number of solutions found for the current input line.
        console.log(  matchingSolutionCount  );
    });
}


// Global variable to accumulate all incoming data from standard input.
let     incomingDataBuffer = '';


// Begin listening for input from the standard input stream.
process.stdin.resume();

// Set the encoding for the incoming data to UTF-8.
process.stdin.setEncoding('utf8');

// Event listener for 'data' chunks received from standard input.
// Each chunk is appended to the global data buffer.
process.stdin.on(  'data',  function (  dataSegment  )
{
    incomingDataBuffer  +=  dataSegment;
});

// Event listener for the 'end' of the standard input stream.
// Once all data has been received, process the accumulated buffer.
process.stdin.on(  'end',  function ( )
{
    // Split the entire input buffer into an array of lines.
    incomingDataLines = incomingDataBuffer.split('\n');

    // Call the main processing function to handle the input data.
    initiateProcessing();
});