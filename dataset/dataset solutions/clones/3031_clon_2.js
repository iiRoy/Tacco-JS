'use strict';

// This function processes the incoming data to determine a specific condition.
const executeLogic = (rawInputData) => {
    // First, the raw input string is divided into lines, and each line is then split by spaces.
    // This results in an array of arrays, where each inner array contains string segments.
    const processedSegments = rawInputData.split('\n').map(currentSegment => currentSegment.split(' '));

    // Extract and parse the three numerical values from the first line of the processed segments.
    // The radix 10 is explicitly used for safe integer conversion.
    const valueA = parseInt(processedSegments[0][0], 10); // The initial numerical component.
    const valueB = parseInt(processedSegments[0][1], 10); // The secondary numerical component.
    const valueC = parseInt(processedSegments[0][2], 10); // The central numerical component to check.

    // Evaluate if the central numerical component (valueC) lies strictly between
    // the other two numerical components (valueA and valueB).
    // This covers both ascending (A < C < B) and descending (B < C < A) orderings.
    if (valueA < valueC && valueC < valueB) {
        console.log('Yes'); // Output 'Yes' if valueC is strictly between valueA and valueB.
    } else if (valueB < valueC && valueC < valueA) {
        console.log('Yes'); // Output 'Yes' if valueC is strictly between valueB and valueA.
    } else {
        console.log('No');  // Otherwise, output 'No'.
    }
};

// The program starts by reading the entire content from standard input.
// It uses Node.js's 'fs' module to synchronously read the file '/dev/stdin' as UTF-8 encoded text.
// This content is then passed to the main processing function.
executeLogic(require('fs').readFileSync('/dev/stdin', 'utf8'));
