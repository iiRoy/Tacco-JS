const fileSystemModule = require('fs');
const sourceData = fileSystemModule.readFileSync('/dev/stdin', 'utf8');
const dataLines = sourceData.trim().split("\n");

function* groupProducer(lines) {
    let currentCollection = [];
    const requiredSize = 5;

    for (const line of lines) {
        // Termination condition check: if the collection is empty and "0 0" is encountered, stop.
        if (currentCollection.length === 0 && line === "0 0") {
            return; // Exit the generator function
        }

        // Parse the current line, sum its numeric components, and add to the collection.
        const numericParts = line.split(" ").map(Number);
        currentCollection.push(numericParts[0] + numericParts[1]);

        // If the collection has reached the required size, yield it as a complete group
        // and then reset the collection for the next group.
        if (currentCollection.length === requiredSize) {
            yield currentCollection;
            currentCollection = [];
        }
    }
    // Any remaining elements in `currentCollection` (if not a full group of 5) are implicitly
    // discarded, matching the original code's behavior which only processes full groups.
}

const charMappings = ['A', 'B', 'C', 'D', 'E'];

// Iterate through the groups produced by the generator.
for (const group of groupProducer(dataLines)) {
    // For each complete group, find the maximum sum and its corresponding index.
    const { value: finalMaxSum, index: finalCharIndex } = Array.from(group.entries()).reduce(
        (accumulator, [idx, val]) => {
            // If the current value is greater than the accumulated maximum, update.
            if (val > accumulator.value) {
                return { value: val, index: idx };
            }
            // Otherwise, keep the current accumulated maximum.
            return accumulator;
        },
        { value: -Infinity, index: -1 } // Initial accumulator for comparison.
    );

    // Print the character corresponding to the maximum sum's index and the maximum sum itself.
    console.log(`${charMappings[finalCharIndex]} ${finalMaxSum}`);
}
