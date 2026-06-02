const fileSystemModule = require('fs');

const processInputLines = (sourceTextContent) => {
    const allTextLines = sourceTextContent.trim().split('\n');
    let currentLineIndex = 0;
    let collectedSumsForGroup = [];

    while (currentLineIndex < allTextLines.length) {
        const currentLineString = allTextLines[currentLineIndex];

        // Exit condition: "0 0" encountered when the current group is empty
        if (collectedSumsForGroup.length === 0 && currentLineString === "0 0") {
            break;
        }

        // Parse numbers and calculate sum
        const lineNumericParts = currentLineString.split(' ').map(Number);
        const calculatedPairSum = lineNumericParts[0] + lineNumericParts[1];
        collectedSumsForGroup.push(calculatedPairSum);

        // When a group of 5 sums is complete, process it
        if (collectedSumsForGroup.length === 5) {
            // Find the maximum value and its original index within the group
            // This uses a different strategy than the original's `reduce` then `indexOf`
            const sumEntriesWithIndices = collectedSumsForGroup.map((value, index) => ({ value, index }));

            const highestEntry = sumEntriesWithIndices.reduce((accumulator, currentItem) => {
                return (currentItem.value > accumulator.value) ? currentItem : accumulator;
            }, { value: -Infinity, index: -1 }); // Initialize with a very low value

            // Determine the corresponding character ('A' through 'E')
            const resultCharacter = String.fromCharCode('A'.charCodeAt(0) + highestEntry.index);

            // Output the result immediately
            console.log(`${resultCharacter} ${highestEntry.value}`);

            // Reset the collection for the next group
            collectedSumsForGroup = [];
        }
        currentLineIndex++;
    }
};

// Read input from stdin and initiate processing
processInputLines(fileSystemModule.readFileSync('/dev/stdin', 'utf8'));
