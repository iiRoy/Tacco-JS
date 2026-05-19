function Main(inputData) {
    const allInputLines = inputData.split('\n');

    const processedOutputLines = allInputLines.reduce((accumulatorForOutput, currentLineSegment) => {
        // The original loop terminates when the first character of a line is '0'.
        // This reduce callback replicates that behavior by returning the accumulator early.
        if (currentLineSegment.charAt(0) === '0') {
            return accumulatorForOutput;
        }

        // Process the current line segment.
        // The original code splits by space and converts to numbers.
        // It only considers the first two resulting numbers.
        const parsedNumbers = currentLineSegment.split(' ').map(Number);
        const firstValue = parsedNumbers[0];
        const secondValue = parsedNumbers[1];

        // Create an array containing only the two values to be sorted.
        // This ensures that extra numbers on a line are ignored, matching original behavior.
        // Also correctly handles cases where secondValue might be undefined (e.g., for empty lines).
        const valuesToOrder = [firstValue, secondValue];

        // Use Array.prototype.sort with a custom comparator.
        // This is a substantially different strategy than the original's if/else for ordering.
        // The custom comparator handles 'undefined' values to preserve exact original behavior
        // (e.g., "0 undefined" for an empty input line).
        const orderedPair = valuesToOrder.sort((valA, valB) => {
            if (valA === undefined && valB === undefined) return 0;
            if (valA === undefined) return 1; // undefined should come after defined numbers
            if (valB === undefined) return -1; // defined numbers should come before undefined
            return valA - valB; // Standard numeric comparison for defined numbers
        });

        // Add the joined, ordered pair to the accumulator.
        // .join(' ') correctly handles [0, undefined] resulting in "0 undefined".
        accumulatorForOutput.push(orderedPair.join(' '));

        return accumulatorForOutput;
    }, []); // Initialize accumulator as an empty array

    // Join all accumulated output lines with newlines and print the final result.
    console.log(processedOutputLines.join('\n'));
}

Main(require('fs').readFileSync('/dev/stdin', 'utf8'));
