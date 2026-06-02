var rawData = require('fs').readFileSync('/dev/stdin', 'utf8');
var lineEntries = (rawData.trim()).split("\n");
var bloodTypeCounts = [0, 0, 0, 0]; // Index 0: A, 1: B, 2: AB, 3: O

const bloodTypeToIndexMap = new Map([
    ["A", 0],
    ["B", 1],
    ["AB", 2],
    ["O", 3]
]);

function tallyBloodType(currentLineSegment) {
    const lineParts = currentLineSegment.split(",");
    const typeIdentifier = lineParts[1];

    const targetIndex = bloodTypeToIndexMap.get(typeIdentifier);
    if (targetIndex !== undefined) {
        bloodTypeCounts[targetIndex]++;
    }
}

lineEntries.forEach(tallyBloodType);

console.log(bloodTypeCounts[0]);
console.log(bloodTypeCounts[1]);
console.log(bloodTypeCounts[2]);
console.log(bloodTypeCounts[3]);
