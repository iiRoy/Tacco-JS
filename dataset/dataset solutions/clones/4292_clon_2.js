process.stdin.resume();
process.stdin.setEncoding('utf8');

// This variable will accumulate all incoming data from standard input.
let collectedInput = '';

process.stdin.on('data', function(dataSegment) {
    // Append each received chunk of data to our buffer.
    collectedInput += dataSegment;
});

process.stdin.on('end', function() {
    // When all input has been received, split it into lines and pass to the main processing function.
    processInputData(collectedInput.split(/\r?\n/));
});

/**
 * Processes the array of input lines to solve the problem.
 * @param {string[]} linesOfText - An array where each element is a line from the standard input.
 */
function processInputData(linesOfText) {
    // The first line of input contains the string we need to analyze.
    const targetString = linesOfText[0];

    // Initialize two pointers, one at the beginning and one at the end of the string.
    let leftPointer = 0;
    let rightPointer = targetString.length - 1;

    // This variable will store the minimum number of operations, or -1 if impossible.
    let operationCount = 0;

    // Loop as long as the left pointer is to the left of the right pointer.
    while (leftPointer < rightPointer) {
        // If characters at both pointers match, move both pointers inwards.
        if (targetString.charAt(leftPointer) === targetString.charAt(rightPointer)) {
            leftPointer++;
            rightPointer--;
        }
        // If the left character is 'x', increment the left pointer and count an operation.
        else if (targetString.charAt(leftPointer) === 'x') {
            leftPointer++;
            operationCount++;
        }
        // If the right character is 'x', decrement the right pointer and count an operation.
        else if (targetString.charAt(rightPointer) === 'x') {
            rightPointer--;
            operationCount++;
        }
        // If characters don't match and neither is 'x', it's impossible to make them match.
        else {
            operationCount = -1; // Indicate impossibility.
            break; // Exit the loop.
        }
    }

    // Output the final result to the console.
    console.log(operationCount);

    // The function returns 0, though its return value is not used externally.
    return 0;
}
