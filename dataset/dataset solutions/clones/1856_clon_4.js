"use strict";

const dataExtractor = (sourceText) => {
    let currentPosition = 0;
    const fetchNextNumeric = () => {
        let stringBuilder = "";
        while (currentPosition < sourceText.length && sourceText[currentPosition] !== ' ' && sourceText[currentPosition] !== '\n') {
            stringBuilder += sourceText[currentPosition];
            currentPosition++;
        }
        while (currentPosition < sourceText.length && (sourceText[currentPosition] === ' ' || sourceText[currentPosition] === '\n')) {
            currentPosition++;
        }
        return parseFloat(stringBuilder);
    };

    const firstLength = fetchNextNumeric();
    const secondLength = fetchNextNumeric();
    const currentHourIndicator = fetchNextNumeric();
    const currentMinuteIndicator = fetchNextNumeric();
    return { firstLength, secondLength, currentHourIndicator, currentMinuteIndicator };
};

const geometricProcessor = (parameters) => {
    const { firstLength, secondLength, currentHourIndicator, currentMinuteIndicator } = parameters;

    const mathOperations = {
        sineFunction: (val) => Math.sin(val),
        cosineFunction: (val) => Math.cos(val),
        squareRootFunction: (val) => Math.sqrt(val),
        piConstant: Math.PI
    };

    const fullRotation = 2 * mathOperations.piConstant;
    const quarterRotation = mathOperations.piConstant / 2; // Equivalent to 12 o'clock in standard Cartesian

    // Calculate angular positions in radians, measured clockwise from 12 o'clock
    // Each hour mark is 30 degrees, each minute mark is 6 degrees
    // Hour hand moves 0.5 degrees per minute
    const angularPositionFirst = ((currentHourIndicator % 12) * 30 + currentMinuteIndicator * 0.5) * (mathOperations.piConstant / 180);
    const angularPositionSecond = (currentMinuteIndicator * 6) * (mathOperations.piConstant / 180);

    // Convert these angles to standard Cartesian coordinates system
    // (0 radians at positive X-axis, counter-clockwise rotation)
    // 12 o'clock is at PI/2 radians (positive Y-axis)
    const standardAngleFirst = quarterRotation - angularPositionFirst;
    const standardAngleSecond = quarterRotation - angularPositionSecond;

    // Calculate Cartesian coordinates for the endpoints of the two "arms"
    const xCoordOne = firstLength * mathOperations.cosineFunction(standardAngleFirst);
    const yCoordOne = firstLength * mathOperations.sineFunction(standardAngleFirst);

    const xCoordTwo = secondLength * mathOperations.cosineFunction(standardAngleSecond);
    const yCoordTwo = secondLength * mathOperations.sineFunction(standardAngleSecond);

    // Apply the Euclidean distance formula between the two endpoints
    const diffX = xCoordTwo - xCoordOne;
    const diffY = yCoordTwo - yCoordOne;

    const distanceSquared = diffX * diffX + diffY * diffY;
    return mathOperations.squareRootFunction(distanceSquared);
};

const rawInputText = require("fs").readFileSync("/dev/stdin", "utf8");
const extractedData = dataExtractor(rawInputText);

const finalCalculatedValue = geometricProcessor(extractedData);

process.stdout.write(finalCalculatedValue + '\n');