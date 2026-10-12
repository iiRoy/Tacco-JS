function ProcessInput(inputData) {
    let finalOutcome;
    const numEntries = parseInt(inputData.shift());
    const coordinateRecords = inputData;

    let leftMinXCoord = Number.MAX_SAFE_INTEGER;
    let leftMaxXCoord = Number.MIN_SAFE_INTEGER;
    let leftRightMinYCoord = Number.MAX_SAFE_INTEGER;
    let leftRightMaxYCoord = Number.MIN_SAFE_INTEGER;
    let rightMinXCoord = Number.MAX_SAFE_INTEGER;
    let rightMaxXCoord = Number.MIN_SAFE_INTEGER;
    let upDownMinXCoord = Number.MAX_SAFE_INTEGER;
    let upDownMaxXCoord = Number.MIN_SAFE_INTEGER;
    let upMinYCoord = Number.MAX_SAFE_INTEGER;
    let upMaxYCoord = Number.MIN_SAFE_INTEGER;
    let downMinYCoord = Number.MAX_SAFE_INTEGER;
    let downMaxYCoord = Number.MIN_SAFE_INTEGER;

    let foundLeft = false;
    let foundRight = false;
    let foundUp = false;
    let foundDown = false;

    for (let entryIndex = 0; entryIndex < numEntries; entryIndex++) {
        const currentX = parseInt(coordinateRecords[entryIndex * 3]);
        const currentY = parseInt(coordinateRecords[entryIndex * 3 + 1]);
        const directionString = coordinateRecords[entryIndex * 3 + 2];

        switch (directionString) {
            case "L":
                leftMinXCoord = Math.min(leftMinXCoord, currentX);
                leftMaxXCoord = Math.max(leftMaxXCoord, currentX);
                leftRightMinYCoord = Math.min(leftRightMinYCoord, currentY);
                leftRightMaxYCoord = Math.max(leftRightMaxYCoord, currentY);
                foundLeft = true;
                break;
            case "R":
                rightMinXCoord = Math.min(rightMinXCoord, currentX);
                rightMaxXCoord = Math.max(rightMaxXCoord, currentX);
                leftRightMinYCoord = Math.min(leftRightMinYCoord, currentY);
                leftRightMaxYCoord = Math.max(leftRightMaxYCoord, currentY);
                foundRight = true;
                break;
            case "U":
                upDownMinXCoord = Math.min(upDownMinXCoord, currentX);
                upDownMaxXCoord = Math.max(upDownMaxXCoord, currentX);
                upMinYCoord = Math.min(upMinYCoord, currentY);
                upMaxYCoord = Math.max(upMaxYCoord, currentY);
                foundUp = true;
                break;
            case "D":
                upDownMinXCoord = Math.min(upDownMinXCoord, currentX);
                upDownMaxXCoord = Math.max(upDownMaxXCoord, currentX);
                downMinYCoord = Math.min(downMinYCoord, currentY);
                downMaxYCoord = Math.max(downMaxYCoord, currentY);
                foundDown = true;
                break;
            default:
                break;
        }
    }

    let minimumArea = Number.MAX_SAFE_INTEGER;
    let continueLooping = true;
    while (continueLooping) {
        const overallMinX = Math.min(rightMinXCoord, leftMinXCoord, upDownMinXCoord);
        const overallMaxX = Math.max(rightMaxXCoord, leftMaxXCoord, upDownMaxXCoord);
        const overallMinY = Math.min(leftRightMinYCoord, upMinYCoord, downMinYCoord);
        const overallMaxY = Math.max(leftRightMaxYCoord, upMaxYCoord, downMaxYCoord);

        minimumArea = Math.min(minimumArea, (overallMaxX - overallMinX) * (overallMaxY - overallMinY));

        continueLooping = !(
            (overallMinX === leftMinXCoord || !foundLeft) &&
            (overallMaxX === rightMaxXCoord || !foundRight) &&
            (overallMinY === downMinYCoord || !foundDown) &&
            (overallMaxY === upMaxYCoord || !foundUp)
        );

        leftMinXCoord -= 0.5;
        leftMaxXCoord -= 0.5;
        rightMinXCoord += 0.5;
        rightMaxXCoord += 0.5;
        upMinYCoord += 0.5;
        upMaxYCoord += 0.5;
        downMinYCoord -= 0.5;
        downMaxYCoord -= 0.5;
    }
    console.log(minimumArea);
}

ProcessInput(require("fs").readFileSync("/dev/stdin", "utf8").trim().split(/\n|\s/));
