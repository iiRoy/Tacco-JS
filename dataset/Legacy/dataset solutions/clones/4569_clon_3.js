function processInput(rawData) {
    const processedLines = rawData.trim().split("\n");
    const dimensionsStr = processedLines[0].split(" ");

    const heightVal = parseInt(dimensionsStr[0], 10);
    const widthVal = parseInt(dimensionsStr[1], 10);

    const finalDiff = calculateMinDifference(heightVal, widthVal);
    console.log(finalDiff);
}

function findMinDifferenceForOrientation(currentHeight, currentWidth, initialMinDiff) {
    let iterationMinDiff = initialMinDiff;
    let previousIterationMaxDiff = initialMinDiff;

    const halfHeightCeiling = Math.ceil(currentHeight / 2);
    const halfHeightFlooring = Math.floor(currentHeight / 2);
    const heightParityFactor = currentHeight % 2;

    for (let splitPoint = 0; splitPoint <= currentWidth; splitPoint++) {
        const pieceA_Area = splitPoint * currentHeight;

        const pieceB_Area = (currentWidth - splitPoint) * halfHeightCeiling;
        const pieceC_Area = (currentWidth - splitPoint) * halfHeightFlooring;

        const diffAB = Math.abs(pieceA_Area - pieceB_Area);
        const diffAC = Math.abs(pieceA_Area - pieceC_Area);
        const diffBC = Math.abs(pieceB_Area - pieceC_Area);

        const currentIterationMaxDiff = Math.max(diffAB, diffAC, diffBC);

        iterationMinDiff = Math.min(iterationMinDiff, currentIterationMaxDiff);

        if (currentIterationMaxDiff > previousIterationMaxDiff) {
            break;
        }
        previousIterationMaxDiff = currentIterationMaxDiff;
    }
    return iterationMinDiff;
}

function calculateMinDifference(initialHeight, initialWidth) {
    const isHeightDivisibleByThree = (initialHeight % 3 === 0);
    const isWidthDivisibleByThree = (initialWidth % 3 === 0);

    if (isHeightDivisibleByThree || isWidthDivisibleByThree) {
        return 0;
    }

    let minOverallDiff = initialHeight * initialWidth;

    minOverallDiff = findMinDifferenceForOrientation(initialHeight, initialWidth, minOverallDiff);

    let swappedHeight = initialWidth;
    let swappedWidth = initialHeight;

    minOverallDiff = findMinDifferenceForOrientation(swappedHeight, swappedWidth, minOverallDiff);

    return Math.min(minOverallDiff, initialHeight, initialWidth);
}

processInput(require("fs").readFileSync("/dev/stdin", "utf8"));
