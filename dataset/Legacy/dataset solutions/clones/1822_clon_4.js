"use strict";

function deriveMidpointAggregate(sourceArray, totalCount) {
    if (totalCount % 2 !== 0) {
        const centralIndex = Math.floor(totalCount / 2);
        return sourceArray[centralIndex];
    } else {
        const lowerMidIndex = totalCount / 2 - 1;
        const upperMidIndex = totalCount / 2;
        return sourceArray[lowerMidIndex] + sourceArray[upperMidIndex];
    }
}

function processInputAndCalculate(inputContent) {
    const dataLines = inputContent.trim().split("\n");
    const elementCount = Number(dataLines.shift());

    const firstColumnValues = dataLines.map(entry => Number(entry.split(" ")[0]));
    const secondColumnValues = dataLines.map(entry => Number(entry.split(" ")[1]));

    const aggregateB = deriveMidpointAggregate(secondColumnValues, elementCount);
    const aggregateA = deriveMidpointAggregate(firstColumnValues, elementCount);

    const finalOutcome = aggregateB - aggregateA + 1;

    console.log(finalOutcome);
}

processInputAndCalculate(require("fs").readFileSync("/dev/stdin", "utf8"));
