'use strict';
const inputLines = require('fs').readFileSync('/dev/stdin', 'utf8').trim().split('\n');

const rowColCounts = inputLines[0].split(' ').map(Number);
const numRows = rowColCounts[0];
const numCols = rowColCounts[1];
const numPoints = parseInt(inputLines[1]);
const pointDataStrings = inputLines.slice(2);

let diffXOdd = false;
let diffXEven = false;
let diffYOdd = false;
let diffYEven = false;

let mapXOdd = new Map();
let mapXEven = new Map();
let mapYOdd = new Map();
let mapYEven = new Map();

const terminateExecution = () => {
    console.log('No');
    process.exit();
};

const isInvalidValue = (val, d, term1, term2) => {
    return (val - d * term1 < 0 || val + d * term2 < 0);
};

for (let idx = 0; idx < numPoints; idx++) {
    const currentPointStrParts = pointDataStrings[idx].split(' ');
    const currR = parseInt(currentPointStrParts[0]);
    const currC = parseInt(currentPointStrParts[1]);
    const currA = parseInt(currentPointStrParts[2]);

    if (numRows === 2) {
        if (mapYEven.has(currC)) {
            const prevRA = mapYEven.get(currC);
            const prevR = prevRA[0];
            const prevA = prevRA[1];
            
            const calculatedDiff = (prevA - currA) / (prevR - currR);
            
            if (diffYEven === false) {
                diffYEven = calculatedDiff;
                for (const entryY of mapYEven.entries()) {
                    const [, [rowY, valY]] = entryY;
                    if (isInvalidValue(valY, calculatedDiff, (rowY - 1), (2 - rowY))) {
                        terminateExecution();
                    }
                }
            } else if (calculatedDiff !== diffYEven) {
                terminateExecution();
            }
            
            if (isInvalidValue(currA, calculatedDiff, (currR - 1), (2 - currR))) {
                terminateExecution();
            }
        } else {
            if (diffYEven !== false) {
                if (isInvalidValue(currA, diffYEven, (currR - 1), (2 - currR))) {
                    terminateExecution();
                }
            }
            mapYEven.set(currC, [currR, currA]);
        }
    } else {
        const isEvenRow = (currR % 2 === 0);
        if (isEvenRow) {
            if (mapYEven.has(currC)) {
                const prevRA = mapYEven.get(currC);
                const prevR = prevRA[0];
                const prevA = prevRA[1];
                
                const rowDiffDenominator = (prevR - currR) / 2;
                const calculatedDiff = (prevA - currA) / rowDiffDenominator;
                
                if (diffYEven === false) {
                    diffYEven = calculatedDiff;
                    for (const entryY of mapYEven.entries()) {
                        const [, [rowY, valY]] = entryY;
                        const term1 = (rowY / 2) - 1;
                        const term2 = Math.floor((numRows - rowY) / 2);
                        if (isInvalidValue(valY, calculatedDiff, term1, term2)) {
                            terminateExecution();
                        }
                    }
                } else if (calculatedDiff !== diffYEven) {
                    terminateExecution();
                }
                
                const term1Curr = (currR / 2) - 1;
                const term2Curr = Math.floor((numRows - currR) / 2);
                if (isInvalidValue(currA, calculatedDiff, term1Curr, term2Curr)) {
                    terminateExecution();
                }
            } else {
                if (diffYEven === false) {
                    const term1Curr = (currR / 2) - 1;
                    const term2Curr = Math.floor((numRows - currR) / 2);
                    if (isInvalidValue(currA, diffYEven, term1Curr, term2Curr)) {
                        terminateExecution();
                    }
                }
                mapYEven.set(currC, [currR, currA]);
            }
        } else {
            if (mapYOdd.has(currC)) {
                const prevRA = mapYOdd.get(currC);
                const prevR = prevRA[0];
                const prevA = prevRA[1];
                
                const rowDiffDenominator = (prevR - currR) / 2;
                const calculatedDiff = (prevA - currA) / rowDiffDenominator;
                
                if (diffYOdd === false) {
                    diffYOdd = calculatedDiff;
                    for (const entryY of mapYOdd.entries()) {
                        const [, [rowY, valY]] = entryY;
                        const term1 = Math.floor(rowY / 2);
                        const term2 = Math.floor((numRows - rowY) / 2);
                        if (isInvalidValue(valY, calculatedDiff, term1, term2)) {
                            terminateExecution();
                        }
                    }
                } else if (calculatedDiff !== diffYOdd) {
                    terminateExecution();
                }
                
                const term1Curr = Math.floor((currR - 1) / 2);
                const term2Curr = Math.floor((numRows - currR) / 2);
                if (isInvalidValue(currA, calculatedDiff, term1Curr, term2Curr)) {
                    terminateExecution();
                }
            } else {
                if (diffYOdd === false) {
                    const term1Curr = Math.floor(currR / 2);
                    const term2Curr = Math.floor((numRows - currR) / 2);
                    if (isInvalidValue(currA, diffYOdd, term1Curr, term2Curr)) {
                        terminateExecution();
                    }
                }
                mapYOdd.set(currC, [currR, currA]);
            }
        }
    }
    
    if (numCols === 2) {
        if (mapXEven.has(currR)) {
            const prevCA = mapXEven.get(currR);
            const prevC = prevCA[0];
            const prevA = prevCA[1];
            
            const calculatedDiff = (prevA - currA) / (prevC - currC);
            
            if (diffXEven === -1) {
                diffXEven = calculatedDiff;
                for (const entryX of mapXEven.entries()) {
                    const [, [colX, valX]] = entryX;
                    if (isInvalidValue(valX, calculatedDiff, (colX - 1), (numCols - colX))) {
                        terminateExecution();
                    }
                }
            } else if (calculatedDiff !== diffXEven) {
                terminateExecution();
            }
            
            if (isInvalidValue(currA, calculatedDiff, (currC - 1), (numCols - currC))) {
                terminateExecution();
            }
        } else {
            if (diffXEven !== false) {
                if (isInvalidValue(currA, diffXEven, (currC - 1), (numCols - currC))) {
                    terminateExecution();
                }
            }
            mapXEven.set(currR, [currC, currA]);
        }
    } else {
        const isEvenCol = (currC % 2 === 0);
        if (isEvenCol) {
            if (mapXEven.has(currR)) {
                const prevCA = mapXEven.get(currR);
                const prevC = prevCA[0];
                const prevA = prevCA[1];
                
                const colDiffDenominator = (prevC - currC) / 2;
                const calculatedDiff = (prevA - currA) / colDiffDenominator;
                
                if (diffXEven === false) {
                    diffXEven = calculatedDiff;
                    for (const entryX of mapXEven.entries()) {
                        const [, [colX, valX]] = entryX;
                        const term1 = (colX / 2) - 1;
                        const term2 = Math.floor((numCols - colX) / 2);
                        if (isInvalidValue(valX, calculatedDiff, term1, term2)) {
                            terminateExecution();
                        }
                    }
                } else if (calculatedDiff !== diffXEven) {
                    terminateExecution();
                }
                
                const term1Curr = (currC / 2) - 1;
                const term2Curr = Math.floor((numCols - currC) / 2);
                if (isInvalidValue(currA, calculatedDiff, term1Curr, term2Curr)) {
                    terminateExecution();
                }
            } else {
                if (diffXEven !== false) {
                    const term1Curr = (currC / 2) - 1;
                    const term2Curr = Math.floor((numCols - currC) / 2);
                    if (isInvalidValue(currA, diffXEven, term1Curr, term2Curr)) {
                        terminateExecution();
                    }
                }
                mapXEven.set(currR, [currC, currA]);
            }
        } else {
            if (mapXOdd.has(currR)) {
                const prevCA = mapXOdd.get(currR);
                const prevC = prevCA[0];
                const prevA = prevCA[1];
                
                const colDiffDenominator = (prevC - currC) / 2;
                const calculatedDiff = (prevA - currA) / colDiffDenominator;
                
                if (diffXOdd === false) {
                    diffXOdd = calculatedDiff;
                    for (const entryX of mapXOdd.entries()) {
                        const [, [colX, valX]] = entryX;
                        const term1 = Math.floor(colX / 2);
                        const term2 = Math.floor((numCols - colX) / 2);
                        if (isInvalidValue(valX, calculatedDiff, term1, term2)) {
                            terminateExecution();
                        }
                    }
                } else if (calculatedDiff !== diffXOdd) {
                    terminateExecution();
                }
                
                const term1Curr = Math.floor(currC / 2);
                const term2Curr = Math.floor((numCols - currC) / 2);
                if (isInvalidValue(currA, calculatedDiff, term1Curr, term2Curr)) {
                    terminateExecution();
                }
            } else {
                if (diffXOdd !== false) {
                    const term1Curr = Math.floor(currC / 2);
                    const term2Curr = Math.floor((numCols - currC) / 2);
                    if (isInvalidValue(currA, diffXOdd, term1Curr, term2Curr)) {
                        terminateExecution();
                    }
                }
                mapXOdd.set(currR, [currC, currA]);
            }
        }
    }
}

console.log('Yes');
