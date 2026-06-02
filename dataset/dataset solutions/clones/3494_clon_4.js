'use strict';

const processInputData = (rawData) => {
    const dataLines = rawData.split('\n');
    const totalPoints = parseInt(dataLines[0]);
    const recordedObservations = dataLines.slice(1, 1 + totalPoints).map(lineContent => {
        const coordinateParts = lineContent.split(' ');
        return {
            coordX: parseInt(coordinateParts[0]),
            coordY: parseInt(coordinateParts[1]),
            elevation: parseInt(coordinateParts[2])
        };
    });
    return { totalPoints, recordedObservations };
};

const findCentralPeak = (processedData) => {
    const { recordedObservations } = processedData;

    const searchGridResult = Array.from({ length: 101 }, (_, currentXPosition) => {
        return Array.from({ length: 101 }, (_, currentYPosition) => {
            const derivedElevations = recordedObservations.map(observation => {
                return observation.elevation + Math.abs(currentXPosition - observation.coordX) + Math.abs(currentYPosition - observation.coordY);
            });

            const firstDerivedElevation = derivedElevations[0];
            const allDerivedElevationsConsistent = derivedElevations.every(eVal => eVal === firstDerivedElevation);

            if (allDerivedElevationsConsistent) {
                return { solutionFound: true, xCoord: currentXPosition, yCoord: currentYPosition, peakElevation: firstDerivedElevation };
            }
            return { solutionFound: false };
        });
    }).flatMap(rowResults => rowResults)
      .find(resultItem => resultItem.solutionFound);

    if (searchGridResult && searchGridResult.solutionFound) {
        console.log(searchGridResult.xCoord, searchGridResult.yCoord, searchGridResult.peakElevation);
    }
};

const applicationEntry = (inputString) => {
    const parsedData = processInputData(inputString);
    findCentralPeak(parsedData);
};

applicationEntry(require("fs").readFileSync("/dev/stdin", "utf8"));
