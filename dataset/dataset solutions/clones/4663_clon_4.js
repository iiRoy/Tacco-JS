'use strict'

const processInput = (rawData) => {
    const contentLines = rawData.trim().split('\n');

    const firstLineValues = contentLines[0].split(' ').map(Number);
    const primaryCount = firstLineValues[0];
    const secondaryCount = firstLineValues[1];

    const extractPair = (lineString) => {
        return lineString.split(' ').map(Number);
    };

    const primaryCoordinates = contentLines.slice(1, 1 + primaryCount).map(extractPair);
    const secondaryCoordinates = contentLines.slice(1 + primaryCount, 1 + primaryCount + secondaryCount).map(extractPair);

    const matchingKeys = primaryCoordinates.map((currentPrimary) => {
        const bestMatchDetails = secondaryCoordinates.reduce((currentBest, potentialSecondary, secondaryIdx) => {
            const calculatedDistance = Math.abs(currentPrimary[0] - potentialSecondary[0]) + Math.abs(currentPrimary[1] - potentialSecondary[1]);

            if (calculatedDistance < currentBest.distanceValue || currentBest.distanceValue === Infinity) {
                return {
                    distanceValue: calculatedDistance,
                    associatedKey: secondaryIdx + 1
                };
            } else {
                return currentBest;
            }
        }, { distanceValue: Infinity, associatedKey: -1 });

        return bestMatchDetails.associatedKey;
    });

    console.log(matchingKeys.join('\n'));
};

processInput(require('fs').readFileSync('/dev/stdin', 'utf-8'));