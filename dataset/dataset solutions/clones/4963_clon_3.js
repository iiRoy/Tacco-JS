'use strict';

const terminateWithError = () => {
    console.log('No');
    process.exit();
};

const rawDataLines = require('fs').readFileSync('/dev/stdin', 'utf8').trim().split('\n');

const gridDimensions = rawDataLines[0].split(' ').map(Number);
const numRows = gridDimensions[0];
const numCols = gridDimensions[1];
const numPoints = parseInt(rawDataLines[1]);
const pointDataStrings = rawDataLines.slice(2);

let diffXOdd = false;
let diffXEven = false;
let diffYOdd = false;
let diffYEven = false;

let xOddPoints = new Map();
let xEvenPoints = new Map();
let yOddPoints = new Map();
let yEvenPoints = new Map();

for (let i = 0; i < numPoints; i++) {
    const currentPointStr = pointDataStrings[i].split(' ');
    const currentRow = parseInt(currentPointStr[0]);
    const currentCol = parseInt(currentPointStr[1]);
    const currentVal = parseInt(currentPointStr[2]);

    // --- Y-axis (Row) Logic ---
    if (numRows === 2) {
        if (yEvenPoints.has(currentCol)) {
            const existingPointY = yEvenPoints.get(currentCol);
            const existingRowY = existingPointY[0];
            const existingValY = existingPointY[1];

            const calculatedDiff = (existingValY - currentVal) / (existingRowY - currentRow);

            if (diffYEven === false) {
                diffYEven = calculatedDiff;

                for (const mapEntryY of yEvenPoints.entries()) {
                    const entryRowY = mapEntryY[1][0];
                    const entryValY = mapEntryY[1][1];

                    const termY1 = diffYEven * (entryRowY - 1);
                    const termY2 = diffYEven * (2 - entryRowY);

                    if (entryValY - termY1 < 0 || entryValY + termY2 < 0) {
                        terminateWithError();
                    }
                }
            } else {
                if (calculatedDiff !== diffYEven) {
                    terminateWithError();
                }
            }

            const termY1_curr = diffYEven * (currentRow - 1);
            const termY2_curr = diffYEven * (2 - currentRow);
            if (currentVal - termY1_curr < 0 || currentVal + termY2_curr < 0) {
                terminateWithError();
            }

        } else {
            if (diffYEven !== false) {
                const termY1_curr = diffYEven * (currentRow - 1);
                const termY2_curr = diffYEven * (2 - currentRow);
                if (currentVal - termY1_curr < 0 || currentVal + termY2_curr < 0) {
                    terminateWithError();
                }
            }
            yEvenPoints.set(currentCol, [currentRow, currentVal]);
        }

    } else {
        const isCurrentRowEven = (currentRow % 2 === 0);

        if (isCurrentRowEven) {
            if (yEvenPoints.has(currentCol)) {
                const existingPointY = yEvenPoints.get(currentCol);
                const existingRowY = existingPointY[0];
                const existingValY = existingPointY[1];

                const divisorY = (existingRowY - currentRow) / 2;
                const calculatedDiff = (existingValY - currentVal) / divisorY;

                if (diffYEven === false) {
                    diffYEven = calculatedDiff;

                    // Original bug: iterates yOddPoints here. Preserving this behavior.
                    for (const mapEntryY of yOddPoints.entries()) {
                        const entryRowY = mapEntryY[1][0];
                        const entryValY = mapEntryY[1][1];

                        const termY1_loop = diffYEven * ((entryRowY / 2) - 1);
                        const termY2_loop = diffYEven * Math.floor((numRows - entryRowY) / 2);

                        if (entryValY - termY1_loop < 0 || entryValY + termY2_loop < 0) {
                            terminateWithError();
                        }
                    }
                } else {
                    if (calculatedDiff !== diffYEven) {
                        terminateWithError();
                    }
                }
                const termY1_curr = diffYEven * ((currentRow / 2) - 1);
                const termY2_curr = diffYEven * Math.floor((numRows - currentRow) / 2);
                if (currentVal - termY1_curr < 0 || currentVal + termY2_curr < 0) {
                    terminateWithError();
                }

            } else {
                // Original behavior: if diffYEven is false, it performs calculation with false (which becomes 0).
                if (diffYEven === false) {
                    const termY1_curr = diffYEven * ((currentRow / 2) - 1);
                    const termY2_curr = diffYEven * Math.floor((numRows - currentRow) / 2);
                    if (currentVal - termY1_curr < 0 || currentVal + termY2_curr < 0) {
                        terminateWithError();
                    }
                }
                yEvenPoints.set(currentCol, [currentRow, currentVal]);
            }
        } else { // Current row is odd
            if (yOddPoints.has(currentCol)) {
                const existingPointY = yOddPoints.get(currentCol);
                const existingRowY = existingPointY[0];
                const existingValY = existingPointY[1];

                const divisorY = (existingRowY - currentRow) / 2;
                const calculatedDiff = (existingValY - currentVal) / divisorY;

                if (diffYOdd === false) {
                    diffYOdd = calculatedDiff;

                    for (const mapEntryY of yOddPoints.entries()) {
                        const entryRowY = mapEntryY[1][0];
                        const entryValY = mapEntryY[1][1];

                        const termY1_loop = diffYOdd * Math.floor(entryRowY / 2);
                        const termY2_loop = diffYOdd * Math.floor((numRows - entryRowY) / 2);

                        if (entryValY - termY1_loop < 0 || entryValY + termY2_loop < 0) {
                            terminateWithError();
                        }
                    }
                } else {
                    if (calculatedDiff !== diffYOdd) {
                        terminateWithError();
                    }
                }
                const termY1_curr = diffYOdd * Math.floor((currentRow - 1) / 2);
                const termY2_curr = diffYOdd * Math.floor((numRows - currentRow) / 2);
                if (currentVal - termY1_curr < 0 || currentVal + termY2_curr < 0) {
                    terminateWithError();
                }
            } else {
                // Original behavior: if diffYOdd is false, it performs calculation with false (which becomes 0).
                if (diffYOdd === false) {
                    const termY1_curr = diffYOdd * Math.floor(currentRow / 2);
                    const termY2_curr = diffYOdd * Math.floor((numRows - currentRow) / 2);
                    if (currentVal - termY1_curr < 0 || currentVal + termY2_curr < 0) {
                        terminateWithError();
                    }
                }
                yOddPoints.set(currentCol, [currentRow, currentVal]);
            }
        }
    }

    // --- X-axis (Column) Logic ---
    if (numCols === 2) {
        if (xEvenPoints.has(currentRow)) {
            const existingPointX = xEvenPoints.get(currentRow);
            const existingColX = existingPointX[0];
            const existingValX = existingPointX[1];

            const calculatedDiff = (existingValX - currentVal) / (existingColX - currentCol);

            if (diffXEven === -1) { // Note: -1 is the sentinel for C=2 case
                diffXEven = calculatedDiff;

                for (const mapEntryX of xEvenPoints.entries()) {
                    const entryColX = mapEntryX[1][0];
                    const entryValX = mapEntryX[1][1];

                    const termX1 = diffXEven * (entryColX - 1);
                    const termX2 = diffXEven * (numCols - entryColX);

                    if (entryValX - termX1 < 0 || entryValX + termX2 < 0) {
                        terminateWithError();
                    }
                }
            } else {
                if (calculatedDiff !== diffXEven) {
                    terminateWithError();
                }
            }
            const termX1_curr = diffXEven * (currentCol - 1);
            const termX2_curr = diffXEven * (numCols - currentCol);
            if (currentVal - termX1_curr < 0 || currentVal + termX2_curr < 0) {
                terminateWithError();
            }

        } else {
            // Original behavior: if diffXEven is false or -1, it performs calculation.
            // This means if diffXEven is false, it uses 0. If it's -1, it uses -1.
            if (diffXEven !== false) {
                const termX1_curr = diffXEven * (currentCol - 1);
                const termX2_curr = diffXEven * (numCols - currentCol);
                if (currentVal - termX1_curr < 0 || currentVal + termX2_curr < 0) {
                    terminateWithError();
                }
            }
            xEvenPoints.set(currentRow, [currentCol, currentVal]);
        }
    } else {
        const isCurrentColEven = (currentCol % 2 === 0);

        if (isCurrentColEven) {
            if (xEvenPoints.has(currentRow)) {
                const existingPointX = xEvenPoints.get(currentRow);
                const existingColX = existingPointX[0];
                const existingValX = existingPointX[1];

                const divisorX = (existingColX - currentCol) / 2;
                const calculatedDiff = (existingValX - currentVal) / divisorX;

                if (diffXEven === false) {
                    diffXEven = calculatedDiff;

                    for (const mapEntryX of xEvenPoints.entries()) {
                        const entryColX = mapEntryX[1][0];
                        const entryValX = mapEntryX[1][1];

                        const termX1_loop = diffXEven * ((entryColX / 2) - 1);
                        const termX2_loop = diffXEven * Math.floor((numCols - entryColX) / 2);

                        if (entryValX - termX1_loop < 0 || entryValX + termX2_loop < 0) {
                            terminateWithError();
                        }
                    }
                } else {
                    if (calculatedDiff !== diffXEven) {
                        terminateWithError();
                    }
                }
                const termX1_curr = diffXEven * ((currentCol / 2) - 1);
                const termX2_curr = diffXEven * Math.floor((numCols - currentCol) / 2);
                if (currentVal - termX1_curr < 0 || currentVal + termX2_curr < 0) {
                    terminateWithError();
                }
            } else {
                if (diffXEven !== false) {
                    const termX1_curr = diffXEven * ((currentCol / 2) - 1);
                    const termX2_curr = diffXEven * Math.floor((numCols - currentCol) / 2);
                    if (currentVal - termX1_curr < 0 || currentVal + termX2_curr < 0) {
                        terminateWithError();
                    }
                }
                xEvenPoints.set(currentRow, [currentCol, currentVal]);
            }

        } else { // Current column is odd
            if (xOddPoints.has(currentRow)) {
                const existingPointX = xOddPoints.get(currentRow);
                const existingColX = existingPointX[0];
                const existingValX = existingPointX[1];

                const divisorX = (existingColX - currentCol) / 2;
                const calculatedDiff = (existingValX - currentVal) / divisorX;

                if (diffXOdd === false) {
                    diffXOdd = calculatedDiff;

                    for (const mapEntryX of xOddPoints.entries()) {
                        const entryColX = mapEntryX[1][0];
                        const entryValX = mapEntryX[1][1];

                        const termX1_loop = diffXOdd * Math.floor(entryColX / 2);
                        const termX2_loop = diffXOdd * Math.floor((numCols - entryColX) / 2);

                        if (entryValX - termX1_loop < 0 || entryValX + termX2_loop < 0) {
                            terminateWithError();
                        }
                    }
                } else {
                    if (calculatedDiff !== diffXOdd) {
                        terminateWithError();
                    }
                }
                const termX1_curr = diffXOdd * Math.floor(currentCol / 2);
                const termX2_curr = diffXOdd * Math.floor((numCols - currentCol) / 2);
                if (currentVal - termX1_curr < 0 || currentVal + termX2_curr < 0) {
                    terminateWithError();
                }
            } else {
                if (diffXOdd !== false) {
                    const termX1_curr = diffXOdd * Math.floor(currentCol / 2);
                    const termX2_curr = diffXOdd * Math.floor((numCols - currentCol) / 2);
                    if (currentVal - termX1_curr < 0 || currentVal + termX2_curr < 0) {
                        terminateWithError();
                    }
                }
                xOddPoints.set(currentRow, [currentCol, currentVal]);
            }
        }
    }
}

console.log('Yes');
