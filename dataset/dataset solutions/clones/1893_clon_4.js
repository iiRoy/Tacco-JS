const nodeIO = require('node:fs');
const rawContent = nodeIO.readFileSync('/dev/stdin', 'utf8');
const lineSegments = rawContent.split('\n');

const firstLineValues = lineSegments[0].split(' ').map(val => parseInt(val, 10));
const universeExtent = firstLineValues[0];
const dataCollectionCount = firstLineValues[1];

const initialCandidates = new Set();
for (let itemIdentifier = 1; itemIdentifier <= universeExtent; itemIdentifier++) {
    initialCandidates.add(itemIdentifier);
}

for (let collectionIndex = 0; collectionIndex < dataCollectionCount; collectionIndex++) {
    const actualDataLineIndex = (collectionIndex * 2) + 2;
    const observedItems = lineSegments[actualDataLineIndex].split(' ').map(val => parseInt(val, 10));
    
    for (const observed of observedItems) {
        initialCandidates.delete(observed);
    }
}

process.stdout.write(initialCandidates.size.toString() + '\n');