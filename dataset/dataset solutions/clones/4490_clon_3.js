'use strict';

function processInputData(rawInputContent) {
    const NEWLINE_SEPARATOR = "\n";
    const VALUE_DELIMITER = " ";
    const NUMERIC_RADIX = 10;

    const firstRelevantLine = rawInputContent.split(NEWLINE_SEPARATOR)[0];
    const stringNumbers = firstRelevantLine.split(VALUE_DELIMITER);

    stringNumbers.sort((elementA, elementB) => elementA - elementB);

    const parseAndSumTwoElements = (arr, radixBase) => {
        const firstParsed = parseInt(arr[0], radixBase);
        const secondParsed = parseInt(arr[1], radixBase);
        return firstParsed + secondParsed;
    };

    const computedResult = parseAndSumTwoElements(stringNumbers, NUMERIC_RADIX);

    console.log(computedResult);
}

processInputData(require("fs").readFileSync("/dev/stdin", "utf8"));
