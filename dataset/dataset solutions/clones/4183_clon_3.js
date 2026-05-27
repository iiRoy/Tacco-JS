const INPUT_FILE_PATH = '/dev/stdin';
const fileContent = require('fs').readFileSync(INPUT_FILE_PATH, 'utf8');
const inputLines = fileContent.split('\n');

const firstLineParts = inputLines.shift().split(' ');
const numElements = parseInt(firstLineParts[0], 10);
const numUniqueKeep = parseInt(firstLineParts[1], 10);

const elementsArray = inputLines.shift().split(' ');

const elementFrequencies = []; // Stores counts, where index is the element value (as number)
const seenElementsTracker = {}; // Tracks unique elements encountered (as strings)

for (let elementIndex = 0; elementIndex < numElements; elementIndex++) {
    const currentElementValue = elementsArray[elementIndex];
    const existingFrequency = elementFrequencies[currentElementValue] || 0;
    elementFrequencies[currentElementValue] = existingFrequency + 1;
    seenElementsTracker[currentElementValue] = true; // Mark as seen
}

const uniqueElementKeys = Object.keys(seenElementsTracker);
const distinctElementCount = uniqueElementKeys.length;

const elementsToEliminateCount = distinctElementCount - numUniqueKeep;

if (elementsToEliminateCount > 0) {
    // Extract only the actual frequency values from the sparse array
    const allFrequencies = Object.values(elementFrequencies);

    // Sort the frequencies in ascending order
    allFrequencies.sort((frequencyA, frequencyB) => frequencyA - frequencyB);

    let totalRemovedCount = 0;
    // Sum the smallest frequencies corresponding to elements that need to be eliminated
    for (let i = 0; i < elementsToEliminateCount; i++) {
        totalRemovedCount += allFrequencies[i];
    }
    console.log(totalRemovedCount);
} else {
    console.log(0);
}
