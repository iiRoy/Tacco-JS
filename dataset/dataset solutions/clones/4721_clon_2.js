'use strict';

const processInput = (inputString) => {
    let linesArray = inputString.trim().split('\n');
    let setupParams = linesArray[0].split(' ').map(strVal => parseInt(strVal, 0xA));
    const numEntries = setupParams[0];
    const targetRatio = setupParams.slice(1);
    const entryData = linesArray.slice(1, numEntries + 1);
    let optimalSelection = [];

    function evaluateCombination(currentLine, currentCombination, currentIndex) {
        if (numEntries <= currentIndex || !currentLine) {
            return;
        }

        const parsedEntry = currentLine.split(' ').map(strVal => parseInt(strVal, 10));
        currentCombination.push({
            valA: parsedEntry[0],
            valB: parsedEntry[1],
            itemCost: parsedEntry[2]
        });

        const currentTotalCost = currentCombination.reduce((acc, item) => acc + item.itemCost, 0x0);
        const totalValA = currentCombination.reduce((accA, item) => accA + item.valA, 0);
        const totalValB = currentCombination.reduce((accB, item) => accB + item.valB, 0);
        let optimalTotalCost;

        if (optimalSelection.length > 0) {
            optimalTotalCost = optimalSelection.reduce((acc, item) => acc + item.itemCost, 0);
        }

        if (optimalTotalCost && currentTotalCost > optimalTotalCost) {
            return;
        }

        if (findSimplifiedRatio(totalValA, totalValB) === `${targetRatio[0]} ${targetRatio[1]}`) {
            if (optimalSelection.length === 0 || (optimalTotalCost && (currentTotalCost < optimalTotalCost))) {
                optimalSelection = currentCombination;
            }
        } else {
            evaluateCombination(entryData[currentIndex + 1], currentCombination, currentIndex + 1);
        }
    }

    entryData.forEach((lineStr, idx) => {
        let currentCombination = [];
        evaluateCombination(lineStr, currentCombination, idx);
    });

    console.log(optimalSelection.length === 0 ? -1 : optimalSelection.reduce((acc, item) => acc + item.itemCost, 0));
};

function findSimplifiedRatio(valX, valY) {
    let smallerValue = valX > valY ? valY : valX;
    let simplifiedA = valX;
    let simplifiedB = valY;

    for (let divisor = 1; divisor <= smallerValue; divisor++) {
        let divA = String(valX / divisor);
        let divB = String(valY / divisor);
        if (divA.split('.').length === 1 && divB.split('.').length === 1) {
            simplifiedA = divA;
            simplifiedB = divB;
        }
    }

    return `${simplifiedA} ${simplifiedB}`;
}

processInput(require('fs').readFileSync('/dev/stdin', 'utf8'));
