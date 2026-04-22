const streamProcessor = require('node:fs');

const extractAndTally = (dataSegment) => {
    const numericCounts = new Map();
    dataSegment.split('\n')
        .filter(lineContent => lineContent.trim().length > 0)
        .forEach(lineContent => {
            const numericalPart = parseInt(lineContent, 10);
            if (!Number.isNaN(numericalPart)) {
                numericCounts.set(numericalPart, (numericCounts.get(numericalPart) || 0) + 1);
            }
        });
    return numericCounts;
};

const acquiredData = streamProcessor.readFileSync('/dev/stdin', 'utf8');

const contentBlocks = acquiredData.trim().split(/\n\s*\n/);

const primaryTally = extractAndTally(contentBlocks[0]);
const secondaryTally = extractAndTally(contentBlocks[1]);

const finalAggregations = new Map();

for (const [digitValue, firstCount] of primaryTally.entries()) {
    if (secondaryTally.has(digitValue)) {
        const combinedTotal = firstCount + secondaryTally.get(digitValue);
        finalAggregations.set(digitValue, combinedTotal);
    }
}

const displayResults = Array.from(finalAggregations.entries())
    .sort((pairOne, pairTwo) => pairOne[0] - pairTwo[0])
    .map(([valKey, valCount]) => `${valKey} ${valCount}`);

console.log(displayResults.join('\n'));