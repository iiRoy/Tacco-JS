'use strict';

process.stdin.resume();
process.stdin.setEncoding('utf-8');

let collectedInput = '';
let inputLineArray = [];

process.stdin.on('data', chunk => {
    collectedInput += chunk;
});

process.stdin.on('end', () => {
    inputLineArray = collectedInput.trim().split('\n').map(line => line.trim());
    initiateMainProcessing(inputLineArray);
});

function initiateMainProcessing(rawLines) {
    let lineCursor = 0;
    const retrieveNextDatum = () => rawLines[lineCursor++];
    const decomposeToNumbers = (textualSequence) => textualSequence.split(' ').map(Number);

    const initialParameters = decomposeToNumbers(retrieveNextDatum());
    const totalPoints = initialParameters[0];
    const maximumJumpSpan = initialParameters[1];
    const altitudeValues = decomposeToNumbers(retrieveNextDatum());

    const costMemo = new Map(); // For storing computed minimum costs

    // Recursive helper function to determine minimum expense to reach a point
    const calculatePathCost = (currentIdx) => {
        if (costMemo.has(currentIdx)) {
            return costMemo.get(currentIdx);
        }

        if (currentIdx === 0) {
            return 0; // No cost to start at the first point
        }

        let minimalExpense = Infinity; // Initialize with a very large value

        // Explore all possible previous points within maximumJumpSpan
        for (let stepBackwards = 1; stepBackwards <= maximumJumpSpan; stepBackwards++) {
            const previousIdx = currentIdx - stepBackwards;
            if (previousIdx >= 0) {
                const expenseFromPrevious = calculatePathCost(previousIdx) +
                                            Math.abs(altitudeValues[currentIdx] - altitudeValues[previousIdx]);
                minimalExpense = Math.min(minimalExpense, expenseFromPrevious);
            }
        }

        costMemo.set(currentIdx, minimalExpense);
        return minimalExpense;
    };

    const finalOptimalCost = calculatePathCost(totalPoints - 1);
    console.log(finalOptimalCost);
}