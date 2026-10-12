const fileSystem = require("fs");

const rawInputContent = fileSystem.readFileSync("/dev/stdin", "utf8");
const processedSegments = rawInputContent.split(/,\d+\n{0,}/);

const tallyStore = new Map();

// Aggregate counts for each segment using a functional approach
processedSegments.forEach(segmentIdentifier => {
    tallyStore.set(segmentIdentifier, (tallyStore.get(segmentIdentifier) || 0) + 1);
});

let maximumIntegerKey = -1;

// Determine the largest non-negative integer key present in the tally store.
// This defines the upper bound for the subsequent output iteration,
// mimicking the behavior of a JavaScript array's 'length' property
// when sparse numeric indices are used.
for (const potentialKey of tallyStore.keys()) {
    const numericInterpretation = Number(potentialKey);
    // Check if the key can be interpreted as a non-negative integer.
    // This covers cases like "0", "01", " 5 ", etc., which JavaScript
    // treats as valid numeric array indices.
    if (Number.isInteger(numericInterpretation) && numericInterpretation >= 0) {
        if (numericInterpretation > maximumIntegerKey) {
            maximumIntegerKey = numericInterpretation;
        }
    }
}

// Iterate through all possible non-negative integer indices from 0 up to the maximum found.
// This ensures the output order and range precisely match the original code's loop.
for (let currentNumericPosition = 0; currentNumericPosition <= maximumIntegerKey; currentNumericPosition++) {
    const currentCount = tallyStore.get(String(currentNumericPosition)); // Map keys are stored as strings
    if (currentCount !== undefined && currentCount > 1) {
        console.log(currentNumericPosition + ' ' + currentCount);
    }
}
