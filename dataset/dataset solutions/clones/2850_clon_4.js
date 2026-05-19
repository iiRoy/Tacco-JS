'use strict';

process.stdin.resume();
process.stdin.setEncoding('utf-8');

let inputBuffer = '';
let linePointer = 0;

process.stdin.on('data', incomingData => {
    inputBuffer += incomingData;
});

process.stdin.on('end', () => {
    inputBuffer = inputBuffer.split('\n');
    executeProgram();
});

function obtainLine() {
    return inputBuffer[linePointer++];
}

function calculateOptimalScore(currentCapacity, itemCosts, itemRewards, valueCache) {
    if (valueCache[currentCapacity] !== undefined) {
        return valueCache[currentCapacity];
    }

    if (currentCapacity === 0) {
        return 0;
    }

    let currentMaximum = currentCapacity;

    itemCosts.forEach((costEntry, index) => {
        if (currentCapacity >= costEntry) {
            let subProblemValue = calculateOptimalScore(currentCapacity - costEntry, itemCosts, itemRewards, valueCache);
            let potentialValue = subProblemValue + itemRewards[index];
            if (potentialValue > currentMaximum) {
                currentMaximum = potentialValue;
            }
        }
    });

    valueCache[currentCapacity] = currentMaximum;
    return currentMaximum;
}

function executeProgram() {
    const initialCapacity = parseInt(obtainLine(), 10);
    const firstItemCosts = obtainLine().split(' ').map(Number);
    const firstItemRewards = obtainLine().split(' ').map(Number);

    const cacheOne = new Array(initialCapacity + 1).fill(undefined);
    const intermediateResult = calculateOptimalScore(initialCapacity, firstItemCosts, firstItemRewards, cacheOne);

    const cacheTwo = new Array(intermediateResult + 1).fill(undefined);
    const finalOutcome = calculateOptimalScore(intermediateResult, firstItemRewards, firstItemCosts, cacheTwo);

    console.log(finalOutcome);
}
