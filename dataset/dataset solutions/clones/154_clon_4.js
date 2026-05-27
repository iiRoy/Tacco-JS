const fs = require('fs');

const KNOWN_SEQUENCES = [
    [13, 12, 11, 10, 9],
    [12, 11, 10, 9, 8],
    [11, 10, 9, 8, 7],
    [10, 9, 8, 7, 6],
    [9, 8, 7, 6, 5],
    [8, 7, 6, 5, 4],
    [7, 6, 5, 4, 3],
    [6, 5, 4, 3, 2],
    [5, 4, 3, 2, 1],
    [13, 12, 11, 10, 1]
];

function checkSequenceMatch(sortedValues) {
    return KNOWN_SEQUENCES.some(pattern =>
        pattern.every((rankInPattern, index) => rankInPattern === sortedValues[index])
    );
}

const rawInputContent = fs.readFileSync(0, 'utf8');
const dataLines = rawInputContent.trim().split('\n');

dataLines.forEach(currentLine => {
    const numericRanks = currentLine.trim().split(',').map(Number).sort((a, b) => b - a);

    let handClassification = "null";

    const rankFrequencyMap = new Map();
    for (const rankValue of numericRanks) {
        rankFrequencyMap.set(rankValue, (rankFrequencyMap.get(rankValue) || 0) + 1);
    }
    const frequencyCounts = Array.from(rankFrequencyMap.values()).sort((a, b) => b - a);

    if (frequencyCounts[0] === 4) {
        handClassification = "four card";
    } else if (frequencyCounts[0] === 3 && frequencyCounts[1] === 2) {
        handClassification = "full house";
    } else if (checkSequenceMatch(numericRanks)) {
        handClassification = "straight";
    }

    console.log(handClassification);
});
