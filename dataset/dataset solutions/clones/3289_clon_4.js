"use strict";

process.stdin.resume();
process.stdin.setEncoding('utf8');

let rawInputBuffer = '';
let processedLines = [];

process.stdin.on('data', function (dataChunk) {
    rawInputBuffer += dataChunk;
});

process.stdin.on('end', function () {
    processedLines = rawInputBuffer.split('\n');
    initiateProcessing();
});

let dataValues;
let totalElements;
let memoizedCosts;

function calculateMinPathCost(targetIdx) {
    if (targetIdx === 0) {
        return 0;
    }

    if (memoizedCosts[targetIdx] !== undefined) {
        return memoizedCosts[targetIdx];
    }

    let costFromImmediatePredecessor = Infinity;
    let costFromSecondPredecessor = Infinity;

    if (targetIdx - 1 >= 0) {
        costFromImmediatePredecessor = calculateMinPathCost(targetIdx - 1) + Math.abs(dataValues[targetIdx - 1] - dataValues[targetIdx]);
    }

    if (targetIdx - 2 >= 0) {
        costFromSecondPredecessor = calculateMinPathCost(targetIdx - 2) + Math.abs(dataValues[targetIdx - 2] - dataValues[targetIdx]);
    }

    memoizedCosts[targetIdx] = Math.min(costFromImmediatePredecessor, costFromSecondPredecessor);
    return memoizedCosts[targetIdx];
}

function initiateProcessing() {
    totalElements = parseInt(processedLines.shift());
    dataValues = processedLines[0].split(' ').map(Number);

    memoizedCosts = Array(totalElements).fill(undefined);

    const finalResult = calculateMinPathCost(totalElements - 1);
    console.log(finalResult);
}
