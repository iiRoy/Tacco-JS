const fs = require('fs');

const PATH_NORMAL = 0;
const PATH_BLOCKED = 1;
const PATH_SPECIAL = 2;

const parseNumericSequence = (lineString) => {
    return lineString.split(' ').map(numStr => Number.parseInt(numStr, 10));
};

let allInputLines = fs.readFileSync('/dev/stdin', 'utf8').trim().split('\n');

let currentLinePointer = 0;

while (true) {
    const currentDimensions = parseNumericSequence(allInputLines[currentLinePointer++]);
    const gridWidth = currentDimensions[0];
    const gridHeight = currentDimensions[1];

    if (gridWidth === 0 && gridHeight === 0) {
        break;
    }

    const terrainGrid = [];
    for (let rowIdx = 0; rowIdx < gridHeight; ++rowIdx) {
        terrainGrid.push(parseNumericSequence(allInputLines[currentLinePointer++]));
    }

    const pathMemo = Array.from({ length: gridHeight }, () => Array(gridWidth).fill(0));

    for (let r = 0; r < gridHeight; ++r) {
        for (let c = 0; c < gridWidth; ++c) {
            if (r === 0) {
                if (terrainGrid[r][c] === PATH_NORMAL) {
                    pathMemo[r][c] = 1;
                }
                continue;
            }

            let pathsFromDiagLeftUp = 0;
            let pathsFromStraightUp = 0;
            let pathsFromDiagRightUp = 0;
            let pathsFromTwoStepsUpSpecial = 0;

            if (c > 0 && terrainGrid[r - 1][c - 1] !== PATH_SPECIAL) {
                pathsFromDiagLeftUp = pathMemo[r - 1][c - 1];
            }

            if (terrainGrid[r - 1][c] !== PATH_SPECIAL) {
                pathsFromStraightUp = pathMemo[r - 1][c];
            }

            if (c < gridWidth - 1 && terrainGrid[r - 1][c + 1] !== PATH_SPECIAL) {
                pathsFromDiagRightUp = pathMemo[r - 1][c + 1];
            }
            
            if (r >= 2 && terrainGrid[r - 2][c] === PATH_SPECIAL) {
                pathsFromTwoStepsUpSpecial = pathMemo[r - 2][c];
            }

            const currentCellType = terrainGrid[r][c];
            switch (currentCellType) {
                case PATH_NORMAL:
                    pathMemo[r][c] = pathsFromDiagLeftUp + pathsFromStraightUp + pathsFromDiagRightUp + pathsFromTwoStepsUpSpecial;
                    break;
                case PATH_BLOCKED:
                    pathMemo[r][c] = 0;
                    break;
                case PATH_SPECIAL:
                    pathMemo[r][c] = pathsFromStraightUp + pathsFromTwoStepsUpSpecial;
                    break;
                default:
                    console.error(`Unexpected terrain type encountered at (${r},${c}): ${currentCellType}`);
                    pathMemo[r][c] = 0;
                    break;
            }
        }
    }

    let totalAccumulatedPaths = 0;

    for (let finalRow = gridHeight - 2; finalRow < gridHeight; ++finalRow) {
        if (finalRow < 0) {
            continue;
        }

        for (let finalCol = 0; finalCol < gridWidth; ++finalCol) {
            const currentFinalCellType = terrainGrid[finalRow][finalCol];

            if (finalRow === gridHeight - 2) {
                if (currentFinalCellType === PATH_SPECIAL) {
                    totalAccumulatedPaths += pathMemo[finalRow][finalCol];
                }
            } 
            else if (finalRow === gridHeight - 1) {
                if (currentFinalCellType === PATH_NORMAL || currentFinalCellType === PATH_SPECIAL) {
                    totalAccumulatedPaths += pathMemo[finalRow][finalCol];
                }
            }
        }
    }

    console.log(totalAccumulatedPaths);
}