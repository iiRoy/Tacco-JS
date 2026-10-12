const sourceData = require('fs').readFileSync('/dev/stdin', 'utf8');
const dataSegments = sourceData.trim().split('\n');

const processAllBlocks = (segments) => {
    let currentSegmentPointer = 0;
    const blockOutcomes = [];

    while (currentSegmentPointer < segments.length) {
        const currentBlockSize = Number(segments[currentSegmentPointer++]);
        if (currentBlockSize === 0) {
            break;
        }

        const blockEntries = [];
        for (let k = 0; k < currentBlockSize; k++) {
            const parts = segments[currentSegmentPointer++].split(' ').map(Number);
            blockEntries.push({
                initialWeight: parts[0],
                rangeStart: parts[1],
                rangeEnd: parts[2]
            });
        }

        blockOutcomes.push(evaluateCurrentBlock(blockEntries));
    }
    return blockOutcomes;
};

const evaluateCurrentBlock = (entries) => {
    const thresholdValue = 150;

    const isAnyEntryExceeding = entries.some((currentEntry, currentEntryIndex) => {
        const currentEntryWeight = currentEntry.initialWeight;
        const currentEntryRangeStart = currentEntry.rangeStart;
        const currentEntryRangeEnd = currentEntry.rangeEnd;

        const totalEffectiveWeight = entries.reduce((accumulator, otherEntry, otherEntryIndex) => {
            if (currentEntryIndex === otherEntryIndex) {
                return accumulator;
            }

            const otherEntryRangeStart = otherEntry.rangeStart;
            const otherEntryRangeEnd = otherEntry.rangeEnd;

            if (currentEntryRangeStart < otherEntryRangeEnd && currentEntryRangeEnd > otherEntryRangeStart) {
                return accumulator + otherEntry.initialWeight;
            } else {
                return accumulator;
            }
        }, currentEntryWeight);

        return totalEffectiveWeight > thresholdValue;
    });

    return isAnyEntryExceeding ? "NG" : "OK";
};

processAllBlocks(dataSegments).forEach(console.log);
