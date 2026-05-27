'use strict';
const inputLines = require('fs').readFileSync('/dev/stdin', 'utf8').trim().split('\n');

const exitWithError = () => {
    console.log('No');
    process.exit();
};

const checkBounds = (value, diff, offset1, offset2) => {
    if (value - diff * offset1 < 0 || value + diff * offset2 < 0) {
        exitWithError();
    }
};

const rowColSpec = inputLines[0].split(' ').map(Number);
const numRows = rowColSpec[0];
const numCols = rowColSpec[1];
const numPoints = parseInt(inputLines[1]);
const pointStrings = inputLines.slice(2);

let diffXOdd = -1;
let diffXEven = -1;
let diffYOdd = -1;
let diffYEven = -1;

let colMapOdd = new Map();
let colMapEven = new Map();
let rowMapOdd = new Map();
let rowMapEven = new Map();

for (let pointIdx = 0; pointIdx < numPoints; pointIdx++) {
    const currentPointStr = pointStrings[pointIdx].split(' ');
    const currRow = parseInt(currentPointStr[0]);
    const currCol = parseInt(currentPointStr[1]);
    const currVal = parseInt(currentPointStr[2]);
    
    // --- Y-dimension processing ---
    if (numRows === 2) {
        if (rowMapEven.has(currCol)) {
            const prevRowVal = rowMapEven.get(currCol);
            // prevRowVal[0] (prevRow) is not used in this specific d calculation
            const prevVal = prevRowVal[1];
            
            const calculatedDiff = prevVal - currVal;
            
            if (diffYEven === -1) {
                diffYEven = calculatedDiff;
            } else {
                checkAndExit(calculatedDiff !== diffYEven);
            }
            
            const offset1 = currRow;
            const offset2 = numRows - currRow;
            checkBounds(currVal, calculatedDiff, offset1, offset2);
            
        } else {
            rowMapEven.set(currCol, [currRow, currVal]);
        }
        
    } else { // numRows > 2
        if (currRow % 2 === 0) { // Even row
            if (rowMapEven.has(currCol)) {
                const prevRowVal = rowMapEven.get(currCol);
                const prevRow = prevRowVal[0];
                const prevVal = prevRowVal[1];
                
                const rowCoordDiffHalf = (prevRow - currRow) / 2;
                const calculatedDiff = (prevVal - currVal) / rowCoordDiffHalf;
                
                if (diffYEven === -1) {
                    checkAndExit(Math.round(calculatedDiff) !== calculatedDiff);
                    diffYEven = calculatedDiff;
                    
                    // Cross-check existing odd-row points with this new even-row difference
                    for (const mapEntry of rowMapOdd.entries()) {
                        // mapEntry[0] (checkCol) is not used in boundary check
                        const checkRow = mapEntry[1][0];
                        const checkVal = mapEntry[1][1];
                        
                        // Note: Original code uses ((r3 / 2) - 1) for odd r3 here. Preserving this behavior.
                        const offset1ForCrossCheck = (checkRow / 2) - 1;
                        const offset2ForCrossCheck = Math.floor((numRows - checkRow) / 2);
                        checkBounds(checkVal, calculatedDiff, offset1ForCrossCheck, offset2ForCrossCheck);
                    }
                } else {
                    checkAndExit(calculatedDiff !== diffYEven);
                }
                
                const offset1 = (currRow / 2) - 1;
                const offset2 = Math.floor((numRows - currRow) / 2);
                checkBounds(currVal, calculatedDiff, offset1, offset2);
                
            } else {
                rowMapEven.set(currCol, [currRow, currVal]);
            }
            
        } else { // Odd row
            if (rowMapOdd.has(currCol)) {
                const prevRowVal = rowMapOdd.get(currCol);
                const prevRow = prevRowVal[0];
                const prevVal = prevRowVal[1];
                
                const rowCoordDiffHalf = (prevRow - currRow) / 2;
                const calculatedDiff = (prevVal - currVal) / rowCoordDiffHalf;
                
                if (diffYOdd === -1) {
                    checkAndExit(Math.round(calculatedDiff) !== calculatedDiff);
                    diffYOdd = calculatedDiff;
                    
                    // Cross-check existing odd-row points with this new odd-row difference
                    for (const mapEntry of rowMapOdd.entries()) {
                        // mapEntry[0] (checkCol) is not used in boundary check
                        const checkRow = mapEntry[1][0];
                        const checkVal = mapEntry[1][1];
                        
                        const offset1ForCrossCheck = Math.floor(checkRow / 2);
                        const offset2ForCrossCheck = Math.floor((numRows - checkRow) / 2);
                        checkBounds(checkVal, calculatedDiff, offset1ForCrossCheck, offset2ForCrossCheck);
                    }
                } else {
                    checkAndExit(calculatedDiff !== diffYOdd);
                }
                
                const offset1 = Math.floor(currRow / 2);
                const offset2 = Math.floor((numRows - currRow) / 2);
                checkBounds(currVal, calculatedDiff, offset1, offset2);
            } else {
                rowMapOdd.set(currCol, [currRow, currVal]);
            }
        }
    }
    
    // --- X-dimension processing ---
    if (numCols === 2) {
        if (colMapEven.has(currRow)) {
            const prevColVal = colMapEven.get(currRow);
            // prevColVal[0] (prevCol) is not used in this specific d calculation
            const prevVal = prevColVal[1];
            
            const calculatedDiff = prevVal - currVal;
            
            if (diffXEven === -1) {
                diffXEven = calculatedDiff;
            } else {
                checkAndExit(calculatedDiff !== diffXEven);
            }
            
            const offset1 = currCol;
            const offset2 = numCols - currCol;
            checkBounds(currVal, calculatedDiff, offset1, offset2);
            
        } else {
            colMapEven.set(currRow, [currCol, currVal]);
        }
    } else { // numCols > 2
        if (currCol % 2 === 0) { // Even column
            if (colMapEven.has(currRow)) {
                const prevColVal = colMapEven.get(currRow);
                const prevCol = prevColVal[0];
                const prevVal = prevColVal[1];
                
                const colCoordDiffHalf = (prevCol - currCol) / 2;
                const calculatedDiff = (prevVal - currVal) / colCoordDiffHalf;
                
                if (diffXEven === -1) {
                    checkAndExit(Math.round(calculatedDiff) !== calculatedDiff);
                    diffXEven = calculatedDiff;
                    
                    // Cross-check existing even-col points with this new even-col difference
                    for (const mapEntry of colMapEven.entries()) {
                        // mapEntry[0] (checkRow) is not used in boundary check
                        const checkCol = mapEntry[1][0];
                        const checkVal = mapEntry[1][1];
                        
                        const offset1ForCrossCheck = (checkCol / 2) - 1;
                        const offset2ForCrossCheck = Math.floor((numCols - checkCol) / 2);
                        checkBounds(checkVal, calculatedDiff, offset1ForCrossCheck, offset2ForCrossCheck);
                    }
                } else {
                    checkAndExit(calculatedDiff !== diffXEven);
                }
                
                const offset1 = (currCol / 2) - 1;
                const offset2 = Math.floor((numCols - currCol) / 2);
                checkBounds(currVal, calculatedDiff, offset1, offset2);
            } else {
                colMapEven.set(currRow, [currCol, currVal]);
            }
            
        } else { // Odd column
            if (colMapOdd.has(currRow)) {
                const prevColVal = colMapOdd.get(currRow);
                const prevCol = prevColVal[0];
                const prevVal = prevColVal[1];
                
                const colCoordDiffHalf = (prevCol - currCol) / 2;
                const calculatedDiff = (prevVal - currVal) / colCoordDiffHalf;
                
                if (diffXOdd === -1) {
                    checkAndExit(Math.round(calculatedDiff) !== calculatedDiff);
                    diffXOdd = calculatedDiff;
                    
                    // Cross-check existing odd-col points with this new odd-col difference
                    for (const mapEntry of colMapOdd.entries()) {
                        // mapEntry[0] (checkRow) is not used in boundary check
                        const checkCol = mapEntry[1][0];
                        const checkVal = mapEntry[1][1];
                        
                        const offset1ForCrossCheck = Math.floor(checkCol / 2);
                        const offset2ForCrossCheck = Math.floor((numCols - checkCol) / 2);
                        checkBounds(checkVal, calculatedDiff, offset1ForCrossCheck, offset2ForCrossCheck);
                    }
                } else {
                    checkAndExit(calculatedDiff !== diffXOdd);
                }
                
                const offset1 = Math.floor(currCol / 2);
                const offset2 = Math.floor((numCols - currCol) / 2);
                checkBounds(currVal, calculatedDiff, offset1, offset2);
            } else {
                colMapOdd.set(currRow, [currCol, currVal]);
            }
        }
    }
}

console.log('Yes');
