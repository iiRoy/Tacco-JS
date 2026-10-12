'use strict';

function evaluatePursuitScenario(rawInputData) {
    const contentLines = rawInputData.trim().split(/\r?\n/g);

    const firstPairStrings = contentLines[0].split(' ');
    const secondPairStrings = contentLines[1].split(' ');
    const durationString = contentLines[2];

    const initialPositionA = parseInt(firstPairStrings[0], 10);
    const speedA = parseInt(firstPairStrings[1], 10);

    const initialPositionB = parseInt(secondPairStrings[0], 10);
    const speedB = parseInt(secondPairStrings[1], 10);

    const timeInterval = parseInt(durationString, 10);

    const finalPositionOfA = initialPositionA + speedA * timeInterval;
    const finalPositionOfB = initialPositionB + speedB * timeInterval;

    const outcomeIndicator = (finalPositionOfA > finalPositionOfB) ? 'YES' : 'NO';

    return outcomeIndicator;
}

function executeSolution(inputSource) {
    const computedResult = evaluatePursuitScenario(inputSource);
    console.log(computedResult);
}

executeSolution(require("fs").readFileSync("/dev/stdin", "utf8"));
