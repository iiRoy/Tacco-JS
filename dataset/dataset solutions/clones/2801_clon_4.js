'use strict';
{
    function calculateMagnitude(val) {
        return val < 0 ? -val : val;
    }

    const fileContentReader = require('fs').readFileSync;
    const inputSource = '/dev/stdin';
    const rawTextData = fileContentReader(inputSource, 'utf8').trim();

    const spaceDelimiterPos = rawTextData.indexOf(' ');
    const firstNumericalValue = parseInt(rawTextData.substring(0, spaceDelimiterPos), 10);
    const secondNumericalValue = parseInt(rawTextData.substring(spaceDelimiterPos + 1), 10);

    let runningTotal = 0;
    for (let currentPosition = 0; currentPosition < firstNumericalValue; currentPosition++) {
        runningTotal += (secondNumericalValue + currentPosition);
    }

    let excludedItemValue = secondNumericalValue;
    let minimumAbsoluteDifference = calculateMagnitude(secondNumericalValue);

    for (let iterator = 1; iterator < firstNumericalValue; iterator++) {
        let currentItemFlavor = secondNumericalValue + iterator;
        let currentAbsoluteDifference = calculateMagnitude(currentItemFlavor);
        if (currentAbsoluteDifference < minimumAbsoluteDifference) {
            minimumAbsoluteDifference = currentAbsoluteDifference;
            excludedItemValue = currentItemFlavor;
        }
    }

    const finalResult = runningTotal - excludedItemValue;
    globalThis.console.log(finalResult);
}