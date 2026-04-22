"use strict";

const processGeometry = (sourceMaterial) => {

    const parseNumericalLine = (lineContent) => lineContent.split(' ').map(Number);

    const setupDataset = (material) => {
        const textLines = material.trim().split('\n');
        const [entryCount, dimensionCount] = parseNumericalLine(textLines.shift());
        const coordinateVectors = textLines.map(parseNumericalLine);
        return { entryCount, dimensionCount, coordinateVectors };
    };

    const calculateVectorDistance = (vectorA, vectorB, dimensionSize) => {
        const sumOfSquaredDifferences = Array.from({ length: dimensionSize }, (_, axisIndex) => {
            const componentDifference = vectorA[axisIndex] - vectorB[axisIndex];
            return componentDifference * componentDifference;
        }).reduce((totalSum, squareDiff) => totalSum + squareDiff, 0);

        return Math.sqrt(sumOfSquaredDifferences);
    };

    const isAnInteger = (valueToCheck) => Number.isInteger(valueToCheck);

    const { entryCount, dimensionCount, coordinateVectors } = setupDataset(sourceMaterial);

    const integralDistanceCounter = Array.from({ length: entryCount }, (_, outerIndex) => {
        return Array.from({ length: entryCount - (outerIndex + 1) }, (_, innerOffset) => {
            const innerIndex = outerIndex + 1 + innerOffset;
            const currentVector = coordinateVectors[outerIndex];
            const comparisonVector = coordinateVectors[innerIndex];

            const computedDistance = calculateVectorDistance(currentVector, comparisonVector, dimensionCount);

            return isAnInteger(computedDistance) ? 1 : 0;
        }).reduce((subtotal, countIncrement) => subtotal + countIncrement, 0);
    }).reduce((finalTotal, segmentTotal) => finalTotal + segmentTotal, 0);

    return integralDistanceCounter;
};

const initiateExecution = (inputContent) => {
    const finalOutcome = processGeometry(inputContent);
    console.log(finalOutcome);
};

initiateExecution(require('fs').readFileSync('/dev/stdin', 'utf8'));