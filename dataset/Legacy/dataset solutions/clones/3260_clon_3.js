'use strict'

function checkAllZeros(inputArray) {
    // This function checks if all elements in the given array are zero.
    // It uses Array.prototype.every, which is a structural modification
    // from the original for...of loop, while maintaining identical behavior.
    return inputArray.every(currentElement => currentElement === 0);
}

function processInputData(rawDataString) {
    // Split the raw input string into an array of lines.
    // The original used Array.from(input.split('\n')), but Array.from is redundant here.
    const linesArray = rawDataString.split('\n');

    // Parse the first line to get the array size (N).
    // Using Number.parseInt for consistency.
    const arraySize = Number.parseInt(linesArray[0], 10);

    // Process the second line to extract the height values.
    // This step is split into two for an intermediate variable.
    const heightStrings = linesArray[1].split(' ');
    const heightsArray = heightStrings.map((item) => Number.parseInt(item, 10));

    // Initialize a counter for the operations performed.
    let operationCount = 0;

    // The main loop continues as long as there are non-zero heights.
    while (!checkAllZeros(heightsArray)) {
        // Find the maximum height value in the current array.
        // Using Math.max with the spread operator is an alternative to Array.prototype.reduce.
        const currentMaxHeight = Math.max(...heightsArray);

        // Determine the starting index of the first occurrence of the maximum height.
        const startIndexOfMax = heightsArray.indexOf(currentMaxHeight);

        // Find the end index of the contiguous block of elements that share the maximum height.
        let endIndexOfMax = startIndexOfMax;
        // Introduce a temporary variable to iterate and find the end index,
        // making the boundary check explicit.
        let tempCheckIndex = startIndexOfMax;
        while (tempCheckIndex + 1 < heightsArray.length && heightsArray[tempCheckIndex + 1] === currentMaxHeight) {
            tempCheckIndex++;
        }
        endIndexOfMax = tempCheckIndex; // Assign the final determined end index.

        // Decrement all elements within the identified contiguous block of maximum heights.
        // This replaces the creation of an intermediate 'maxValRange' array and a for...of loop
        // with a direct standard for loop, which is a structural modification.
        for (let k = startIndexOfMax; k <= endIndexOfMax; k++) {
            heightsArray[k]--;
        }

        // Increment the operation counter after each decrement cycle.
        operationCount++;
    }

    // Output the total number of operations performed.
    console.log(operationCount);
}

// Read input from standard input and pass it to the processing function.
processInputData(require('fs').readFileSync('/dev/stdin', 'utf8'));
