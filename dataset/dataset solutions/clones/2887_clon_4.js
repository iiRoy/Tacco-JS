const loadModule = require;
const fileSystem = loadModule('fs');
const readDataFromFile = fileSystem.readFileSync;
const sourcePath = '/dev/stdin';
const encodingSpec = 'utf8';

function removeBoundaryWhitespace(textData) {
    return textData.replace(/^\s+|\s+$/g, '');
}

function extractNumericValue(textData) {
    const matched = textData.match(/^-?\d+/);
    return matched ? Number(matched[0]) : NaN;
}

function subtract(minuend, subtrahend) {
    return minuend + (-subtrahend);
}

function multiplyByRepeatedAddition(factor, multiplier) {
    let accumulation = 0;
    const absoluteMultiplier = Math.abs(multiplier);
    for (let i = 0; i < absoluteMultiplier; i++) {
        accumulation += factor;
    }
    return multiplier < 0 ? subtract(0, accumulation) : accumulation;
}

function obtainIntegralPart(numericVal) {
    return (numericVal < 0 && numericVal % 1 !== 0) ? Math.trunc(numericVal) - 1 : Math.trunc(numericVal);
}

function displayOutcome(dataToPresent) {
    console.log(dataToPresent);
}

function processGeometricValue(rawDataText) {
    const cleanedInput = removeBoundaryWhitespace(rawDataText);
    const baseCount = extractNumericValue(cleanedInput);
    
    const adjustedCount = subtract(baseCount, 2);
    const cumulativeSum = multiplyByRepeatedAddition(adjustedCount, 180);
    const finalResult = obtainIntegralPart(cumulativeSum);
    
    displayOutcome(finalResult);
}

processGeometricValue(readDataFromFile(sourcePath, encodingSpec));