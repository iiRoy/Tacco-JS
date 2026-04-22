const charMapping = new Map([
    ['?', 1], // Represents question mark
    ['P', 2], // Represents 'P'
    ['D', 3]  // Represents 'D'
]);

function processSourceText(sourceString) {
    let currentOffset = 0;
    const outputFragments = [];

    const traverseAndTransform = (segmentOffset) => {
        if (segmentOffset >= sourceString.length) {
            return; // End of input
        }

        // Attempt to match a two-character pattern first
        if (segmentOffset + 1 < sourceString.length) {
            const initialChar = sourceString[segmentOffset];
            const nextChar = sourceString[segmentOffset + 1];

            const initialVal = charMapping.get(initialChar);
            const nextVal = charMapping.get(nextChar);

            // Condition: (initialChar === '?' || initialChar === 'P') && (nextChar === '?' || nextChar === 'D')
            const isInitialPartMatch = (initialVal === 1 || initialVal === 2);
            const isNextPartMatch = (nextVal === 1 || nextVal === 3);

            if (isInitialPartMatch && isNextPartMatch) {
                outputFragments.push("PD");
                currentOffset = segmentOffset + 2; // Advance by two characters
                traverseAndTransform(currentOffset);
                return;
            }
        }

        // If no two-character match, check for a single '?'
        if (charMapping.get(sourceString[segmentOffset]) === 1) { // Is '?'
            outputFragments.push("D");
            currentOffset = segmentOffset + 1; // Advance by one character
            traverseAndTransform(currentOffset);
            return;
        }

        // Otherwise, append the character as-is
        outputFragments.push(sourceString[segmentOffset]);
        currentOffset = segmentOffset + 1; // Advance by one character
        traverseAndTransform(currentOffset);
    };

    traverseAndTransform(currentOffset);
    return outputFragments.join('');
}

let receivedDataBuffer = '';
let processedFirstLine = false;

process.stdin.setEncoding('utf8');

process.stdin.on('data', (inputChunk) => {
    if (processedFirstLine) {
        return; // Ignore further input once the first line is handled
    }
    
    receivedDataBuffer += inputChunk;
    const newlinePosition = receivedDataBuffer.indexOf('\n');

    if (newlinePosition !== -1) {
        const primaryLine = receivedDataBuffer.substring(0, newlinePosition);
        process.stdout.write(processSourceText(primaryLine));
        process.stdout.write('\n'); // Mimic console.log's newline
        processedFirstLine = true;
        process.stdin.destroy(); // Stop listening for more input
    }
});

process.stdin.on('end', () => {
    if (!processedFirstLine) {
        // If no newline was encountered, or the input was empty,
        // process whatever is in the buffer (which might be empty).
        process.stdout.write(processSourceText(receivedDataBuffer));
        process.stdout.write('\n');
    }
});