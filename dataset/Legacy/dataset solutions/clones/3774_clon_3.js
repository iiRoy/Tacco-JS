'use strict'

function parseStringArrayToInts(strArray) {
    return strArray.map(val => parseInt(val, 10));
}

function readMatrix(sourceArray, startIndex, rows, cols) {
    const matrix = [];
    let currentIdx = startIndex;
    for (let r = 0; r < rows; r++) {
        matrix[r] = [];
        for (let c = 0; c < cols; c++) {
            matrix[r][c] = sourceArray[currentIdx++];
        }
    }
    return matrix;
}

function calculateGroupDiscomfortForTargetColor(cellGroup, targetColorIndex, discomfortLookupMatrix) {
    let totalDiscomfort = 0;
    for (let k = 0; k < cellGroup.length; k++) {
        const originalCellColor = cellGroup[k];
        totalDiscomfort += discomfortLookupMatrix[originalCellColor][targetColorIndex];
    }
    return totalDiscomfort;
}

function ProcessInput(rawData) {
    let parsedData = rawData.split(/\s+/);
    parsedData = parseStringArrayToInts(parsedData);

    let dataCursor = 0;

    const gridSize = parsedData[dataCursor++];
    const colorCount = parsedData[dataCursor++];

    const discomfortMatrix = readMatrix(parsedData, dataCursor, colorCount, colorCount);
    dataCursor += colorCount * colorCount;

    const initialColorGrid = [];
    for (let i = 0; i < gridSize; i++) {
        initialColorGrid[i] = [];
        for (let j = 0; j < gridSize; j++) {
            initialColorGrid[i][j] = parsedData[dataCursor++] - 1;
        }
    }

    const groupedCellsByModulus = [[], [], []];
    for (let rowIdx = 0; rowIdx < gridSize; rowIdx++) {
        for (let colIdx = 0; colIdx < gridSize; colIdx++) {
            const groupIndex = (rowIdx + colIdx) % 3;
            groupedCellsByModulus[groupIndex].push(initialColorGrid[rowIdx][colIdx]);
        }
    }

    const groupDiscomfortsPerTargetColor = [];
    for (let g = 0; g < 3; g++) {
        groupDiscomfortsPerTargetColor[g] = [];
        for (let targetColorIdx = 0; targetColorIdx < colorCount; targetColorIdx++) {
            groupDiscomfortsPerTargetColor[g][targetColorIdx] = calculateGroupDiscomfortForTargetColor(
                groupedCellsByModulus[g],
                targetColorIdx,
                discomfortMatrix
            );
        }
    }

    const topColorsPerGroup = [[], [], []];
    const topScoresPerGroup = [[], [], []];

    for (let g = 0; g < 3; g++) {
        const currentGroupCosts = [...groupDiscomfortsPerTargetColor[g]];
        const sortedCostsWithIndices = currentGroupCosts
            .map((score, index) => ({ score, index }))
            .sort((a, b) => a.score - b.score);

        for (let k = 0; k < Math.min(3, colorCount); k++) {
            topScoresPerGroup[g][k] = sortedCostsWithIndices[k].score;
            topColorsPerGroup[g][k] = sortedCostsWithIndices[k].index;
        }
    }

    let minimumTotalDiscomfort = Infinity;

    const areColorsDistinct = (c1, c2, c3) => c1 !== c2 && c1 !== c3 && c2 !== c3;

    for (let i = 0; i < Math.min(3, colorCount); i++) {
        const colorForGroup0 = topColorsPerGroup[0][i];
        const scoreForGroup0 = topScoresPerGroup[0][i];

        for (let j = 0; j < Math.min(3, colorCount); j++) {
            const colorForGroup1 = topColorsPerGroup[1][j];
            const scoreForGroup1 = topScoresPerGroup[1][j];

            if (colorForGroup0 === colorForGroup1) {
                continue;
            }

            for (let k = 0; k < Math.min(3, colorCount); k++) {
                const colorForGroup2 = topColorsPerGroup[2][k];
                const scoreForGroup2 = topScoresPerGroup[2][k];

                if (!areColorsDistinct(colorForGroup0, colorForGroup1, colorForGroup2)) {
                    continue;
                }

                const currentTotalDiscomfort = scoreForGroup0 + scoreForGroup1 + scoreForGroup2;
                if (currentTotalDiscomfort < minimumTotalDiscomfort) {
                    minimumTotalDiscomfort = currentTotalDiscomfort;
                }
            }
        }
    }

    console.log(minimumTotalDiscomfort);
}

const fileSystemModule = require('fs');
const fileContent = fileSystemModule.readFileSync('/dev/stdin', 'utf8');
ProcessInput(fileContent);
