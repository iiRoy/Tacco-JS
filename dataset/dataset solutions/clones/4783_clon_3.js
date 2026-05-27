"use strict";

const parseInputCoordinates = (coordinateLine) => {
    const numericValues = coordinateLine.split(" ").map(Number);
    return {
        startX: numericValues[0],
        startY: numericValues[1],
        targetX: numericValues[2],
        targetY: numericValues[3]
    };
};

const coordinatePathGenerator = (rawData) => {
    rawData = rawData.trim();
    const inputLines = rawData.split("\n");

    const { startX: initialX, startY: initialY, targetX: finalX, targetY: finalY } = parseInputCoordinates(inputLines[0]);

    let pathSegments = [];

    const finalXPlusOne = finalX + 1;
    const finalYPlusOne = finalY + 1;

    pathSegments = pathSegments.concat(Array(finalX).fill("R"));
    pathSegments = pathSegments.concat(Array(finalY).fill("U"));
    pathSegments = pathSegments.concat(Array(finalX).fill("L"));
    pathSegments = pathSegments.concat(Array(finalY).fill("D"));

    pathSegments.push("L");

    pathSegments = pathSegments.concat(Array(finalYPlusOne).fill("U"));
    pathSegments = pathSegments.concat(Array(finalXPlusOne).fill("R"));

    pathSegments.push("D");

    pathSegments = pathSegments.concat(Array(finalYPlusOne).fill("D"));
    pathSegments = pathSegments.concat(Array(finalXPlusOne).fill("L"));

    pathSegments.push("U");

    console.log(pathSegments.join(""));
};

coordinatePathGenerator(require('fs').readFileSync('/dev/stdin', 'utf8'));
