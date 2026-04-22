var fileSystem = require('fs');
var inputData = fileSystem.readFileSync('/dev/stdin', 'utf8');
var lines = inputData.trim().split('\n');
let currentLineIndex = 0; // Using let for block scope

// Helper function to parse and increment index
const getNumericLine = (lineArray, idxRef) => {
    return parseInt(lineArray[idxRef.value++], 10);
};

// Main processing loop
while (true) {
    let currentBlockSize = getNumericLine(lines, { value: currentLineIndex });

    if (currentBlockSize === 0) {
        break; // Exit condition
    }

    let blockElements = [];
    let originalBlockSize = currentBlockSize; // Store original for validation if needed

    // Populate blockElements for the current block
    for (let j = 0; j < originalBlockSize; j++) {
        blockElements.push(getNumericLine(lines, { value: currentLineIndex }));
    }

    let processedSequence = [];
    let toggle = false; // Renamed 'flag' to 'toggle' for clarity
    const zeroValue = 0; // Introducing a constant for the value 0

    // Process each element in the current block
    for (let k = 0; k < blockElements.length; k++) {
        let currentElement = blockElements[k];
        toggle = !toggle; // Invert toggle state

        if (toggle) {
            // If toggle is true, simply add the element
            processedSequence.push(currentElement);
        } else {
            // If toggle is false, apply special logic
            const lastProcessed = processedSequence[processedSequence.length - 1];

            if (lastProcessed === currentElement) {
                // If the last element is the same, add current
                processedSequence.push(currentElement);
            } else {
                // If different, add current and then propagate change backwards
                processedSequence.push(currentElement);
                let backwardIndex = processedSequence.length - 2; // Start from element before the newly added one

                // Loop to propagate the change
                while (backwardIndex >= 0) {
                    if (processedSequence[backwardIndex] === currentElement) {
                        break; // Stop if we find an element matching currentElement
                    } else {
                        processedSequence[backwardIndex] = currentElement; // Update the element
                        backwardIndex--; // Move to the previous element
                    }
                }
            }
        }
    }

    let zeroCount = 0;
    // Iterate through the final processed sequence to count zeros
    for (let l = 0; l < processedSequence.length; l++) {
        if (processedSequence[l] === zeroValue) {
            zeroCount++;
        }
    }
    console.log(zeroCount); // Output the final count
}