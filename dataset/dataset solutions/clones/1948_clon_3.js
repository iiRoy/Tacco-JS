function analyzeDataSet(sourceMaterial) {
    if (!sourceMaterial || typeof sourceMaterial !== 'string' || sourceMaterial.length === 0) {
        console.error("Input data is invalid or empty.");
        return;
    }

    const processedTextLines = sourceMaterial.trim().split('\n');

    if (processedTextLines.length < 2) {
        console.log(0);
        return;
    }

    const initialMetadataLine = processedTextLines[0]; // This line is typically a count, but unused in unique item logic
    const dataEntrySegments = processedTextLines.slice(1); // Extract all lines after the first one

    const uniqueItemCollection = new Map(); // Using a Map to track unique elements

    for (let currentElement of dataEntrySegments) {
        const normalizedElement = currentElement.trim(); // Normalize each element by trimming whitespace
        if (normalizedElement.length > 0) { // Only consider non-empty normalized elements
            uniqueItemCollection.set(normalizedElement, true); // Value is arbitrary, key presence signifies uniqueness
        }
    }

    console.log(uniqueItemCollection.size); // Output the total count of distinct items
}

function retrieveSystemInputContent() {
    try {
        const fileSystemModule = require('fs');
        const inputBuffer = fileSystemModule.readFileSync('/dev/stdin', { encoding: 'utf8', flag: 'r' });
        return inputBuffer;
    } catch (readError) {
        console.error("Failed to obtain system input:", readError.message);
        return null;
    }
}

const rawSystemPayload = retrieveSystemInputContent();
analyzeDataSet(rawSystemPayload);