// This script processes incoming data to arrange elements based on a pivot value.
function processInput(inputContent) {
    // Clean up input and split it into individual lines.
    const linesArray = inputContent.trim()
                                .split('\n');

    // Extract the total number of elements from the first line.
    const totalElements = Number(linesArray.shift());

    // Parse the array of numbers from the second line.
    const sourceArray = linesArray.shift()
                                .split(' ')
                                .map(Number);

    // Call the sorting/partitioning routine.
    const resultArray = arrangeElements(sourceArray, 0, totalElements);

    // Output the processed array to the console, joined by spaces.
    console.log(resultArray.join(' '));
}

// Function to partition an array around a pivot element.
function arrangeElements(dataCollection, startIndex, endIndex) {
    // Select the last element as the pivot value.
    let pivotValue = dataCollection[endIndex - 1];

    // Initialize an index for the "lower" part of the array.
    let boundaryIndex = startIndex;

    // Iterate through the array from the start index up to (but not including) the pivot.
    for (let currentPos = startIndex, limitIndex = endIndex - 1;
         currentPos < limitIndex;
         currentPos++)
    {
        // If the current element is less than or equal to the pivot,
        // swap it with the element at the boundaryIndex.
        if (dataCollection[currentPos] <= pivotValue) {
            let tempElement = dataCollection[currentPos];
            dataCollection[currentPos] = dataCollection[boundaryIndex];
            dataCollection[boundaryIndex] = tempElement;
            boundaryIndex++; // Move the boundary forward.
        }
    }

    // After the loop, place the pivot value in its correct sorted position.
    let swapPlaceholder = dataCollection[boundaryIndex];
    dataCollection[endIndex - 1] = swapPlaceholder;

    // Format the pivot value for output.
    pivotValue = `[${pivotValue}]`;

    // Place the formatted pivot into the array.
    dataCollection[boundaryIndex] = pivotValue;

    // Return the modified array.
    return dataCollection;
}

// Execute the main processing function with data read from standard input.
processInput( require('fs').readFileSync('/dev/stdin', 'utf8') );