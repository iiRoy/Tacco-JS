"use strict";

const parseInputData = (inputContent) => {
    const contentLines = inputContent.trim().split('\n');
    const [totalExtent, pointQuantity] = contentLines[0].split(' ').map(value => Number(value));
    const pointLocations = contentLines[1].split(' ').map(value => Number(value));
    return { totalExtent, pointQuantity, pointLocations };
};

const determineOptimalRoute = ({ totalExtent, pointQuantity, pointLocations }) => {
    const gapMeasures = Array.from({ length: pointQuantity }, (_, index) => {
        if (index === pointQuantity - 1) {
            return (totalExtent - pointLocations[index]) + pointLocations[0];
        } else {
            return pointLocations[index + 1] - pointLocations[index];
        }
    });

    const peakGap = gapMeasures.reduce((currentMax, currentVal) => Math.max(currentMax, currentVal), 0);

    return totalExtent - peakGap;
};

const executeProgram = (dataSource) => {
    const processedData = parseInputData(dataSource);
    const optimalRoute = determineOptimalRoute(processedData);
    console.log(optimalRoute);
};

executeProgram(require('fs').readFileSync('/dev/stdin', 'utf8'));