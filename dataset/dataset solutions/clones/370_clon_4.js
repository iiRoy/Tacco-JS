const locateRepeatedElements = (valueCollection) => {
    const elementFrequencies = valueCollection.reduce((accumulator, item) => {
        accumulator[item] = (accumulator[item] || 0) + 1;
        return accumulator;
    }, {});

    const repeatingValues = Object.keys(elementFrequencies)
        .filter(key => elementFrequencies[key] >= 2)
        .map(Number);

    if (repeatingValues.length === 0) {
        return [];
    }

    const problemIndices = valueCollection.reduce((accumulator, item, currentIdx) => {
        if (repeatingValues.includes(item)) {
            accumulator.push(currentIdx);
        }
        return accumulator;
    }, []);

    return problemIndices;
};

const fileSystem = require('node:fs');
const documentContent = fileSystem.readFileSync('/dev/stdin', 'utf8');
const documentLines = documentContent.trim().split("\n");

const caseCount = Number(documentLines.shift());
const finalOutputBuffer = [];

for (let testCaseIdx = 0; testCaseIdx < caseCount; testCaseIdx++) {
    const currentGrid = [];
    const problematicCells = new Set(); // Stores "row,col" strings for easy lookup

    for (let rIdx = 0; rIdx < 9; rIdx++) {
        const rowData = documentLines.shift().split(" ").map(Number);
        currentGrid.push(rowData);
    }

    // Evaluate Rows
    for (let r = 0; r < 9; r++) {
        const rowValues = currentGrid[r];
        const indicesWithDuplicates = locateRepeatedElements(rowValues);
        indicesWithDuplicates.forEach(c => problematicCells.add(`${r},${c}`));
    }

    // Evaluate Columns
    for (let c = 0; c < 9; c++) {
        const columnValues = [];
        for (let r = 0; r < 9; r++) {
            columnValues.push(currentGrid[r][c]);
        }
        const indicesWithDuplicates = locateRepeatedElements(columnValues);
        indicesWithDuplicates.forEach(r => problematicCells.add(`${r},${c}`));
    }

    // Evaluate 3x3 Blocks
    for (let blockRowOffset = 0; blockRowOffset < 3; blockRowOffset++) {
        for (let blockColOffset = 0; blockColOffset < 3; blockColOffset++) {
            const blockValues = [];
            const blockCellCoordinates = []; // To map block index back to global (r,c)

            for (let rWithinBlock = 0; rWithinBlock < 3; rWithinBlock++) {
                for (let cWithinBlock = 0; cWithinBlock < 3; cWithinBlock++) {
                    const globalR = blockRowOffset * 3 + rWithinBlock;
                    const globalC = blockColOffset * 3 + cWithinBlock;
                    blockValues.push(currentGrid[globalR][globalC]);
                    blockCellCoordinates.push({ r: globalR, c: globalC });
                }
            }

            const indicesWithDuplicates = locateRepeatedElements(blockValues);
            indicesWithDuplicates.forEach(idx => {
                const { r, c } = blockCellCoordinates[idx];
                problematicCells.add(`${r},${c}`);
            });
        }
    }

    // Format output for the current grid
    const formattedGridLines = currentGrid.map((row, r) => {
        return row.map((cellValue, c) => {
            return problematicCells.has(`${r},${c}`) ? `*${cellValue}` : ` ${cellValue}`;
        }).join('');
    });
    finalOutputBuffer.push(formattedGridLines.join('\n'));

    if (testCaseIdx < caseCount - 1) {
        finalOutputBuffer.push(''); // Add an empty line between test cases
    }
}

console.log(finalOutputBuffer.join('\n'));