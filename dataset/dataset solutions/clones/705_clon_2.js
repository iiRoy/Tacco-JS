// Declare global variables for array sizes and data storage.
var numElementsA, numElementsB;
var firstArray = [], secondArray = [];

// This function performs a binary search on 'secondArray'
// to check for the existence of a specific value.
function locateElement(valueToFind)
{
    // Initialize search boundaries.
    var lowIndex = 0, highIndex = numElementsB;

    // Continue searching while the range is valid.
    while (highIndex - lowIndex > 1)
    {
        // Calculate the middle index using bitwise shift for efficiency.
        var middleIndex = (lowIndex + highIndex) >> 1;

        // If the element at middleIndex is less than or equal to the target,
        // move the lower boundary.
        if (secondArray[middleIndex] <= valueToFind)
        {
            lowIndex = middleIndex;
        }
        // Otherwise, move the upper boundary.
        else
        {
            highIndex = middleIndex;
        }
    }
    // Check if the element at lowIndex matches the target.
    return secondArray[lowIndex] === valueToFind;
}

// The main function orchestrates the data processing logic.
function processDataSets()
{
    // Loop until no more data is available from input.
    while (numElementsA = readNextNumber())
    {
        numElementsB = readNextNumber();

        // Populate 'firstArray' with 'numElementsA' values.
        loopThrough(numElementsA, function(currentIteration)
        {
            firstArray[currentIteration] = readNextNumber();
        });
        // Populate 'secondArray' with 'numElementsB' values.
        loopThrough(numElementsB, function(currentIteration)
        {
            secondArray[currentIteration] = readNextNumber();
        });

        // Sort both arrays in ascending order for binary search and sum calculations.
        firstArray.sort(function(valU, valV)
        {
            return valU - valV;
        });
        secondArray.sort(function(valU, valV)
        {
            return valU - valV;
        });

        // Calculate the sum of elements in 'firstArray'.
        var sumFirstArray = 0;
        loopThrough(numElementsA, function(currentIteration)
        {
            sumFirstArray += firstArray[currentIteration];
        });
        // Calculate the sum of elements in 'secondArray'.
        var sumSecondArray = 0;
        loopThrough(numElementsB, function(currentIteration)
        {
            sumSecondArray += secondArray[currentIteration];
        });

        // Determine the required difference for an element swap.
        var requiredDifference = Math.floor((sumSecondArray - sumFirstArray) / 2);
        // If the total difference is not an even number, no valid swap exists.
        if (sumSecondArray - sumFirstArray !== 2 * requiredDifference)
        {
            outputResult(-1);
            continue; // Move to the next data set.
        }

        // Flag to track if a matching swap was found.
        var matchFound = false;
        // Iterate through 'firstArray' to find a potential swap.
        loopThrough(numElementsA, function(currentIteration)
        {
            // Check if (element_from_first_array + required_difference) exists in 'secondArray'.
            if (locateElement(firstArray[currentIteration] + requiredDifference))
            {
                // If found, output the original element and the element from 'secondArray'.
                outputResult(firstArray[currentIteration] + ' ' + (firstArray[currentIteration] + requiredDifference));
                matchFound = true;
                return false; // Stop the loop.
            }
        });
        // If no matching swap was found after checking all elements.
        if (!matchFound)
        {
            outputResult(-1);
        }

        // Clear arrays for the next iteration.
        firstArray = [];
        secondArray = [];
    }
}

// A utility function for iterating a specified number of times.
// Can be called as loopThrough(count, callback) or loopThrough(start, end, callback).
function loopThrough(startIndex, endIndex, iterCallback)
{
    if (iterCallback === undefined) // Handles loopThrough(count, callback) signature
    {
        iterCallback = endIndex;
        endIndex = startIndex;
        startIndex = 0;
    }
    // Loop from startIndex up to (but not including) endIndex.
    for (var currentIteration = startIndex; currentIteration < endIndex; ++currentIteration)
    {
        // If the callback returns 'false', break the loop.
        if (iterCallback(currentIteration) === false)
        {
            break;
        }
    }
}

// Global buffer for accumulating input data.
var dataBuffer = '';

// Function to extract and return the next number from the input buffer.
function readNextNumber()
{
    return +dataBuffer.pop(); // Convert popped string to number.
}
// Function to extract and return the next token (string) from the input buffer.
function readNextToken()
{
    return dataBuffer.pop();
}

// Function to output a value to the console.
function outputResult(valueToDisplay)
{
    console.log(valueToDisplay);
}

// --- Input Handling Setup ---

// Resume standard input stream.
process.stdin.resume();
// Set encoding for incoming data.
process.stdin.setEncoding('utf8');
// Event listener for data chunks.
process.stdin.on('data', function(chunkOfData)
{
    dataBuffer += chunkOfData; // Append incoming data to buffer.
});
// Event listener for end of input stream.
process.stdin.on('end', function()
{
    // Process the accumulated data: trim whitespace, split into tokens, reverse for pop() access.
    dataBuffer = dataBuffer.trim().split(/\s+/).reverse();
    // Start the main processing logic.
    processDataSets();
});