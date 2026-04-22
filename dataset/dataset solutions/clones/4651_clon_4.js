const sourceData = process.stdin.readFileSync(0, "utf8");

const lineSegments = sourceData.trim().split('\n');

const relevantSegments = lineSegments.filter((segment, index, allSegments) => {
    const isNotFirst = index > 0;
    const isNotLast = index < allSegments.length - 1;
    return isNotFirst && isNotLast;
});

if (relevantSegments.length === 0) {
    console.log("");
    process.exit(0);
}

const generateSymbolFrequency = (textSegment) => {
    const symbolCounts = new Map();
    for (const character of textSegment) {
        symbolCounts.set(character, (symbolCounts.get(character) || 0) + 1);
    }
    return symbolCounts;
};

const aggregatedSymbolData = new Map();
const totalRelevantLines = relevantSegments.length;

relevantSegments.forEach((segment, segmentIndex) => {
    const currentSegmentFrequencies = generateSymbolFrequency(segment);

    for (const [symbol, count] of currentSegmentFrequencies) {
        if (!aggregatedSymbolData.has(symbol)) {
            aggregatedSymbolData.set(symbol, new Array(totalRelevantLines).fill(0));
        }
        aggregatedSymbolData.get(symbol)[segmentIndex] = count;
    }
});

const finalCommonCounts = new Map();

for (const [symbolKey, occurrenceList] of aggregatedSymbolData) {
    finalCommonCounts.set(symbolKey, Math.min(...occurrenceList));
}

const constructedParts = [];
for (const [symbolKey, finalCount] of finalCommonCounts) {
    if (finalCount > 0) {
        constructedParts.push(symbolKey.repeat(finalCount));
    }
}

constructedParts.sort();

console.log(constructedParts.join(''));