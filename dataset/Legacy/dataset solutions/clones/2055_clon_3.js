function parseInitialParameters(inputLine) {
    const parts = inputLine.split(" ");
    return {
        height: parseInt(parts[0], 10),
        width: parseInt(parts[1], 10),
        maxAllowedOnes: parseInt(parts[2], 10)
    };
}

function buildGrid(inputLines, height) {
    const grid = new Array(height);
    for (let i = 0; i < height; i++) {
        grid[i] = inputLines[i + 1];
    }
    return grid;
}

let minimumTotalCuts = 0;

function processInput(rawDataLines) {
    const params = parseInitialParameters(rawDataLines[0]);
    const gridHeight = params.height;
    const gridWidth = params.width;
    const maxOnesPerSegment = params.maxAllowedOnes;

    const gridData = buildGrid(rawDataLines, gridHeight);

    minimumTotalCuts = gridHeight * gridWidth;

    const bitmaskCombinations = generateBitmasks(gridHeight - 1);

    for (const currentCombination of bitmaskCombinations) {
        evaluateCombination(gridData, currentCombination, maxOnesPerSegment, gridHeight);
    }

    console.log(minimumTotalCuts);
}

function evaluateCombination(gridData, combinationDetails, maxOnesPerSegment, gridHeight) {
    let cutsForThisCombination = combinationDetails.cutCount;
    const columnCount = gridData[0].length;
    const segmentMaskString = combinationDetails.maskString;

    let currentColumnIndex = 0;
    let previousColumnSuccessfullyProcessed = false;
    let cutAddedForPreviousColumn = false;

    while (currentColumnIndex < columnCount) {
        let segmentOnesCounts = new Array(gridHeight).fill(0);
        let currentColumnExceedsLimit = false;

        for (let rowIdx = 0; rowIdx < gridHeight; rowIdx++) {
            let segmentIdentifier = 0;
            for (let k = 0; k < rowIdx; k++) {
                if (segmentMaskString[k] === "1") {
                    segmentIdentifier++;
                }
            }

            if (gridData[rowIdx][currentColumnIndex] === "1") {
                segmentOnesCounts[segmentIdentifier]++;
            }

            if (segmentOnesCounts[segmentIdentifier] > maxOnesPerSegment) {
                currentColumnExceedsLimit = true;
                break;
            }
        }

        if (currentColumnExceedsLimit) {
            if (!previousColumnSuccessfullyProcessed) {
                return;
            }
            cutsForThisCombination++;
            cutAddedForPreviousColumn = true;
            previousColumnSuccessfullyProcessed = false;
        } else {
            previousColumnSuccessfullyProcessed = true;
            if (cutAddedForPreviousColumn) {
                cutsForThisCombination++;
                cutAddedForPreviousColumn = false;
            }
            currentColumnIndex++;
        }
    }

    minimumTotalCuts = Math.min(minimumTotalCuts, cutsForThisCombination);
}

function generateBitmasks(numRowsForCuts) {
    const combinations = [];
    const totalPossibleMasks = 1 << numRowsForCuts;

    for (let i = 0; i < totalPossibleMasks; i++) {
        const binaryMaskString = i.toString(2).padStart(numRowsForCuts, '0');
        combinations.push({
            cutCount: countSetBits(i),
            maskString: binaryMaskString
        });
    }
    return combinations.sort((a, b) => a.cutCount - b.cutCount);
}

function countSetBits(value) {
    value = value - ((value >> 1) & 0x55555555);
    value = (value & 0x33333333) + ((value >> 2) & 0x33333333);
    return ((value + (value >> 4) & 0xF0F0F0F) * 0x1010101) >> 24;
}

processInput(require("fs").readFileSync("/dev/stdin", "utf8").trim().split("\n"));
