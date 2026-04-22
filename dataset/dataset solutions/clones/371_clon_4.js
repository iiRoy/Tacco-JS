const findBadCoordinates = (digitSequence) => {
    const digitTallies = digitSequence.reduce((accumulator, currentDigit) => {
        accumulator[currentDigit] = (accumulator[currentDigit] || 0) + 1;
        return accumulator;
    }, {});

    const redundantDigits = Object.keys(digitTallies)
                                  .filter(key => digitTallies[key] > 1)
                                  .map(Number);

    const problematicPositions = digitSequence.reduce((accumulator, currentDigit, currentIndex) => {
        if (redundantDigits.includes(currentDigit)) {
            accumulator.push(currentIndex);
        }
        return accumulator;
    }, []);
    return problematicPositions;
};

const processSudokuGrids = (rawPuzzleInput) => {
    let inputLines = rawPuzzleInput.trim().split('\n');
    let totalPuzzleCount = parseInt(inputLines.shift(), 10);
    let collectedOutputs = [];
    let currentPuzzleIteration = 0;

    while (currentPuzzleIteration < totalPuzzleCount) {
        if (currentPuzzleIteration > 0) {
            collectedOutputs.push(''); // Add an empty string for the newline separator
        }

        let currentSudokuLayout = [];
        for (let r = 0; r < 9; r++) {
            currentSudokuLayout.push(inputLines.shift().split(' ').map(Number));
        }

        let violationMarkers = Array.from({ length: 9 }, () => Array(9).fill(0));

        const applyValidationCheck = (dataExtractor) => {
            for (let i = 0; i < 9; i++) {
                const { elements: extractedElements, map: coordinateMap } = dataExtractor(currentSudokuLayout, i);
                const localBadIndices = findBadCoordinates(extractedElements);
                localBadIndices.forEach(localIndex => {
                    const [globalRow, globalCol] = coordinateMap[localIndex];
                    violationMarkers[globalRow][globalCol]++;
                });
            }
        };

        const getRowData = (grid, rowIdentifier) => {
            return {
                elements: grid[rowIdentifier],
                map: Array.from({ length: 9 }, (_, colIdentifier) => [rowIdentifier, colIdentifier])
            };
        };
        applyValidationCheck(getRowData);

        const getColumnData = (grid, colIdentifier) => {
            const elements = [];
            const map = [];
            for (let r = 0; r < 9; r++) {
                elements.push(grid[r][colIdentifier]);
                map.push([r, colIdentifier]);
            }
            return { elements, map };
        };
        applyValidationCheck(getColumnData);

        const getBlockData = (grid, blockIdentifier) => { // blockIdentifier from 0 to 8
            const startingRow = Math.floor(blockIdentifier / 3) * 3;
            const startingCol = (blockIdentifier % 3) * 3;
            const elements = [];
            const map = [];
            for (let rOffset = 0; rOffset < 3; rOffset++) {
                for (let cOffset = 0; cOffset < 3; cOffset++) {
                    const globalR = startingRow + rOffset;
                    const globalC = startingCol + cOffset;
                    elements.push(grid[globalR][globalC]);
                    map.push([globalR, globalC]);
                }
            }
            return { elements, map };
        };
        // Blocks need a direct loop as applyValidationCheck iterates 9 times for a specific type (row/col)
        for (let blockIdx = 0; blockIdx < 9; blockIdx++) {
             const { elements: blockElements, map: blockCoordinateMap } = getBlockData(currentSudokuLayout, blockIdx);
             const badIndicesInBlock = findBadCoordinates(blockElements);
             badIndicesInBlock.forEach(localIdx => {
                 const [originalR, originalC] = blockCoordinateMap[localIdx];
                 violationMarkers[originalR][originalC]++;
             });
        }

        let formattedOutputGrid = currentSudokuLayout.map((row, rIndex) => {
            return row.map((value, cIndex) => {
                return (violationMarkers[rIndex][cIndex] > 0) ? `*${value}` : ` ${value}`;
            }).join('');
        });
        collectedOutputs.push(formattedOutputGrid.join('\n'));

        currentPuzzleIteration++;
    }
    return collectedOutputs.join('\n');
};

const suppliedData = require('fs').readFileSync('/dev/stdin', 'utf8');
console.log(processSudokuGrids(suppliedData));