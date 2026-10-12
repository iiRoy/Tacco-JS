const identifyDuplicatePositions = (sourceValues) => {
    const valueCounts = sourceValues.reduce((accumulator, currentVal) => {
        accumulator.set(currentVal, (accumulator.get(currentVal) || 0) + 1);
        return accumulator;
    }, new Map());

    const repeatedValues = new Set(
        [...valueCounts.entries()]
            .filter(([, count]) => count > 1)
            .map(([val]) => val)
    );

    return sourceValues.flatMap((val, idx) =>
        repeatedValues.has(val) ? [idx] : []
    );
};

const processSudokuGrids = (inputData) => {
    const lines = inputData.trim().split('\n');
    const numberOfCases = parseInt(lines.shift(), 10);

    const allCaseResults = [];

    for (let caseIteration = 0; caseIteration < numberOfCases; caseIteration++) {
        const currentGrid = Array.from({ length: 9 }, () =>
            lines.shift().split(' ').map(Number)
        );

        const cellsToHighlight = new Set();

        for (let rIndex = 0; rIndex < 9; rIndex++) {
            const rowIndicesWithDuplicates = identifyDuplicatePositions(currentGrid[rIndex]);
            rowIndicesWithDuplicates.forEach(cIndex => cellsToHighlight.add(`${rIndex},${cIndex}`));
        }

        for (let cIndex = 0; cIndex < 9; cIndex++) {
            const columnValues = Array.from({ length: 9 }, (_, rIndex) => currentGrid[rIndex][cIndex]);
            const colIndicesWithDuplicates = identifyDuplicatePositions(columnValues);
            colIndicesWithDuplicates.forEach(rIndex => cellsToHighlight.add(`${rIndex},${cIndex}`));
        }

        for (let blockRowStart = 0; blockRowStart < 3; blockRowStart++) {
            for (let blockColStart = 0; blockColStart < 3; blockColStart++) {
                const blockValues = [];
                const blockCoordinateMap = [];

                for (let localR = 0; localR < 3; localR++) {
                    for (let localC = 0; localC < 3; localC++) {
                        const globalR = blockRowStart * 3 + localR;
                        const globalC = blockColStart * 3 + localC;
                        blockValues.push(currentGrid[globalR][globalC]);
                        blockCoordinateMap.push([globalR, globalC]);
                    }
                }

                const blockIndicesWithDuplicates = identifyDuplicatePositions(blockValues);
                blockIndicesWithDuplicates.forEach(oneDIndex => {
                    const [finalR, finalC] = blockCoordinateMap[oneDIndex];
                    cellsToHighlight.add(`${finalR},${finalC}`);
                });
            }
        }

        const formattedOutputGrid = currentGrid.map((rowContent, r) =>
            rowContent.map((cellValue, c) =>
                cellsToHighlight.has(`${r},${c}`) ? `*${cellValue}` : ` ${cellValue}`
            ).join('')
        ).join('\n');

        allCaseResults.push(formattedOutputGrid);
    }

    return allCaseResults.join('\n');
};

const rawInputContent = require('fs').readFileSync('/dev/stdin', 'utf8');
console.log(processSudokuGrids(rawInputContent));
