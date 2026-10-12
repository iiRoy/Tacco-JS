"use strict";

const extractTravelParameters = (lineContent) => {
    const components = lineContent.split(" ");
    const distanceValue = parseInt(components[0], 10);
    const timeLimitValue = parseInt(components[1], 10);
    const speedValue = parseInt(components[2], 10);
    return { distanceValue, timeLimitValue, speedValue };
};

const processInputData = (inputString) => {
    const cleanedInput = inputString.trim();
    const inputLines = cleanedInput.split("\n");

    const firstLine = inputLines[0];
    const { distanceValue: totalDistance, timeLimitValue: maxAllowedTime, speedValue: averageSpeed } = extractTravelParameters(firstLine);

    const estimatedTravelTime = totalDistance / averageSpeed;

    const canReachDestination = estimatedTravelTime <= maxAllowedTime;

    const resultOutput = canReachDestination ? "Yes" : "No";

    console.log(resultOutput);
};

const fileSystemHandler = require('fs');
const standardInputFile = '/dev/stdin';
const fileEncoding = 'utf8';

const rawInputContent = fileSystemHandler.readFileSync(standardInputFile, fileEncoding);
processInputData(rawInputContent);
