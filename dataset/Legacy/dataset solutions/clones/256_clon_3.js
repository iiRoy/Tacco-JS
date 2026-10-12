const extractAndParseNumber = (inputStringSegment) => {
    const cleanedSegment = inputStringSegment.replace(/\,.*/, "");
    return Number(cleanedSegment);
};

const rawInputData = require('fs').readFileSync('/dev/stdin', 'utf8');

const dataBlocks = rawInputData.trim().split("\n\n");

const primaryNumberList = dataBlocks[0].split("\n").map(extractAndParseNumber);

const secondaryNumberList = dataBlocks[1].split("\n").map(extractAndParseNumber);

primaryNumberList.sort((valA, valB) => {
    return valA - valB;
});

let intersectionCounts = {};

const secondaryListSet = new Set(secondaryNumberList);

primaryNumberList.forEach((currentValue) => {
    if (secondaryListSet.has(currentValue)) {
        if (intersectionCounts[currentValue] === undefined) {
            intersectionCounts[currentValue] = 0;
        }
    }
});

primaryNumberList.forEach((currentValue) => {
    if (intersectionCounts[currentValue] !== undefined) {
        intersectionCounts[currentValue]++;
    }
});

secondaryNumberList.forEach((currentValue) => {
    if (intersectionCounts[currentValue] !== undefined) {
        intersectionCounts[currentValue]++;
    }
});

for (const numberKey in intersectionCounts) {
    console.log(numberKey + " " + intersectionCounts[numberKey]);
}
