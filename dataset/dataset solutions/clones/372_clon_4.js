function identifyDuplicateIndices(sourceArray) {
    const valueCounts = new Map();
    for (const item of sourceArray) {
        valueCounts.set(item, (valueCounts.get(item) || 0) + 1);
    }

    const duplicateValues = new Set();
    for (const [value, count] of valueCounts.entries()) {
        if (count >= 2) {
            duplicateValues.add(value);
        }
    }

    return sourceArray.reduce((accumulator, currentVal, idx) => {
        if (duplicateValues.has(currentVal)) {
            accumulator.push(idx);
        }
        return accumulator;
    }, []);
}

const sourceData = require('fs').readFileSync('/dev/stdin', 'utf8');
const dataLines = sourceData.trim().split("\n");
let outputBuffer = "";
const totalTestCases = Number(dataLines.shift());

for (let testCaseIndex = 0; testCaseIndex < totalTestCases; testCaseIndex++) {
    const gridValues = Array.from({ length: 9 }, () =>
        dataLines.shift().split(" ").map(Number)
    );
    const markerGrid = Array.from({ length: 9 }, () =>
        Array.from({ length: 9 }, () => 0)
    );

    // Process rows
    gridValues.forEach((row, rowIndex) => {
        const problemIndices = identifyDuplicateIndices(row);
        problemIndices.forEach(colIndex => markerGrid[rowIndex][colIndex]++);
    });

    // Process columns
    for (let colIndex = 0; colIndex < 9; colIndex++) {
        const columnValues = gridValues.map(row => row[colIndex]);
        const problemIndices = identifyDuplicateIndices(columnValues);
        problemIndices.forEach(rowIndex => markerGrid[rowIndex][colIndex]++);
    }

    // Process 3x3 blocks
    for (let blockRow = 0; blockRow < 3; blockRow++) {
        for (let blockCol = 0; blockCol < 3; blockCol++) {
            const blockCoords = [];
            const blockValues = [];
            for (let r = 0; r < 3; r++) {
                for (let c = 0; c < 3; c++) {
                    const currentR = blockRow * 3 + r;
                    const currentC = blockCol * 3 + c;
                    blockCoords.push([currentR, currentC]);
                    blockValues.push(gridValues[currentR][currentC]);
                }
            }
            const problemIndices = identifyDuplicateIndices(blockValues);
            problemIndices.forEach(idxInBlock => {
                const [originalR, originalC] = blockCoords[idxInBlock];
                markerGrid[originalR][originalC]++;
            });
        }
    }

    const formattedGrid = gridValues.map((row, rowIndex) =>
        row.map((val, colIndex) =>
            (markerGrid[rowIndex][colIndex] >= 1) ? `*${val}` : ` ${val}`
        ).join('')
    ).join('\n');

    outputBuffer += formattedGrid + '\n\n';
}

console.log(outputBuffer.trim());
