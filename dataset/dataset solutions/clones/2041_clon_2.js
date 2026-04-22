'use strict';

function ProcessStringData(incomingText)
{
    // The initial input string is cleaned from surrounding whitespace,
    // then fragmented into an array of individual characters.
    let characterSequence = incomingText.trim().split('');

    // Establish critical dimensions and boundary indicators for string segmentation.
    const totalCharCount = characterSequence.length;
    let leftBoundaryIndex = (totalCharCount - 1) / 2;
    let rightBoundaryIndex = (totalCharCount + 3) / 2;

    // Initialize containers for the two derived sub-partitions of the string.
    let firstPartition = [];
    let secondPartition = [];

    // Conduct the initial palindromic check on the entire character sequence.
    // This loop iterates through the first half of the sequence.
    for (
        let currentIdx = 0;
        currentIdx < Math.floor(characterSequence.length / 2);
        currentIdx++
    ) {
        // Calculate the corresponding index from the opposite end of the sequence.
        let mirrorIdx = characterSequence.length - 1 - currentIdx;

        // If any character pair at symmetric positions does not match, the condition fails.
        if (characterSequence[currentIdx] !== characterSequence[mirrorIdx]) {
            console.log('No'); // Output the negative outcome.
            return;            // Terminate further execution.
        }
    }

    // Populate the first string partition based on the calculated left boundary.
    for (let loopCounter = 0; loopCounter < leftBoundaryIndex; loopCounter++) {
        firstPartition.push(characterSequence[loopCounter]);
    }

    // Populate the second string partition starting from its calculated right boundary index.
    for (let loopCounter = rightBoundaryIndex - 1; loopCounter < totalCharCount; loopCounter++) {
        secondPartition.push(characterSequence[loopCounter]);
    }

    // Perform a palindromic validation on the 'firstPartition'.
    // This loop checks characters from the start and end of this segment.
    for (let iterationIdx = 0; iterationIdx < Math.floor(firstPartition.length / 2); iterationIdx++) {
        // Determine the symmetrical position within 'firstPartition'.
        let symmetricIdx = firstPartition.length - 1 - iterationIdx;

        // If characters are not identical at symmetric points, the condition is not met.
        if (firstPartition[iterationIdx] !== firstPartition[symmetricIdx]) {
            console.log('No'); // Signal failure.
            return;            // Halt the function.
        }
    }

    // Execute a palindromic validation for the 'secondPartition'.
    // This loop compares elements from both extremities of the segment.
    for (let posIdx = 0; posIdx < Math.floor(secondPartition.length / 2); posIdx++) {
        // Find the corresponding index at the other end of 'secondPartition'.
        let oppositeIdx = secondPartition.length - 1 - posIdx;

        // If a mismatch is found between characters at mirrored positions, the check fails.
        if (secondPartition[posIdx] !== secondPartition[oppositeIdx]) {
            console.log('No'); // Indicate a negative result.
            return;            // Conclude the function's operation.
        }
    }

    // If all preceding checks have passed without returning, the string structure is valid.
    console.log('Yes'); // Affirmative output.
}


// This segment handles standard I/O, fetching data to be processed by the main routine.
// It should not be modified as it interacts with the execution environment.
ProcessStringData(require("fs").readFileSync("/dev/stdin", "utf8"));