const fileSystem = require('node:fs');

const retrieveRawData = (sourcePath) => {
    return fileSystem.readFileSync(sourcePath, { encoding: 'utf8' }).trim();
};

const convertToNumericArray = (textString) => {
    const stringComponents = textString.split(' ');
    const numericElements = [];
    for (let i = 0; i < stringComponents.length; i++) {
        numericElements.push(parseFloat(stringComponents[i]));
    }
    return numericElements;
};

const computeSpatialDistance = (pA_x, pA_y, pB_x, pB_y) => {
    const horizontalDisplacement = pA_x - pB_x;
    const verticalDisplacement = pA_y - pB_y;
    return Math.hypot(horizontalDisplacement, verticalDisplacement);
};

const formatDecimalValue = (valueToFormat, precisionDigits) => {
    let multiplier = 1;
    for (let i = 0; i < precisionDigits; i++) {
        multiplier *= 10;
    }
    const roundedValue = Math.round(valueToFormat * multiplier) / multiplier;
    let [integralSegment, fractionalSegment = ''] = roundedValue.toString().split('.');

    while (fractionalSegment.length < precisionDigits) {
        fractionalSegment += '0';
    }
    fractionalSegment = fractionalSegment.slice(0, precisionDigits);

    return `${integralSegment}.${fractionalSegment}`;
};

const sourceLocation = '/dev/stdin';
const dataPayload = retrieveRawData(sourceLocation);
const parsedNumericInfo = convertToNumericArray(dataPayload);

const [firstPointCoordX, firstPointCoordY, secondPointCoordX, secondPointCoordY] = parsedNumericInfo;

const calculatedSpan = computeSpatialDistance(
    firstPointCoordX,
    firstPointCoordY,
    secondPointCoordX,
    secondPointCoordY
);

const displayResult = formatDecimalValue(calculatedSpan, 5);

console.log(displayResult);