'use strict';

const measureDistance = (xOne, yOne, xTwo, yTwo) => Math.abs(xOne - xTwo) + Math.abs(yOne - yTwo);

const determinePyramidAttributes = (rawData) => {
    const dataSegments = rawData.split('\n');
    const totalObservationCount = Number(dataSegments[0]);

    const observationRecords = dataSegments.slice(1, 1 + totalObservationCount).map(lineText => {
        const numericFields = lineText.split(' ').map(Number);
        return {
            spotX: numericFields[0],
            spotY: numericFields[1],
            elevation: numericFields[2],
        };
    });

    const coordinateRange = Array.from({ length: 101 }, (_, index) => index);

    const verifiedCenter = coordinateRange.flatMap(centerXCandidate =>
        coordinateRange.map(centerYCandidate => ({ centerX: centerXCandidate, centerY: centerYCandidate }))
    ).find(potentialCenter => {
        const initialReference = observationRecords[0];
        const calculatedPeakElevation = initialReference.elevation +
                                        measureDistance(potentialCenter.centerX, potentialCenter.centerY, initialReference.spotX, initialReference.spotY);

        const allRecordsAreConsistent = observationRecords.every(currentRecord => {
            const derivedElevationAtSpot = calculatedPeakElevation -
                                           measureDistance(potentialCenter.centerX, potentialCenter.centerY, currentRecord.spotX, currentRecord.spotY);

            if (currentRecord.elevation === 0) {
                return derivedElevationAtSpot === 0;
            } else {
                return derivedElevationAtSpot === currentRecord.elevation;
            }
        });

        return allRecordsAreConsistent;
    });

    if (verifiedCenter) {
        const initialReference = observationRecords[0];
        const finalPeakElevation = initialReference.elevation +
                                   measureDistance(verifiedCenter.centerX, verifiedCenter.centerY, initialReference.spotX, initialReference.spotY);
        console.log(verifiedCenter.centerX, verifiedCenter.centerY, finalPeakElevation);
    }
};

determinePyramidAttributes(require("fs").readFileSync("/dev/stdin", "utf8"));