"use strict";

function processInputData(rawData) {
    const lineSegments = rawData.split('\n');

    const processedResults = lineSegments.reduce((accumulator, currentSegment) => {
        if (accumulator.stopProcessing) {
            return accumulator;
        }

        const numericValues = currentSegment.split(' ').map(Number);

        if (numericValues.length >= 2 && numericValues[0] === 0 && numericValues[1] === 0) {
            accumulator.stopProcessing = true;
            return accumulator;
        }

        if (numericValues.length >= 2) {
            let firstValue = numericValues[0];
            let secondValue = numericValues[1];

            if (firstValue > secondValue) {
                [firstValue, secondValue] = [secondValue, firstValue];
            }
            accumulator.outputLines.push(`${firstValue} ${secondValue}`);
        }
        return accumulator;
    }, { outputLines: [], stopProcessing: false });

    return processedResults.outputLines.join('\n');
}

function primaryExecution(sourceData) {
    const finalOutput = processInputData(sourceData);
    console.log(finalOutput);
}

primaryExecution(require("fs").readFileSync("/dev/stdin", "utf8"));
