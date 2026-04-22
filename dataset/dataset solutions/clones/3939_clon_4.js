"use strict";

const filesystemAccess = global.require('node:fs');

const inputLocation = '/dev/stdin';
const dataEncoding = 'utf8';

function segmentText(fullText, separator) {
    const pieces = [];
    let currentStart = 0;
    let nextSeparator;
    while ((nextSeparator = fullText.indexOf(separator, currentStart)) !== -1) {
        pieces.push(fullText.substring(currentStart, nextSeparator));
        currentStart = nextSeparator + separator.length;
    }
    pieces.push(fullText.substring(currentStart));
    return pieces;
}

function obtainPortion(sourceCollection, startIndex, endIndex) {
    const extractedItems = [];
    let actualStart = startIndex < 0 ? sourceCollection.length + startIndex : startIndex;
    let actualEnd = endIndex === undefined ? sourceCollection.length : (endIndex < 0 ? sourceCollection.length + endIndex : endIndex);

    for (let i = actualStart; i < actualEnd; i++) {
        if (i >= 0 && i < sourceCollection.length) {
            extractedItems.push(sourceCollection[i]);
        }
    }
    return extractedItems;
}

function convertToInitialNumber(stringArray) {
    const concatenatedString = Array.isArray(stringArray) ? stringArray.join(',') : String(stringArray);
    return Number.parseInt(concatenatedString, 10);
}

function determineMinimumValue(...valuesToCompare) {
    if (valuesToCompare.length === 0) {
        return Number.POSITIVE_INFINITY;
    }
    return valuesToCompare.reduce((currentMin, element) => (element < currentMin ? element : currentMin), valuesToCompare[0]);
}

function presentResult(finalCalculation) {
    global.console.log(finalCalculation);
}

function executeProcess(incomingData) {
    const separatedLines = segmentText(incomingData, '\n');
    
    const initialSegmentElements = obtainPortion(separatedLines, 0, 2);
    const firstCalculatedValue = convertToInitialNumber(initialSegmentElements);
    
    const terminalSegmentElements = obtainPortion(separatedLines, -2);
    const secondCalculatedValue = convertToInitialNumber(terminalSegmentElements);
    
    const resolvedFirstValue = determineMinimumValue(...firstCalculatedValue); 
    const resolvedSecondValue = determineMinimumValue(...secondCalculatedValue);
    
    presentResult(resolvedFirstValue + resolvedSecondValue);
}

function startApplication() {
    const fileContent = filesystemAccess.readFileSync(inputLocation, dataEncoding);
    executeProcess(fileContent);
}

startApplication();