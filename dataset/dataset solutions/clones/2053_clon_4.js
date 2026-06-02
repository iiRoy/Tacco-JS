function processGrid(inputString) {
    const parsedLines = inputString.trim().split("\n").map(line => line.split(" "));
    const [gridHeight, gridWidth, maxSegmentSum] = parsedLines[0].map(Number);

    const cellValues = [];
    for (let r = 0; r < gridHeight; r++) {
        cellValues.push(parsedLines[r + 1][0].split("").map(Number));
    }

    const rowCumulativeSums = cellValues.map(row => {
        const currentSums = [0];
        let runningTotal = 0;
        for (let c = 0; c < gridWidth; c++) {
            runningTotal += row[c];
            currentSums.push(runningTotal);
        }
        return currentSums;
    });

    let minimumTotalCuts = Number.POSITIVE_INFINITY;

    const generateHorizontalPartitions = function* (rowIndex = 0, currentBlocks = []) {
        if (rowIndex === gridHeight) {
            if (currentBlocks.length > 0) {
                yield currentBlocks;
            }
            return;
        }

        if (currentBlocks.length > 0) {
            const lastBlock = currentBlocks[currentBlocks.length - 1];
            const newBlocks = [...currentBlocks.slice(0, -1), [...lastBlock, rowIndex]];
            yield* generateHorizontalPartitions(rowIndex + 1, newBlocks);
        }

        yield* generateHorizontalPartitions(rowIndex + 1, [...currentBlocks, [rowIndex]]);
    };

    const combineRowSums = (arrayA, arrayB) => arrayA.map((value, index) => value + arrayB[index]);

    for (const hPartition of generateHorizontalPartitions()) {
        const horizontalCutCount = hPartition.length - 1;

        const blockAggregatedSums = hPartition.map(blockRows =>
            blockRows.reduce((accumulator, rIndex) => combineRowSums(accumulator, rowCumulativeSums[rIndex]), Array(gridWidth + 1).fill(0))
        );

        let verticalCutCount = 0;
        let currentColumnStart = 0;
        let currentColumnIndex = 1;

        while (currentColumnIndex <= gridWidth) {
            let requiresVerticalCut = false;
            for (const blockSumArray of blockAggregatedSums) {
                const segmentSum = blockSumArray[currentColumnIndex] - blockSumArray[currentColumnStart];
                if (segmentSum > maxSegmentSum) {
                    requiresVerticalCut = true;
                    break;
                }
            }

            if (requiresVerticalCut) {
                if (currentColumnIndex - 1 === currentColumnStart) {
                    verticalCutCount = Number.POSITIVE_INFINITY;
                    break;
                }
                verticalCutCount++;
                currentColumnStart = currentColumnIndex - 1;
            } else {
                currentColumnIndex++;
            }
        }

        minimumTotalCuts = Math.min(minimumTotalCuts, horizontalCutCount + verticalCutCount);
    }

    console.log(minimumTotalCuts);
}

processGrid(require("fs").readFileSync("/dev/stdin", "utf8"));
