'use strict';

const NEWLINE_DELIMITER = '\n';
const SPACE_DELIMITER = ' ';
const INITIAL_SUM_VALUE = 0;

const convertToInt = (strValue) => {
    return parseInt(strValue, 10);
};

const parseAndSortDescending = (numbersLineContent) => {
    return numbersLineContent
        .split(SPACE_DELIMITER)
        .map(convertToInt)
        .sort((firstVal, secondVal) => secondVal - firstVal);
};

const processInputData = (rawData) => {
    const processedLines = rawData.split(NEWLINE_DELIMITER);

    const firstLineSegments = processedLines[0].split(SPACE_DELIMITER);
    const totalElementsCount = convertToInt(firstLineSegments[0]);
    const elementsToSumCount = convertToInt(firstLineSegments[1]);

    const sortedValues = parseAndSortDescending(processedLines[1]);

    let cumulativeSum = INITIAL_SUM_VALUE;

    if (elementsToSumCount > sortedValues.length) {
        cumulativeSum = NaN;
    } else {
        const topKElements = sortedValues.slice(0, elementsToSumCount);
        cumulativeSum = topKElements.reduce((accumulator, currentValue) => accumulator + currentValue, INITIAL_SUM_VALUE);
    }

    console.log(cumulativeSum);
};

processInputData(require('fs').readFileSync('/dev/stdin', 'utf-8'));
