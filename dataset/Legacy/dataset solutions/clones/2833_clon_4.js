class InitialBoundsData {
    constructor() {
        this.leftMinX = Number.MAX_SAFE_INTEGER;
        this.leftMaxX = Number.MIN_SAFE_INTEGER;
        this.leftRightMinY = Number.MAX_SAFE_INTEGER;
        this.leftRightMaxY = Number.MIN_SAFE_INTEGER;

        this.rightMinX = Number.MAX_SAFE_INTEGER;
        this.rightMaxX = Number.MIN_SAFE_INTEGER;

        this.upDownMinX = Number.MAX_SAFE_INTEGER;
        this.upDownMaxX = Number.MIN_SAFE_INTEGER;
        this.upMinY = Number.MAX_SAFE_INTEGER;
        this.upMaxY = Number.MIN_SAFE_INTEGER;

        this.downMinY = Number.MAX_SAFE_INTEGER;
        this.downMaxY = Number.MIN_SAFE_INTEGER;

        this.hasLeft = false;
        this.hasRight = false;
        this.hasUp = false;
        this.hasDown = false;
    }
}

function computeEnclosingArea(kSteps, initialData) {
    const currentLeftMinX = initialData.leftMinX - kSteps * 0.5;
    const currentLeftMaxX = initialData.leftMaxX - kSteps * 0.5;
    const currentRightMinX = initialData.rightMinX + kSteps * 0.5;
    const currentRightMaxX = initialData.rightMaxX + kSteps * 0.5;
    const currentUpMinY = initialData.upMinY + kSteps * 0.5;
    const currentUpMaxY = initialData.upMaxY + kSteps * 0.5;
    const currentDownMinY = initialData.downMinY - kSteps * 0.5;
    const currentDownMaxY = initialData.downMaxY - kSteps * 0.5;

    let overallMinX = Number.MAX_SAFE_INTEGER;
    let overallMaxX = Number.MIN_SAFE_INTEGER;
    let overallMinY = Number.MAX_SAFE_INTEGER;
    let overallMaxY = Number.MIN_SAFE_INTEGER;

    if (initialData.hasLeft) {
        overallMinX = Math.min(overallMinX, currentLeftMinX);
        overallMaxX = Math.max(overallMaxX, currentLeftMaxX);
    }
    if (initialData.hasRight) {
        overallMinX = Math.min(overallMinX, currentRightMinX);
        overallMaxX = Math.max(overallMaxX, currentRightMaxX);
    }
    if (initialData.hasUp || initialData.hasDown) {
        overallMinX = Math.min(overallMinX, initialData.upDownMinX);
        overallMaxX = Math.max(overallMaxX, initialData.upDownMaxX);
    }

    if (initialData.hasUp) {
        overallMinY = Math.min(overallMinY, currentUpMinY);
        overallMaxY = Math.max(overallMaxY, currentUpMaxY);
    }
    if (initialData.hasDown) {
        overallMinY = Math.min(overallMinY, currentDownMinY);
        overallMaxY = Math.max(overallMaxY, currentDownMaxY);
    }
    if (initialData.hasLeft || initialData.hasRight) {
        overallMinY = Math.min(overallMinY, initialData.leftRightMinY);
        overallMaxY = Math.max(overallMaxY, initialData.leftRightMaxY);
    }

    if (overallMinX === Number.MAX_SAFE_INTEGER) {
        return 0;
    }

    const currentWidth = Math.max(0, overallMaxX - overallMinX);
    const currentHeight = Math.max(0, overallMaxY - overallMinY);

    return currentWidth * currentHeight;
}

function Main(input) {
    const totalPointsCount = parseInt(input.shift());
    const pointSpecifications = input;

    if (totalPointsCount === 0) {
        console.log(Number.MAX_SAFE_INTEGER);
        return;
    }

    const initialBounds = new InitialBoundsData();

    for (let idx = 0; idx < totalPointsCount; idx++) {
        const xCoordinate = parseInt(pointSpecifications[idx * 3]);
        const yCoordinate = parseInt(pointSpecifications[idx * 3 + 1]);
        const moveDirection = pointSpecifications[idx * 3 + 2];

        switch (moveDirection) {
            case "L":
                initialBounds.leftMinX = Math.min(initialBounds.leftMinX, xCoordinate);
                initialBounds.leftMaxX = Math.max(initialBounds.leftMaxX, xCoordinate);
                initialBounds.leftRightMinY = Math.min(initialBounds.leftRightMinY, yCoordinate);
                initialBounds.leftRightMaxY = Math.max(initialBounds.leftRightMaxY, yCoordinate);
                initialBounds.hasLeft = true;
                break;
            case "R":
                initialBounds.rightMinX = Math.min(initialBounds.rightMinX, xCoordinate);
                initialBounds.rightMaxX = Math.max(initialBounds.rightMaxX, xCoordinate);
                initialBounds.leftRightMinY = Math.min(initialBounds.leftRightMinY, yCoordinate);
                initialBounds.leftRightMaxY = Math.max(initialBounds.leftRightMaxY, yCoordinate);
                initialBounds.hasRight = true;
                break;
            case "U":
                initialBounds.upDownMinX = Math.min(initialBounds.upDownMinX, xCoordinate);
                initialBounds.upDownMaxX = Math.max(initialBounds.upDownMaxX, xCoordinate);
                initialBounds.upMinY = Math.min(initialBounds.upMinY, yCoordinate);
                initialBounds.upMaxY = Math.max(initialBounds.upMaxY, yCoordinate);
                initialBounds.hasUp = true;
                break;
            case "D":
                initialBounds.upDownMinX = Math.min(initialBounds.upDownMinX, xCoordinate);
                initialBounds.upDownMaxX = Math.max(initialBounds.upDownMaxX, xCoordinate);
                initialBounds.downMinY = Math.min(initialBounds.downMinY, yCoordinate);
                initialBounds.downMaxY = Math.max(initialBounds.downMaxY, yCoordinate);
                initialBounds.hasDown = true;
                break;
        }
    }

    let lowerBoundK = 0;
    let upperBoundK = 2 * 1000000000 + 100;

    for (let searchIter = 0; searchIter < 100; searchIter++) {
        const mid1K = Math.floor(lowerBoundK + (upperBoundK - lowerBoundK) / 3);
        const mid2K = Math.ceil(upperBoundK - (upperBoundK - lowerBoundK) / 3);

        const areaAtMid1 = computeEnclosingArea(mid1K, initialBounds);
        const areaAtMid2 = computeEnclosingArea(mid2K, initialBounds);

        if (areaAtMid1 < areaAtMid2) {
            upperBoundK = mid2K - 1;
        } else {
            lowerBoundK = mid1K + 1;
        }
    }

    let minimumOverallArea = Number.MAX_SAFE_INTEGER;
    for (let k = Math.max(0, lowerBoundK - 5); k <= upperBoundK + 5; k++) {
        minimumOverallArea = Math.min(minimumOverallArea, computeEnclosingArea(k, initialBounds));
    }

    console.log(minimumOverallArea);
}

Main(require("fs").readFileSync("/dev/stdin", "utf8").trim().split(/\n|\s/));
