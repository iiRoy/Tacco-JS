process.stdin.resume();
process.stdin.setEncoding('utf8'); // Set the encoding for incoming data.

process.stdin.on('data', function(incomingChunk) {
    // Process the received data chunk.
    const dataLines = incomingChunk.toString().split('\n');

    const finalOutput = (function(parsedValue) {
        // Create a sequence of numbers and filter them based on specific criteria.
        return new NumberSequence(1, parsedValue)
            .filter(function(currentNum) {
                // Check if the number is divisible by 3, or contains the digit 3.
                return (
                    (currentNum % 3 === 0) ||
                    (currentNum % 10 === 3) ||
                    (Math.floor(currentNum / 10) === 3) || // Check if tens digit is 3 (for 30-39)
                    (Math.floor(currentNum / 10) % 10 === 3) // Check if tens digit is 3 (for 130-139, etc.)
                );
            })
            .join(' '); // Join the filtered numbers with spaces.

    }(parseInt(dataLines[0], 10))); // Parse the first line of input as an integer.

    // Output the result or an empty line if no result.
    if (finalOutput) {
        console.log('', finalOutput);
    } else {
        console.log();
    }

    /**
     * Generates an array of integers within a specified range.
     * @param {number} startPoint - The starting integer (inclusive).
     * @param {number} endPoint - The ending integer (inclusive).
     * @returns {number[]} An array containing integers from startPoint to endPoint.
     */
    function NumberSequence(startPoint, endPoint) {
        const sequenceElements = [];
        for (let idx = startPoint; idx <= endPoint; ++idx) {
            sequenceElements.push(idx);
        }
        return sequenceElements;
    }
});
