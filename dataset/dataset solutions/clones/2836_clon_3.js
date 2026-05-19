function processInputData(rawData) {
    const numEntries = parseInt(rawData.shift());

    let leftMinX = Number.MAX_SAFE_INTEGER;
    let leftMaxX = Number.MIN_SAFE_INTEGER;
    let leftRightMinY = Number.MAX_SAFE_INTEGER;
    let leftRightMaxY = Number.MIN_SAFE_INTEGER;

    let rightMinX = Number.MAX_SAFE_INTEGER;
    let rightMaxX = Number.MIN_SAFE_INTEGER;

    let upDownMinX = Number.MAX_SAFE_INTEGER;
    let upDownMaxX = Number.MIN_SAFE_INTEGER;

    let upMinY = Number.MAX_SAFE_INTEGER;
    let upMaxY = Number.MIN_SAFE_INTEGER;

    let downMinY = Number.MAX_SAFE_INTEGER;
    let downMaxY = Number.MIN_SAFE_INTEGER;

    let foundLeft = false;
    let foundRight = false;
    let foundUp = false;
    let foundDown = false;

    const parseEntry = (dataArray, baseIndex) => {
        const currentX = parseInt(dataArray[baseIndex]);
        const currentY = parseInt(dataArray[baseIndex + 1]);
        const directionChar = dataArray[baseIndex + 2];
        return { currentX, currentY, directionChar };
    };

    for (let idx = 0; idx < numEntries; idx++) {
        const { currentX, currentY, directionChar } = parseEntry(rawData, idx * 3);

        if (directionChar === "L") {
            leftMinX = Math.min(leftMinX, currentX);
            leftMaxX = Math.max(leftMaxX, currentX);
            leftRightMinY = Math.min(leftRightMinY, currentY);
            leftRightMaxY = Math.max(leftRightMaxY, currentY);
            foundLeft = true;
        } else if (directionChar === "R") {
            rightMinX = Math.min(rightMinX, currentX);
            rightMaxX = Math.max(rightMaxX, currentX);
            leftRightMinY = Math.min(leftRightMinY, currentY);
            leftRightMaxY = Math.max(leftRightMaxY, currentY);
            foundRight = true;
        } else if (directionChar === "U") {
            upDownMinX = Math.min(upDownMinX, currentX);
            upDownMaxX = Math.max(upDownMaxX, currentX);
            upMinY = Math.min(upMinY, currentY);
            upMaxY = Math.max(upMaxY, currentY);
            foundUp = true;
        } else if (directionChar === "D") {
            upDownMinX = Math.min(upDownMinX, currentX);
            upDownMaxX = Math.max(upDownMaxX, currentX);
            downMinY = Math.min(downMinY, currentY);
            downMaxY = Math.max(downMaxY, currentY);
            foundDown = true;
        }
    }

    let minArea = Number.MAX_SAFE_INTEGER;
    let continueIteration = true;

    const calculateOverallExtremes = () => {
        const currentMinX = Math.min(leftMinX, rightMinX, upDownMinX);
        const currentMaxX = Math.max(leftMaxX, rightMaxX, upDownMaxX);
        const currentMinY = Math.min(leftRightMinY, upMinY, downMinY);
        const currentMaxY = Math.max(leftRightMaxY, upMaxY, downMaxY);
        return { currentMinX, currentMaxX, currentMinY, currentMaxY };
    };

    const adjustBoundaryValues = () => {
        leftMinX--;
        leftMaxX--;
        rightMinX++;
        rightMaxX++;
        upMinY++;
        upMaxY++;
        downMinY--;
        downMaxY--;
    };

    while (continueIteration) {
        const { currentMinX, currentMaxX, currentMinY, currentMaxY } = calculateOverallExtremes();

        minArea = Math.min(minArea, (currentMaxX - currentMinX) * (currentMaxY - currentMinY));

        const leftConditionMet = (currentMinX === leftMinX || !foundLeft);
        const rightConditionMet = (currentMaxX === rightMaxX || !foundRight);
        const downConditionMet = (currentMinY === downMinY || !foundDown);
        const upConditionMet = (currentMaxY === upMaxY || !foundUp);

        continueIteration = !(leftConditionMet && rightConditionMet && downConditionMet && upConditionMet);

        adjustBoundaryValues();
    }
    console.log(minArea);
}

processInputData(require("fs").readFileSync("/dev/stdin", "utf8").trim().split(/\n|\s/));
