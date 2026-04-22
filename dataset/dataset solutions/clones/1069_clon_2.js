let incomingData = ''; // This variable will store all the raw input received from stdin

// Attaching an event listener for 'data' chunks from standard input
process.stdin.on('data', (linePart) => {
    // Appending each incoming data segment to our accumulating buffer
    incomingData += linePart;
});

// Attaching an event listener for the 'end' of standard input
process.stdin.on('end', function() {
    // Pre-process the accumulated input:
    // 1. Remove any trailing whitespace from the entire buffer.
    // 2. Split the buffer into an array of lines based on newline characters.
    // 3. For each line, remove any trailing whitespace.
    incomingData = incomingData.replace(/\s*$/, '')
        .split('\n')
        .map((currentLine) => currentLine.replace(/\s*$/, ''));

    // Invoke the primary routine with the second line of processed input.
    // This line is expected to be a space-separated string of numbers,
    // which are converted into an array of actual numbers.
    executeSortingLogic(incomingData[1].split(' ').map((stringValue) => Number(stringValue)));
});

// This function serves as the main entry point for processing the numeric data.
const executeSortingLogic = (numberCollection) => {
    // Perform a single pass of a partitioning algorithm on the entire array.
    // This will reorder elements around a chosen pivot and return its final index.
    const finalPivotIdx = arrangeElements(numberCollection, 0, numberCollection.length - 1);

    // Output the modified array to the console.
    // The element at the final pivot index is highlighted with square brackets.
    console.log(
        numberCollection
            .map((element, elementIndex) => elementIndex === finalPivotIdx ? `[${element}]` : String(element))
            .join(' ')
    );
};

// Implements the Lomuto partition scheme, a key component of the QuickSort algorithm.
const arrangeElements = (targetList, leftEdge, rightEdge) => {
    // Select the last element of the current subarray as the pivot value.
    const chosenPivot = targetList[rightEdge];
    // Initialize an index ('boundaryIdx') to track the boundary between
    // elements smaller than or equal to the pivot, and larger elements.
    let boundaryIdx = leftEdge - 1;

    // Iterate through the subarray from the 'leftEdge' up to (but not including) the 'rightEdge'.
    for (let scanPos = leftEdge; scanPos < rightEdge; scanPos++) {
        // If the current element being scanned is less than or equal to the pivot,
        if (targetList[scanPos] <= chosenPivot) {
            // Increment the 'boundaryIdx' and swap the elements.
            // This moves the smaller element to the left side of the boundary.
            boundaryIdx = boundaryIdx + 1;
            const swapItem1 = targetList[scanPos];
            const swapItem2 = targetList[boundaryIdx];
            targetList[boundaryIdx] = swapItem1;
            targetList[scanPos] = swapItem2;
        }
    }

    // After the loop, place the pivot element in its correct sorted position.
    // It should be placed immediately after all elements smaller than itself.
    const swapItem2 = targetList[rightEdge]; // The pivot itself
    const swapItem1 = targetList[boundaryIdx + 1]; // The element that will be swapped with the pivot
    targetList[boundaryIdx + 1] = swapItem2;
    targetList[rightEdge] = swapItem1;

    // Return the final index of the pivot element.
    return boundaryIdx + 1;
};