const fileSystemModule = require('fs');
const rawInputString = fileSystemModule.readFileSync('/dev/stdin', 'ascii');
const radiusValue = Number(rawInputString);

const PI_CONSTANT = Math.PI;
const fixedDecimalPlaces = 6;

const calculateCircleArea = (currentRadius, piValue) => {
    const radiusSquared = currentRadius * currentRadius;
    return piValue * radiusSquared;
};

const calculateCircleCircumference = (currentRadius, piValue) => {
    const diameterFactor = 2.0;
    return diameterFactor * piValue * currentRadius;
};

const formatNumberToString = (numericValue, precision) => {
    return numericValue.toFixed(precision);
};

const areaResult = calculateCircleArea(radiusValue, PI_CONSTANT);
const circumferenceResult = calculateCircleCircumference(radiusValue, PI_CONSTANT);

const formattedAreaOutput = formatNumberToString(areaResult, fixedDecimalPlaces);
const formattedCircumferenceOutput = formatNumberToString(circumferenceResult, fixedDecimalPlaces);

console.log(formattedAreaOutput, formattedCircumferenceOutput);
