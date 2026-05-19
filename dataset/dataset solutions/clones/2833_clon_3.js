function ProcessInput(rawData) {
    const numEntries = parseInt(rawData.shift());

    const INITIAL_MAX_COORD = Number.MAX_SAFE_INTEGER;
    const INITIAL_MIN_COORD = Number.MIN_SAFE_INTEGER;

    let leftMinX = INITIAL_MAX_COORD;
    let leftMaxX = INITIAL_MIN_COORD;
    let lrMinY = INITIAL_MAX_COORD;
    let lrMaxY = INITIAL_MIN_COORD;

    let rightMinX = INITIAL_MAX_COORD;
    let rightMaxX = INITIAL_MIN_COORD;

    let udMinX = INITIAL_MAX_COORD;
    let udMaxX = INITIAL_MIN_COORD;
    let upMinY = INITIAL_MAX_COORD;
    let upMaxY = INITIAL_MIN_COORD;

    let downMinY = INITIAL_MAX_COORD;
    let downMaxY = INITIAL_MIN_COORD;

    let foundLeft = false;
    let foundRight = false;
    let foundUp = false;
    let foundDown = false;

    const parsePointDetails = (index) => {
        const currentX = parseInt(rawData[index * 3]);
        const currentY = parseInt(rawData[index * 3 + 1]);
        const directionString = rawData[index * 3 + 2];
        return { currentX, currentY, directionString };
    };

    for (let idx = 0; idx < numEntries; idx++) {
        const { currentX, currentY, directionString } = parsePointDetails(idx);

        switch (directionString) {
            case "L":
                leftMinX = Math.min(leftMinX, currentX);
                leftMaxX = Math.max(leftMaxX, currentX);
                lrMinY = Math.min(lrMinY, currentY);
                lrMaxY = Math.max(lrMaxY, currentY);
                foundLeft = true;
                break;
            case "R":
                rightMinX = Math.min(rightMinX, currentX);
                rightMaxX = Math.max(rightMaxX, currentX);
                lrMinY = Math.min(lrMinY, currentY);
                lrMaxY = Math.max(lrMaxY, currentY);
                foundRight = true;
                break;
            case "U":
                udMinX = Math.min(udMinX, currentX);
                udMaxX = Math.max(udMaxX, currentX);
                upMinY = Math.min(upMinY, currentY);
                upMaxY = Math.max(upMaxY, currentY);
                foundUp = true;
                break;
            case "D":
                udMinX = Math.min(udMinX, currentX);
                udMaxX = Math.max(udMaxX, currentX);
                downMinY = Math.min(downMinY, currentY);
                downMaxY = Math.max(downMaxY, currentY);
                foundDown = true;
                break;
            default:
                break;
        }
    }

    let minEnclosingArea = INITIAL_MAX_COORD;
    let continueIteration = true;
    const STEP_INCREMENT = 0.5;

    const getEffectiveMin = (value, hasFlag) => hasFlag ? value : INITIAL_MAX_COORD;
    const getEffectiveMax = (value, hasFlag) => hasFlag ? value : INITIAL_MIN_COORD;

    while (continueIteration) {
        const currentOverallMinX = Math.min(
            getEffectiveMin(rightMinX, foundRight),
            getEffectiveMin(leftMinX, foundLeft),
            getEffectiveMin(udMinX, foundUp || foundDown)
        );
        const currentOverallMaxX = Math.max(
            getEffectiveMax(rightMaxX, foundRight),
            getEffectiveMax(leftMaxX, foundLeft),
            getEffectiveMax(udMaxX, foundUp || foundDown)
        );

        const currentOverallMinY = Math.min(
            getEffectiveMin(lrMinY, foundLeft || foundRight),
            getEffectiveMin(upMinY, foundUp),
            getEffectiveMin(downMinY, foundDown)
        );
        const currentOverallMaxY = Math.max(
            getEffectiveMax(lrMaxY, foundLeft || foundRight),
            getEffectiveMax(upMaxY, foundUp),
            getEffectiveMax(downMaxY, foundDown)
        );

        const currentWidth = currentOverallMaxX - currentOverallMinX;
        const currentHeight = currentOverallMaxY - currentOverallMinY;
        minEnclosingArea = Math.min(minEnclosingArea, currentWidth * currentHeight);

        const isLeftBoundaryStable = (currentOverallMinX === leftMinX || !foundLeft);
        const isRightBoundaryStable = (currentOverallMaxX === rightMaxX || !foundRight);
        const isDownBoundaryStable = (currentOverallMinY === downMinY || !foundDown);
        const isUpBoundaryStable = (currentOverallMaxY === upMaxY || !foundUp);

        continueIteration = !(isLeftBoundaryStable && isRightBoundaryStable && isDownBoundaryStable && isUpBoundaryStable);

        leftMinX -= STEP_INCREMENT;
        leftMaxX -= STEP_INCREMENT;
        rightMinX += STEP_INCREMENT;
        rightMaxX += STEP_INCREMENT;
        upMinY += STEP_INCREMENT;
        upMaxY += STEP_INCREMENT;
        downMinY -= STEP_INCREMENT;
        downMaxY -= STEP_INCREMENT;
    }
    console.log(minEnclosingArea);
}

ProcessInput(require("fs").readFileSync("/dev/stdin", "utf8").trim().split(/\n|\s/));
