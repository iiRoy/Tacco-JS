function processInputData(rawLines) {
    const [firstLine, ...gridLines] = rawLines;
    const [gridHeight, gridWidth, maxAllowedOnes] = firstLine.split(" ").map(Number);
    const parsedGrid = gridLines.slice(0, gridHeight).map(line => line.split("").map(Number));
    return { gridHeight, gridWidth, maxAllowedOnes, parsedGrid };
}

function* generateHorizontalPartitionings(rows) {
    const totalCombinations = 1 << (rows - 1);
    for (let i = 0; i < totalCombinations; i++) {
        const partitionFlags = Array.from({ length: rows - 1 }, (_, idx) => (i >> idx) & 1);
        yield {
            flags: partitionFlags,
            count: partitionFlags.reduce((acc, val) => acc + val, 0)
        };
    }
}

function determineMinimumCuts(problemData) {
    const { gridHeight, gridWidth, maxAllowedOnes, parsedGrid } = problemData;
    let globalMinimumCuts = gridHeight * gridWidth;

    for (const horizontalConfig of generateHorizontalPartitionings(gridHeight)) {
        const currentHorizontalCutCount = horizontalConfig.count;
        const partitionFlags = horizontalConfig.flags;

        const segmentQuantity = currentHorizontalCutCount + 1;

        let currentVerticalStripTallies = Array(segmentQuantity).fill(0);
        let requiredVerticalCuts = 0;
        let configurationViable = true;

        for (let colIndex = 0; colIndex < gridWidth; colIndex++) {
            const columnSegmentTallies = Array(segmentQuantity).fill(0);
            let activeSegmentIdentifier = 0;

            for (let rowIndex = 0; rowIndex < gridHeight; rowIndex++) {
                if (parsedGrid[rowIndex][colIndex] === 1) {
                    columnSegmentTallies[activeSegmentIdentifier]++;
                }
                if (rowIndex < gridHeight - 1 && partitionFlags[rowIndex] === 1) {
                    activeSegmentIdentifier++;
                }
            }

            if (columnSegmentTallies.some(val => val > maxAllowedOnes)) {
                configurationViable = false;
                break;
            }

            const wouldExceedLimit = columnSegmentTallies.some((val, idx) =>
                currentVerticalStripTallies[idx] + val > maxAllowedOnes
            );

            if (wouldExceedLimit) {
                requiredVerticalCuts++;
                currentVerticalStripTallies = [...columnSegmentTallies];
            } else {
                for (let i = 0; i < segmentQuantity; i++) {
                    currentVerticalStripTallies[i] += columnSegmentTallies[i];
                }
            }
        }

        if (configurationViable) {
            globalMinimumCuts = Math.min(globalMinimumCuts, currentHorizontalCutCount + requiredVerticalCuts);
        }
    }

    return globalMinimumCuts;
}

function solveGridProblem(rawInputLines) {
    const processedData = processInputData(rawInputLines);
    return determineMinimumCuts(processedData);
}

console.log(solveGridProblem(require("fs").readFileSync("/dev/stdin", "utf8").trim().split("\n")));
