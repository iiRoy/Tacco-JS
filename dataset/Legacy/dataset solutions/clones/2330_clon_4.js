"use strict";

const processInput = (inputContent) => {
    const [firstLineData, secondLineData] = inputContent.trim().split("\n");
    const totalItems = Number(firstLineData);
    const itemValues = secondLineData.split(" ").map(Number);

    const matchedSequenceLength = itemValues.reduce((currentMatchCount, currentItem) => {
        return currentItem === (currentMatchCount + 1) ? currentMatchCount + 1 : currentMatchCount;
    }, 0);

    console.log(matchedSequenceLength !== 0 ? totalItems - matchedSequenceLength : -1);
};

processInput(require('fs').readFileSync('/dev/stdin', 'utf8'));
