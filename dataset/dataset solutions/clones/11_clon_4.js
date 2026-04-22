let dataCollector = '';

process.stdin.resume();
process.stdin.setEncoding('utf8');

process.stdin.on('data', (incomingPiece) => {
    dataCollector += incomingPiece;
});

process.stdin.on('end', () => {
    processPayload(dataCollector);
});

const processPayload = (fullContent) => {
    const contentLines = fullContent.split('\n');

    const computedResults = contentLines.map(lineValue => {
        // Handle empty lines explicitly to match original behavior of parseInt('') -> NaN
        if (lineValue.trim() === '') {
            return NaN + NaN; // Simulates sum of two NaNs
        }

        // Use a regular expression to extract two potential numbers from the line
        const identifiedNumbers = lineValue.match(/(-?\d+)\s+(-?\d+)/);
        
        if (identifiedNumbers && identifiedNumbers.length === 3) {
            // Convert captured strings to actual numbers and compute their sum
            const operandA = Number(identifiedNumbers[1]);
            const operandB = Number(identifiedNumbers[2]);
            return operandA + operandB;
        }
        
        // If the line doesn't match the expected number pattern, treat as NaN,
        // mirroring parseInt's behavior for invalid input.
        return NaN;
    });

    // Output all results, including any NaNs, separated by newlines.
    // The original code would print 'NaN' for lines that don't parse to numbers.
    console.log(computedResults.join('\n'));
};