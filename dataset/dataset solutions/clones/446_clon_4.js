const sourceData = require('fs').readFileSync('/dev/stdin', 'utf8');
const dataLines = sourceData.trim().split('\n');

let currentLinePointer = 0;
const collectedResults = [];

while (true) {
    const puzzleDimensionLine = dataLines[currentLinePointer++].split(' ').map(Number);
    const puzzleWidth = puzzleDimensionLine[0];
    const puzzleHeight = puzzleDimensionLine[1];

    if (puzzleWidth === 0 && puzzleHeight === 0) {
        break;
    }

    const cellConfigurations = [];
    for (let rIndex = 0; rIndex < puzzleHeight; ++rIndex) {
        cellConfigurations.push(dataLines[currentLinePointer++].split(' ').map(Number));
    }

    const memoizationCache = Array.from({ length: puzzleHeight }, () =>
        Array.from({ length: puzzleWidth }, () => undefined)
    );

    const calculatePathCount = (row, col) => {
        if (row < 0 || col < 0 || row >= puzzleHeight || col >= puzzleWidth) {
            return 0;
        }

        if (memoizationCache[row][col] !== undefined) {
            return memoizationCache[row][col];
        }

        let currentCellContribution = 0;
        const currentCellType = cellConfigurations[row][col];

        if (row === 0) {
            currentCellContribution = (currentCellType === 0) ? 1 : 0;
        } else {
            const upLeftContribution = (col === 0 || cellConfigurations[row - 1][col - 1] === 2)
                ? 0
                : calculatePathCount(row - 1, col - 1);

            const upDirectContribution = (cellConfigurations[row - 1][col] === 2)
                ? 0
                : calculatePathCount(row - 1, col);

            const upRightContribution = (col === puzzleWidth - 1 || cellConfigurations[row - 1][col + 1] === 2)
                ? 0
                : calculatePathCount(row - 1, col + 1);
            
            let upUpContribution = 0;
            if (row >= 2) {
                if (cellConfigurations[row - 2][col] === 2) {
                    upUpContribution = calculatePathCount(row - 2, col);
                } else {
                    upUpContribution = 0;
                }
            }
            
            if (currentCellType === 0) {
                currentCellContribution = upLeftContribution + upDirectContribution + upRightContribution + upUpContribution;
            } else if (currentCellType === 1) {
                currentCellContribution = 0;
            } else if (currentCellType === 2) {
                currentCellContribution = upDirectContribution + upUpContribution;
            }
        }

        memoizationCache[row][col] = currentCellContribution;
        return currentCellContribution;
    };

    for (let r = 0; r < puzzleHeight; ++r) {
        for (let c = 0; c < puzzleWidth; ++c) {
            calculatePathCount(r, c);
        }
    }

    let finalAggregateScore = 0;
    for (let rIter = puzzleHeight - 2; rIter < puzzleHeight; ++rIter) {
        if (rIter < 0) continue;

        for (let cIter = 0; cIter < puzzleWidth; ++cIter) {
            if (puzzleHeight >= 2 && rIter === puzzleHeight - 2 && cellConfigurations[rIter][cIter] === 2) {
                finalAggregateScore += memoizationCache[rIter][cIter];
            }
            if (puzzleHeight >= 1 && rIter === puzzleHeight - 1 && (cellConfigurations[rIter][cIter] === 0 || cellConfigurations[rIter][cIter] === 2)) {
                finalAggregateScore += memoizationCache[rIter][cIter];
            }
        }
    }

    collectedResults.push(finalAggregateScore);
}

collectedResults.forEach(finalScore => console.log(finalScore));