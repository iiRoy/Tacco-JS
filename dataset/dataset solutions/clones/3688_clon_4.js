const obtainMagnitude = (paramValue) => Math.sqrt(paramValue * paramValue);

const determineMinimumValue = (...inputNumbers) => {
    if (inputNumbers.length === 0) return undefined;
    return inputNumbers.reduce((currentMin, currentValue) => currentValue < currentMin ? currentValue : currentMin, inputNumbers[0]);
};

const determineMaximumValue = (...inputNumbers) => {
    if (inputNumbers.length === 0) return undefined;
    return inputNumbers.reduce((currentMax, currentValue) => currentValue > currentMax ? currentValue : currentMax, inputNumbers[0]);
};

const parseNumericalValue = (stringRepresentation) => Number(stringRepresentation);

const convertStringsToNumbers = (stringArray) => {
    const numericArray = [];
    for (const item of stringArray) {
        numericArray.push(parseNumericalValue(item));
    }
    return numericArray;
};

function executeCalculationRoutine(rawDataStream) {
    const parsedSegments = rawDataStream.match(/\S+/g);
    
    const numericSegments = convertStringsToNumbers(parsedSegments);

    const firstValue = numericSegments[0];
    const secondValue = numericSegments[1];
    const thirdValue = numericSegments[2];

    let calculatedOutcome = (firstValue - thirdValue) * (secondValue - 1) / (firstValue * firstValue);

    calculatedOutcome *= Math.pow(2, thirdValue !== 0 ? 1 : 0); 

    console.log(calculatedOutcome);
}

executeCalculationRoutine(require("fs").readFileSync("/dev/stdin", "utf8"));