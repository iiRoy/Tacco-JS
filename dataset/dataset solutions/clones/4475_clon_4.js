"use strict";
const processData = (dataSource) => {
    let allLines = dataSource.trim().split('\n');
    let [configLine, valueLine] = allLines;

    let params = configLine.split(' ').map(val => parseInt(val, 10));
    let [totalCount, targetCount] = params;

    if (targetCount > totalCount) {
        console.log(NaN);
        return;
    }

    let numericValues = valueLine.split(' ').map(val => parseInt(val, 10));

    let selectedTop = [];

    for (let currentVal of numericValues) {
        if (selectedTop.length < targetCount) {
            let insertPos = 0;
            while (insertPos < selectedTop.length && selectedTop[insertPos] < currentVal) {
                insertPos++;
            }
            selectedTop.splice(insertPos, 0, currentVal);
        } else if (currentVal > selectedTop[0]) {
            selectedTop.shift();
            let insertPos = 0;
            while (insertPos < selectedTop.length && selectedTop[insertPos] < currentVal) {
                insertPos++;
            }
            selectedTop.splice(insertPos, 0, currentVal);
        }
    }

    let resultValue = selectedTop.reduce((accumulator, currentNumber) => accumulator + currentNumber, 0);

    console.log(resultValue);
};

processData(require('fs').readFileSync('/dev/stdin', 'utf8'));