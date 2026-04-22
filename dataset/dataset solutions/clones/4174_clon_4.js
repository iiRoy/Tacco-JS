"use strict";

const computationUnit = sourceData => {
    let inputLines = sourceData.trim().split('\n');
    let selectionThreshold = parseInt(inputLines[0].match(/\d+\s+(\d+)/)[1]);
    let dataSequence = inputLines[1].match(/\d+/g).map(Number);

    let occurrenceMap = new Map();
    dataSequence.forEach(val => {
        occurrenceMap.set(val, (occurrenceMap.get(val) || 0) + 1);
    });

    let countsArray = Array.from(occurrenceMap.values());
    countsArray.sort((valA, valB) => valB - valA);

    let finalSum = 0;
    for (let currentIdx = selectionThreshold; currentIdx < countsArray.length; ++currentIdx) {
        finalSum += countsArray[currentIdx];
    }
    console.log(finalSum);
};

computationUnit(require('fs').readFileSync('/dev/stdin', 'utf8'));