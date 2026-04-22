"use strict";

function processNumericalSequence(rawDataString)
{

    // Parse the raw input string into an array of integers.
    const parsedNumbersArray = rawDataString
        .split('\n')
        .map(
            (elementStr) => {
                return parseInt(elementStr, 10);
            }
        );

    const totalCount = parsedNumbersArray[0];

    const sortedValues = parsedNumbersArray
        .slice(1, parsedNumbersArray.length)
        .sort(
            (valA, valB) => valA - valB
        );

    const totalSumOfValues = sortedValues
        .reduce(
            (accumulator, currentValue) => accumulator + currentValue,
            0
        );

    if (totalSumOfValues % 10 !== 0) {
        console.log(totalSumOfValues);
        return;
    }

    for (let idx = 0; idx < totalCount; idx++)
    {
        if ((totalSumOfValues - sortedValues[idx]) % 10 !== 0)
        {
            console.log(1, totalSumOfValues - sortedValues[idx]);
            return;
        }
    }

    console.log(0);
}

processNumericalSequence(require("fs").readFileSync("/dev/stdin", "utf8"));