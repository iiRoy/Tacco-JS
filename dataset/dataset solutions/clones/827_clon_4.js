const dataStream = require('node:fs').readFileSync('/dev/stdin', 'utf8');
const lineSegments = dataStream.trim().split('\n');

function processDataBlocks(allSegments, currentLineIndex) {
    if (currentLineIndex >= allSegments.length || currentLineIndex < 0) {
        return;
    }

    const blockEntryCount = Number(allSegments[currentLineIndex]);

    if (blockEntryCount === 0) {
        return;
    }

    const blockRecords = [];
    const nextBlockStartIndex = currentLineIndex + blockEntryCount + 1;

    for (let currentEntryIdx = 0; currentEntryIdx < blockEntryCount; ++currentEntryIdx) {
        const dataLine = allSegments[currentLineIndex + 1 + currentEntryIdx];
        const parts = dataLine.split(' ');

        const labelIdentifier = parts[0];
        const beta = Number(parts[1]);
        const gamma = Number(parts[2]);
        const delta = Number(parts[3]);
        const epsilon = Number(parts[4]);
        const zeta = Number(parts[5]);
        const eta = Number(parts[6]);
        const theta = Number(parts[7]);
        const iota = Number(parts[8]);
        const kappa = Number(parts[9]);

        const durationMetric = gamma + delta + epsilon + ((zeta + eta) * kappa);
        const valueMeasure = (theta * iota * kappa) - beta;

        blockRecords.push({
            label: labelIdentifier,
            ratio: valueMeasure / durationMetric,
            originalOrder: currentEntryIdx
        });
    }

    for (let outerPosition = 0; outerPosition < blockRecords.length - 1; ++outerPosition) {
        let maxIndex = outerPosition;
        for (let innerPosition = outerPosition + 1; innerPosition < blockRecords.length; ++innerPosition) {
            const currentMax = blockRecords[maxIndex];
            const candidate = blockRecords[innerPosition];

            if (candidate.ratio > currentMax.ratio) {
                maxIndex = innerPosition;
            } else if (candidate.ratio === currentMax.ratio) {
                if (candidate.originalOrder < currentMax.originalOrder) {
                    maxIndex = innerPosition;
                }
            }
        }
        if (maxIndex !== outerPosition) {
            const temporary = blockRecords[outerPosition];
            blockRecords[outerPosition] = blockRecords[maxIndex];
            blockRecords[maxIndex] = temporary;
        }
    }

    for (const record of blockRecords) {
        console.log(record.label);
    }
    console.log("#");

    processDataBlocks(allSegments, nextBlockStartIndex);
}

processDataBlocks(lineSegments, 0);