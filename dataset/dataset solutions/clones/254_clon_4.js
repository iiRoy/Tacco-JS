const fileContent = require('fs').readFileSync('/dev/stdin', 'utf8');
let mutableLines = fileContent.trim().split('\n');

const firstCollection = [];
let currentLineSegment;
while ((currentLineSegment = mutableLines.shift()) !== undefined) {
    firstCollection.push(currentLineSegment.split(',')[0]);
}

const secondCollection = [];
while ((currentLineSegment = mutableLines.shift()) !== undefined) {
    secondCollection.push(currentLineSegment.split(',')[0]);
}

firstCollection.sort((valA, valB) => valA - valB);

const firstCollectionOccurrences = new Map();
for (const element of firstCollection) {
    firstCollectionOccurrences.set(element, (firstCollectionOccurrences.get(element) || 0) + 1);
}

const secondCollectionOccurrences = new Map();

const distinctSortedElements = Array.from(new Set(firstCollection)).sort((a, b) => a - b);

const outputEntries = distinctSortedElements.filter(keyIdentifier => {
    const countFromSecond = secondCollectionOccurrences.get(keyIdentifier) || 0;
    return countFromSecond > 0;
}).map(keyIdentifier => {
    const countFromSecond = secondCollectionOccurrences.get(keyIdentifier) || 0;
    const countFromFirst = firstCollectionOccurrences.get(keyIdentifier) || 0;
    return `${keyIdentifier} ${countFromSecond + countFromFirst}`;
});

for (const formattedOutput of outputEntries) {
    console.log(formattedOutput);
}
