'use strict';
function computeCount(inputString) {
    const lines = inputString.trim().split('\n');
    const [height, width, targetCount] = lines.shift().split(' ').map(Number);
    const gridData = lines;

    let totalMatches = 0;

    function generateRowSubsets(rowIndex, currentKeptRows) {
        if (rowIndex === height) {
            generateColSubsets(0, currentKeptRows, []);
            return;
        }

        // Branch 1: Exclude current row from the subset
        generateRowSubsets(rowIndex + 1, currentKeptRows);

        // Branch 2: Include current row in the subset
        currentKeptRows.push(rowIndex);
        generateRowSubsets(rowIndex + 1, currentKeptRows);
        currentKeptRows.pop(); // Backtrack for next iteration
    }

    function generateColSubsets(colIndex, keptRows, currentKeptCols) {
        if (colIndex === width) {
            let currentHashCount = 0;
            for (const rIdx of keptRows) {
                for (const cIdx of currentKeptCols) {
                    if (gridData[rIdx][cIdx] === '#') {
                        currentHashCount++;
                    }
                }
            }
            if (currentHashCount === targetCount) {
                totalMatches++;
            }
            return;
        }

        // Branch 1: Exclude current column from the subset
        generateColSubsets(colIndex + 1, keptRows, currentKeptCols);

        // Branch 2: Include current column in the subset
        currentKeptCols.push(colIndex);
        generateColSubsets(colIndex + 1, keptRows, currentKeptCols);
        currentKeptCols.pop(); // Backtrack for next iteration
    }

    generateRowSubsets(0, []);

    return totalMatches;
}

const inputSourceData = require("fs").readFileSync("/dev/stdin", "utf8");
const finalOccurrenceTally = computeCount(inputSourceData);
console.log(finalOccurrenceTally);