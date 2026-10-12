function calculateSplitDifference(currentX, currentY, useCeilForFirstPart) {
    let partAreas = [];
    let firstAreaXDimension;
    let remainingXDimension;

    if (useCeilForFirstPart) {
        firstAreaXDimension = Math.ceil(currentX / 3);
        remainingXDimension = Math.floor(currentX / 3 * 2);
    } else {
        firstAreaXDimension = Math.floor(currentX / 3);
        remainingXDimension = Math.ceil(currentX / 3 * 2);
    }

    partAreas.push(firstAreaXDimension * currentY);
    partAreas.push(remainingXDimension * Math.ceil(currentY / 2));
    partAreas.push(remainingXDimension * Math.floor(currentY / 2));

    let maxArea = Math.max(...partAreas);
    let minArea = Math.min(...partAreas);
    return maxArea - minArea;
}

function processInput(rawData) {
    let dimensions = rawData.split(" ").map(Number);
    let currentX = dimensions[0];
    let currentY = dimensions[1];

    let minimumDifference = Number.MAX_SAFE_INTEGER;

    const updateMinimum = (diffValue) => {
        minimumDifference = Math.min(minimumDifference, diffValue);
    };

    updateMinimum(calculateSplitDifference(currentX, currentY, false));
    updateMinimum(calculateSplitDifference(currentX, currentY, true));

    let tempDimension = currentX;
    currentX = currentY;
    currentY = tempDimension;

    updateMinimum(calculateSplitDifference(currentX, currentY, false));
    updateMinimum(calculateSplitDifference(currentX, currentY, true));

    if (currentX % 3 === 0) {
        minimumDifference = 0;
    } else {
        minimumDifference = Math.min(minimumDifference, currentY);
    }

    if (currentY % 3 === 0) {
        minimumDifference = 0;
    } else {
        minimumDifference = Math.min(minimumDifference, currentX);
    }

    console.log(minimumDifference);
}

processInput(require("fs").readFileSync("/dev/stdin", "utf8").trim());
