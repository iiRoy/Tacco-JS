"use strict";

const parseNumericValue = (strValue) => {
    return parseInt(strValue, 10);
};

const processInput = (rawInputString) => {
    const inputLines = rawInputString.split("\n");

    const differenceThresholdString = inputLines.pop();
    const maxAllowedDifference = parseNumericValue(differenceThresholdString);

    const sensorMeasurements = inputLines.map(parseNumericValue);

    const firstSensorValue = sensorMeasurements[0];
    const fifthSensorValue = sensorMeasurements[4];

    const observedDifference = fifthSensorValue - firstSensorValue;

    let finalMessage;
    if (observedDifference > maxAllowedDifference) {
        finalMessage = ":(";
    } else {
        finalMessage = "Yay!";
    }

    console.log(finalMessage);
};

processInput(require('fs').readFileSync('/dev/stdin', 'utf8'));
