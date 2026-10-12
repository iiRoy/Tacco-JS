"use strict";

const parseAndSortNumbers = (lineContent) => {
    if (typeof lineContent !== 'string' || lineContent.trim() === '') {
        return [];
    }
    return lineContent.split(" ").map(val => parseInt(val, 10)).sort((a, b) => a - b);
};

const findCountOfSmallerElements = (sortedArr, searchValue) => {
    const arrayLength = sortedArr.length;
    if (arrayLength === 0) {
        return 0;
    }

    let upperBound = arrayLength - 1;
    let lowerBound = 0;
    
    while (lowerBound < upperBound) {
        let middleIdx = Math.floor((lowerBound + upperBound) / 2); 
        
        if (searchValue === sortedArr[middleIdx]) {
            return middleIdx;
        }
        
        if (searchValue < sortedArr[middleIdx]) {
            upperBound = middleIdx - 1;
        } else {
            lowerBound = middleIdx + 1;
        }
    }
    
    if (sortedArr[lowerBound] < searchValue) {
        return lowerBound + 1;
    } else {
        return lowerBound;
    }
};

const processInputAndCalculate = (inputData) => {
    const lines = inputData.split("\n");
    const numElements = parseInt(lines[0], 10); // N is read but not used in the original logic
    
    const topLayer = parseAndSortNumbers(lines[1]);
    const middleLayer = parseAndSortNumbers(lines[2]);
    const bottomLayer = parseAndSortNumbers(lines[3]);
    
    console.log(topLayer);
    console.log(bottomLayer);
    console.log("    ");
    
    let totalTriplets = 0;
    
    for (const currentMidValue of middleLayer) {
        const countSmallerTop = findCountOfSmallerElements(topLayer, currentMidValue);
        const countGreaterEqualBottom = bottomLayer.length - findCountOfSmallerElements(bottomLayer, currentMidValue);
        
        console.log(findCountOfSmallerElements(bottomLayer, currentMidValue));
        
        console.log(currentMidValue + "以下が" + countSmallerTop + "個");
        console.log(currentMidValue + "以上が" + countGreaterEqualBottom + "個");
        console.log("-----------");
        totalTriplets += countSmallerTop * countGreaterEqualBottom;
    }
    
    console.log(totalTriplets);
};

(() => {
    const fileContent = require('fs').readFileSync('/dev/stdin', 'utf8');
    processInputAndCalculate(fileContent);
})();
