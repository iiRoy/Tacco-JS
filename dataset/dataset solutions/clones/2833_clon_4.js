function analyzeMovingPoints(dataLines) {
    const totalCount = Number.parseInt(dataLines[0]);
    const pointData = dataLines.slice(1);

    if (totalCount === 0) {
        return Number.MAX_SAFE_INTEGER;
    }

    const categorizedExtrema = {
        minXLeft: Number.MAX_SAFE_INTEGER, maxXLeft: Number.MIN_SAFE_INTEGER, hasLeftGroup: false,
        minXRight: Number.MAX_SAFE_INTEGER, maxXRight: Number.MIN_SAFE_INTEGER, hasRightGroup: false,
        minYUp: Number.MAX_SAFE_INTEGER, maxYUp: Number.MIN_SAFE_INTEGER, hasUpGroup: false,
        minYDown: Number.MAX_SAFE_INTEGER, maxYDown: Number.MIN_SAFE_INTEGER, hasDownGroup: false,
        minXUpDown: Number.MAX_SAFE_INTEGER, maxXUpDown: Number.MIN_SAFE_INTEGER, hasUpDownGroup: false,
        minYLeftRight: Number.MAX_SAFE_INTEGER, maxYLeftRight: Number.MIN_SAFE_INTEGER, hasLeftRightGroup: false
    };

    for (let currentIdx = 0; currentIdx < totalCount; ++currentIdx) {
        const coordX = Number.parseInt(pointData[currentIdx * 3]);
        const coordY = Number.parseInt(pointData[currentIdx * 3 + 1]);
        const directionSymbol = pointData[currentIdx * 3 + 2];

        switch (directionSymbol) {
            case "L":
                categorizedExtrema.minXLeft = Math.min(categorizedExtrema.minXLeft, coordX);
                categorizedExtrema.maxXLeft = Math.max(categorizedExtrema.maxXLeft, coordX);
                categorizedExtrema.minYLeftRight = Math.min(categorizedExtrema.minYLeftRight, coordY);
                categorizedExtrema.maxYLeftRight = Math.max(categorizedExtrema.maxYLeftRight, coordY);
                categorizedExtrema.hasLeftGroup = true;
                categorizedExtrema.hasLeftRightGroup = true;
                break;
            case "R":
                categorizedExtrema.minXRight = Math.min(categorizedExtrema.minXRight, coordX);
                categorizedExtrema.maxXRight = Math.max(categorizedExtrema.maxXRight, coordX);
                categorizedExtrema.minYLeftRight = Math.min(categorizedExtrema.minYLeftRight, coordY);
                categorizedExtrema.maxYLeftRight = Math.max(categorizedExtrema.maxYLeftRight, coordY);
                categorizedExtrema.hasRightGroup = true;
                categorizedExtrema.hasLeftRightGroup = true;
                break;
            case "U":
                categorizedExtrema.minXUpDown = Math.min(categorizedExtrema.minXUpDown, coordX);
                categorizedExtrema.maxXUpDown = Math.max(categorizedExtrema.maxXUpDown, coordX);
                categorizedExtrema.minYUp = Math.min(categorizedExtrema.minYUp, coordY);
                categorizedExtrema.maxYUp = Math.max(categorizedExtrema.maxYUp, coordY);
                categorizedExtrema.hasUpGroup = true;
                categorizedExtrema.hasUpDownGroup = true;
                break;
            case "D":
                categorizedExtrema.minXUpDown = Math.min(categorizedExtrema.minXUpDown, coordX);
                categorizedExtrema.maxXUpDown = Math.max(categorizedExtrema.maxXUpDown, coordX);
                categorizedExtrema.minYDown = Math.min(categorizedExtrema.minYDown, coordY);
                categorizedExtrema.maxYDown = Math.max(categorizedExtrema.maxYDown, coordY);
                categorizedExtrema.hasDownGroup = true;
                categorizedExtrema.hasUpDownGroup = true;
                break;
        }
    }

    const calculateCurrentArea = (timeOffset, currentExtrema) => {
        const xMinBoundary = Math.min(
            currentExtrema.hasLeftGroup ? currentExtrema.minXLeft - timeOffset : Number.MAX_SAFE_INTEGER,
            currentExtrema.hasRightGroup ? currentExtrema.minXRight + timeOffset : Number.MAX_SAFE_INTEGER,
            currentExtrema.hasUpDownGroup ? currentExtrema.minXUpDown : Number.MAX_SAFE_INTEGER
        );
        const xMaxBoundary = Math.max(
            currentExtrema.hasLeftGroup ? currentExtrema.maxXLeft - timeOffset : Number.MIN_SAFE_INTEGER,
            currentExtrema.hasRightGroup ? currentExtrema.maxXRight + timeOffset : Number.MIN_SAFE_INTEGER,
            currentExtrema.hasUpDownGroup ? currentExtrema.maxXUpDown : Number.MIN_SAFE_INTEGER
        );
        const yMinBoundary = Math.min(
            currentExtrema.hasLeftRightGroup ? currentExtrema.minYLeftRight : Number.MAX_SAFE_INTEGER,
            currentExtrema.hasUpGroup ? currentExtrema.minYUp + timeOffset : Number.MAX_SAFE_INTEGER,
            currentExtrema.hasDownGroup ? currentExtrema.minYDown - timeOffset : Number.MAX_SAFE_INTEGER
        );
        const yMaxBoundary = Math.max(
            currentExtrema.hasLeftRightGroup ? currentExtrema.maxYLeftRight : Number.MIN_SAFE_INTEGER,
            currentExtrema.hasUpGroup ? currentExtrema.maxYUp + timeOffset : Number.MIN_SAFE_INTEGER,
            currentExtrema.hasDownGroup ? currentExtrema.maxYDown - timeOffset : Number.MIN_SAFE_INTEGER
        );

        const widthExtent = Math.max(0, xMaxBoundary - xMinBoundary);
        const heightExtent = Math.max(0, yMaxBoundary - yMinBoundary);
        return widthExtent * heightExtent;
    };

    const timeValuesToExamine = new Set();
    timeValuesToExamine.add(0);

    const addTimeCandidate = (t) => {
        if (!Number.isNaN(t) && t >= 0) {
            timeValuesToExamine.add(t);
        }
    };

    // Calculate critical time points for X boundaries
    if (categorizedExtrema.hasLeftGroup && categorizedExtrema.hasRightGroup) {
        addTimeCandidate((categorizedExtrema.minXLeft - categorizedExtrema.minXRight) / 2);
        addTimeCandidate((categorizedExtrema.maxXLeft - categorizedExtrema.maxXRight) / 2);
    }
    if (categorizedExtrema.hasLeftGroup && categorizedExtrema.hasUpDownGroup) {
        addTimeCandidate(categorizedExtrema.minXLeft - categorizedExtrema.minXUpDown);
        addTimeCandidate(categorizedExtrema.maxXLeft - categorizedExtrema.maxXUpDown);
    }
    if (categorizedExtrema.hasRightGroup && categorizedExtrema.hasUpDownGroup) {
        addTimeCandidate(categorizedExtrema.minXUpDown - categorizedExtrema.minXRight);
        addTimeCandidate(categorizedExtrema.maxXUpDown - categorizedExtrema.maxXRight);
    }

    // Calculate critical time points for Y boundaries
    if (categorizedExtrema.hasUpGroup && categorizedExtrema.hasDownGroup) {
        addTimeCandidate((categorizedExtrema.minYDown - categorizedExtrema.minYUp) / 2);
        addTimeCandidate((categorizedExtrema.maxYDown - categorizedExtrema.maxYUp) / 2);
    }
    if (categorizedExtrema.hasUpGroup && categorizedExtrema.hasLeftRightGroup) {
        addTimeCandidate(categorizedExtrema.minYLeftRight - categorizedExtrema.minYUp);
        addTimeCandidate(categorizedExtrema.maxYLeftRight - categorizedExtrema.maxYUp);
    }
    if (categorizedExtrema.hasDownGroup && categorizedExtrema.hasLeftRightGroup) {
        addTimeCandidate(categorizedExtrema.minYDown - categorizedExtrema.minYLeftRight);
        addTimeCandidate(categorizedExtrema.maxYDown - categorizedExtrema.maxYLeftRight);
    }

    let overallMinimumArea = Number.MAX_SAFE_INTEGER;

    const sortedTimePoints = Array.from(timeValuesToExamine).sort((a, b) => a - b);

    for (const timeMoment of sortedTimePoints) {
        overallMinimumArea = Math.min(overallMinimumArea, calculateCurrentArea(timeMoment, categorizedExtrema));
    }

    return overallMinimumArea;
}

const entryPoint = (rawInput) => {
    const processedResult = analyzeMovingPoints(rawInput);
    console.log(processedResult);
};

entryPoint(require("fs").readFileSync("/dev/stdin", "utf8").trim().split(/\n|\s/));