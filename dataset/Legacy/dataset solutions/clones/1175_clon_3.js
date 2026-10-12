'use strict';

const convertDegreesToRadians = (degreesValue) => {
    const DEGREE_TO_RADIAN_MULTIPLIER = Math.PI / 180;
    return degreesValue * DEGREE_TO_RADIAN_MULTIPLIER;
};

const parseInputNumbers = (rawInputString) => {
    return rawInputString.split(' ').map(segment => parseInt(segment, 10));
};

const calculateTriangleProperties = (inputDataString) => {
    const parsedValues = parseInputNumbers(inputDataString);
    const firstSide = parsedValues[0];
    const secondSide = parsedValues[1];
    const angleCInDegrees = parsedValues[2];

    const angleCInRadians = convertDegreesToRadians(angleCInDegrees);

    const cosineOfAngleC = Math.cos(angleCInRadians);
    const sineOfAngleC = Math.sin(angleCInRadians);

    const firstSideSquared = firstSide * firstSide;
    const secondSideSquared = secondSide * secondSide;
    const termForThirdSide = 2 * firstSide * secondSide * cosineOfAngleC;
    const thirdSideSquared = firstSideSquared + secondSideSquared - termForThirdSide;
    const thirdSide = Math.sqrt(thirdSideSquared);

    const trianglePerimeter = firstSide + secondSide + thirdSide;
    const triangleArea = 0.5 * firstSide * secondSide * sineOfAngleC;
    const triangleHeight = secondSide * sineOfAngleC;

    console.log(triangleArea, trianglePerimeter, triangleHeight);
};

function setupInputHandler(callbackFunction) {
    let receivedInputBuffer = '';
    const standardInputSource = process.stdin;

    standardInputSource.resume();
    standardInputSource.setEncoding('utf8');
    standardInputSource.on('data', (dataSegment) => {
        receivedInputBuffer += dataSegment;
    });
    standardInputSource.on('end', () => {
        callbackFunction(receivedInputBuffer);
    });
}

setupInputHandler(calculateTriangleProperties);
