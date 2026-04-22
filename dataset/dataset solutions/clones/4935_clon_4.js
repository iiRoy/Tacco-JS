'use strict';

function evaluateCandidateSet(sourceData) {
    const segmentedSource = sourceData.replace(/^\s+|\s+$/g, '').split('\n');
    const numericalConstraints = segmentedSource[0].split(' ').map(strVal => parseInt(strVal, 10));
    const participantIdentifiers = segmentedSource[1].split('');

    const thresholdA = numericalConstraints[1];
    const thresholdB = numericalConstraints[2];
    const cumulativeThreshold = thresholdA + thresholdB;

    const primaryType = 'a';
    const secondaryType = 'b';

    participantIdentifiers.forEach((currentEntity, positionIndex, entireSequence) => {
        const sequenceOrder = positionIndex + 1;

        let lineResult;

        if (currentEntity === primaryType) {
            lineResult = (sequenceOrder < cumulativeThreshold) ? 'Yes' : 'No';
        } else if (currentEntity === secondaryType) {
            const precedingForeigners = entireSequence.slice(0, positionIndex).filter(p => p === secondaryType).length;
            lineResult = (sequenceOrder < cumulativeThreshold && sequenceOrder < precedingForeigners) ? 'Yes' : 'No';
        } else {
            lineResult = 'No';
        }
        outputVerdict(lineResult + '\n');
    });
}

const outputVerdict = (contentString) => process.stdout.write(contentString);

const acquireExternalData = () => {
    const fileSystemUtility = require('fs');
    const standardInputPath = '/dev/stdin';
    const encodingFormat = 'utf8';
    return fileSystemUtility.readFileSync(standardInputPath, encodingFormat);
};

evaluateCandidateSet(acquireExternalData());