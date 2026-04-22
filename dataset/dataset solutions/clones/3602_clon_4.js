'use strict';

(function() {
    const fileSystem = require('fs');
    const standardOutput = process.stdout;

    const fullContent = fileSystem.readFileSync('/dev/stdin', 'utf-8');
    
    let currentIdx = 0;
    let pieceOne = '';
    let pieceTwo = '';
    
    // Manually locate the first space to extract the first token
    let endOfFirstSegment = fullContent.indexOf(' ', currentIdx);
    
    if (endOfFirstSegment === -1) {
        // If no spaces are found, the entire content is considered the first token
        pieceOne = fullContent;
    } else {
        // Extract the first token from the start up to the first space
        pieceOne = fullContent.substring(currentIdx, endOfFirstSegment);
        currentIdx = endOfFirstSegment + 1; // Move past the first space
        
        // Manually locate the second space to extract the second token
        let endOfSecondSegment = fullContent.indexOf(' ', currentIdx);
        if (endOfSecondSegment === -1) {
            // If no more spaces are found, the rest of the string is the second token
            pieceTwo = fullContent.substring(currentIdx);
        } else {
            // Extract the second token from the current position up to the second space
            pieceTwo = fullContent.substring(currentIdx, endOfSecondSegment);
        }
    }

    // Custom parsing logic to mimic parseInt's behavior:
    // An empty string or a string containing only whitespace results in NaN.
    // Otherwise, convert using the Number constructor.
    const firstValue = (pieceOne.trim() === '') ? NaN : Number(pieceOne);
    const secondValue = (pieceTwo.trim() === '') ? NaN : Number(pieceTwo);

    // Perform the calculation: (X - 1) * (Y - 1)
    // Using bitwise NOT operator for -1 as a divergent syntax.
    const operationResult = (firstValue + ~0) * (secondValue + ~0);

    // Output the result using process.stdout.write for divergent output mechanism
    standardOutput.write(operationResult + '\n');
})();