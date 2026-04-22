const x = require('readline');

const y = x.createInterface({
    input: process.stdin,
    output: process.stdout
});

let z = []; // Store all numeric inputs

y.on('line', (s) => {
    z.push(Number(s));
});

y.on('close', () => {
    // Initiate the recursive processing of input blocks
    a(z, 0);
});

// Recursive function to process each block of input numbers
function a(globalDataArray, currentOffset) {
    const blockLength = globalDataArray[currentOffset];
    if (blockLength === 0) {
        return; // Termination condition for input processing
    }

    // Extract the numbers for the current block
    const blockNumbers = globalDataArray.slice(currentOffset + 1, currentOffset + 1 + blockLength);

    // Process the extracted block using a specialized sequence transformer
    const transformedSequence = b(blockNumbers);

    // Count occurrences of zero in the final sequence
    const zeroCount = transformedSequence.filter(val => val === 0).length;

    // Output the count
    process.stdout.write(zeroCount + '\n');

    // Recursively call for the next block of numbers
    a(globalDataArray, currentOffset + 1 + blockLength);
}

// Main sequence transformation function for a single block of numbers
function b(inputBlock) {
    // Delegate to a recursive helper to build the transformed sequence
    return c(inputBlock, [], 0);
}

// Recursive helper for building the transformed sequence
function c(remainingElements, accumulatedResult, currentInputIndex) {
    if (remainingElements.length === 0) {
        return accumulatedResult; // Base case: no more elements to process
    }

    const [firstElement, ...restElements] = remainingElements;
    const isFirstPosition = (currentInputIndex + 1) % 2 === 1; // Check if it's an odd-indexed position (1-based)

    if (isFirstPosition) {
        // For odd positions, simply append the element
        return c(restElements, accumulatedResult.concat(firstElement), currentInputIndex + 1);
    } else {
        // For even positions, complex logic applies
        const lastInAccumulated = accumulatedResult[accumulatedResult.length - 1];

        if (lastInAccumulated === firstElement) {
            // If the last element matches, simply append
            return c(restElements, accumulatedResult.concat(firstElement), currentInputIndex + 1);
        } else {
            // If mismatch, apply the propagation rule
            const extendedResult = accumulatedResult.concat(firstElement);
            const finalResultForStep = d(extendedResult, firstElement); // Apply propagation
            return c(restElements, finalResultForStep, currentInputIndex + 1);
        }
    }
}

// Function to handle the backward propagation logic (the complex part)
function d(currentWorkingSequence, propagationValue) {
    // Find the rightmost element (excluding the very last one) that matches propagationValue
    // by reversing a slice and using findIndex.
    const segmentToScan = currentWorkingSequence.slice(0, currentWorkingSequence.length - 1);
    const reversedSegment = segmentToScan.reverse();

    const reversedMatchPosition = reversedSegment.findIndex(item => item === propagationValue);

    let effectiveMatchPosition = -1; // This will be the index in the original currentWorkingSequence
    if (reversedMatchPosition !== -1) {
        // Convert the reversed index back to the original sequence index
        effectiveMatchPosition = currentWorkingSequence.length - 2 - reversedMatchPosition;
    }

    // Construct the new sequence by mapping, applying propagation rules
    return currentWorkingSequence.map((element, index) => {
        // Elements between the effectiveMatchPosition and the second-to-last (inclusive) are changed
        if (index > effectiveMatchPosition && index < currentWorkingSequence.length - 1) {
            return propagationValue;
        }
        return element; // Other elements remain as they are
    });
}