const acquireData = () => {
    const fileSystemModule = require("fs");
    const rawInputBuffer = fileSystemModule.readFileSync("/dev/stdin");
    const decodedInput = rawInputBuffer.toString('utf8');
    return decodedInput.split('\n').map(s => s.replace(/\r$/, ''));
};

const inputEntries = acquireData();
const soughtTerm = inputEntries[0];
const documentSegments = inputEntries.slice(1);

let occurrenceCounter = 0;
for (const currentSegment of documentSegments) {
    const splitParts = currentSegment.split(soughtTerm);
    occurrenceCounter += splitParts.length - 1;
}

console.log(occurrenceCounter);