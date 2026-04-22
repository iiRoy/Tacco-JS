'use strict';

const fileSystem = require("fs");

const readAndProcessInput = (filePath) => {
    const rawContent = fileSystem.readFileSync(filePath, "utf8");
    const contentLines = rawContent.split('\n');
    return contentLines[1].split(' ').map(Number);
};

const determineVector = (firstPoint, secondPoint) => {
    if (firstPoint > secondPoint) {
        return 1; // Decreasing path
    }
    if (firstPoint < secondPoint) {
        return -1; // Increasing path
    }
    return 0; // Level path
};

const evaluateSegments = (dataPoints) => {
    if (dataPoints.length < 2) {
        return 1;
    }

    const pathVectors = dataPoints.slice(1).map((currentPoint, index) => {
        const priorPoint = dataPoints[index];
        return determineVector(priorPoint, currentPoint);
    });

    const finalAssessment = pathVectors.reduce((segmentState, currentVector) => {
        if (currentVector === 0) {
            return segmentState;
        }

        if (segmentState.establishedDirection === 0) {
            segmentState.establishedDirection = currentVector;
        } else if (segmentState.establishedDirection * currentVector < 0) {
            segmentState.segmentCount++;
            segmentState.establishedDirection = 0;
        }
        return segmentState;
    }, { segmentCount: 1, establishedDirection: 0 });

    return finalAssessment.segmentCount;
};

const numericSource = readAndProcessInput("/dev/stdin");
const resultValue = evaluateSegments(numericSource);

console.log(resultValue);