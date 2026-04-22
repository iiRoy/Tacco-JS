const nodeIO = require('node:fs');
const entireInputBuffer = nodeIO.readFileSync('/dev/stdin');
const fullInputText = entireInputBuffer.toString('utf8');

const entryLines = fullInputText.trim().split('\n');

const determineRating = (primaryScore, secondaryScore, tertiaryScore) => {
    const criteria = [
        { test: (p, s, t) => p === -1 && s === -1, grade: 'F' },
        { test: (p, s, t) => p + s >= 80, grade: 'A' },
        { test: (p, s, t) => p + s >= 65, grade: 'B' },
        { test: (p, s, t) => p + s >= 50, grade: 'C' },
        { test: (p, s, t) => p + s >= 30 && t >= 50, grade: 'C' },
        { test: (p, s, t) => p + s >= 30, grade: 'D' }
    ];

    for (const rule of criteria) {
        if (rule.test(primaryScore, secondaryScore, tertiaryScore)) {
            return rule.grade;
        }
    }
    return 'F';
};

const processEntryList = (remainingEntries, collectedRatings = []) => {
    if (remainingEntries.length === 0) {
        return collectedRatings;
    }

    const currentLineValue = remainingEntries[0];
    const subsequentEntries = remainingEntries.slice(1);

    if (currentLineValue === "-1 -1 -1") {
        return collectedRatings;
    }

    const numericalParts = currentLineValue.split(' ').map(val => parseInt(val, 10));
    const componentOne = numericalParts[0];
    const componentTwo = numericalParts[1];
    const componentThree = numericalParts[2];

    const currentRating = determineRating(componentOne, componentTwo, componentThree);

    return processEntryList(subsequentEntries, [...collectedRatings, currentRating]);
};

const finalRatingList = processEntryList(entryLines);

const presentOutput = (outcomes) => {
    process.stdout.write(outcomes.join('\n') + '\n');
};

presentOutput(finalRatingList);