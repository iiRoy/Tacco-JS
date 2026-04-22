function processCoordinateInfo(sourceData) {
    let computationResult;

    const particleCount = Number.parseInt(sourceData.shift());
    const positionAndDirectionArray = sourceData;

    let leftward_min_x_bound = Number.MAX_SAFE_INTEGER,
        leftward_max_x_bound = Number.MIN_SAFE_INTEGER,
        horizontal_min_y_bound = Number.MAX_SAFE_INTEGER,
        horizontal_max_y_bound = Number.MIN_SAFE_INTEGER,
        rightward_min_x_bound = Number.MAX_SAFE_INTEGER,
        rightward_max_x_bound = Number.MIN_SAFE_INTEGER,
        vertical_min_x_bound = Number.MAX_SAFE_INTEGER,
        vertical_max_x_bound = Number.MIN_SAFE_INTEGER,
        upward_min_y_bound = Number.MAX_SAFE_INTEGER,
        upward_max_y_bound = Number.MIN_SAFE_INTEGER,
        downward_min_y_bound = Number.MAX_SAFE_INTEGER,
        downward_max_y_bound = Number.MIN_SAFE_INTEGER;

    let hasLeftData = false,
        hasRightData = false,
        hasUpwardData = false,
        hasDownwardData = false;

    for (let currentIdx = 0; currentIdx < particleCount; currentIdx++) {
        let coordX = Number.parseInt(positionAndDirectionArray[currentIdx * 3]);
        let coordY = Number.parseInt(positionAndDirectionArray[currentIdx * 3 + 1]);
        let movementDirection = positionAndDirectionArray[currentIdx * 3 + 2];

        switch (movementDirection) {
            case "L":
                leftward_min_x_bound = Math.min(leftward_min_x_bound, coordX);
                leftward_max_x_bound = Math.max(leftward_max_x_bound, coordX);
                horizontal_min_y_bound = Math.min(horizontal_min_y_bound, coordY);
                horizontal_max_y_bound = Math.max(horizontal_max_y_bound, coordY);
                hasLeftData = true;
                break;
            case "R":
                rightward_min_x_bound = Math.min(rightward_min_x_bound, coordX);
                rightward_max_x_bound = Math.max(rightward_max_x_bound, coordX);
                horizontal_min_y_bound = Math.min(horizontal_min_y_bound, coordY);
                horizontal_max_y_bound = Math.max(horizontal_max_y_bound, coordY);
                hasRightData = true;
                break;
            case "U":
                vertical_min_x_bound = Math.min(vertical_min_x_bound, coordX);
                vertical_max_x_bound = Math.max(vertical_max_x_bound, coordX);
                upward_min_y_bound = Math.min(upward_min_y_bound, coordY);
                upward_max_y_bound = Math.max(upward_max_y_bound, coordY);
                hasUpwardData = true;
                break;
            case "D":
                vertical_min_x_bound = Math.min(vertical_min_x_bound, coordX);
                vertical_max_x_bound = Math.max(vertical_max_x_bound, coordX);
                downward_min_y_bound = Math.min(downward_min_y_bound, coordY);
                downward_max_y_bound = Math.max(downward_max_y_bound, coordY);
                hasDownwardData = true;
                break;
            default:
                break;
        }
    }

    let smallestCalculatedArea = Number.MAX_SAFE_INTEGER;
    let continueProcessingLoop = true;

    while (continueProcessingLoop) {
        let overallMinimumX = Math.min(rightward_min_x_bound, leftward_min_x_bound, vertical_min_x_bound);
        let overallMaximumX = Math.max(rightward_max_x_bound, leftward_max_x_bound, vertical_max_x_bound);
        let overallMinimumY = Math.min(horizontal_min_y_bound, upward_min_y_bound, downward_min_y_bound);
        let overallMaximumY = Math.max(horizontal_max_y_bound, upward_max_y_bound, downward_max_y_bound);

        smallestCalculatedArea = Math.min(smallestCalculatedArea, (overallMaximumX - overallMinimumX) * (overallMaximumY - overallMinimumY));

        continueProcessingLoop = !(
            (overallMinimumX === leftward_min_x_bound || !hasLeftData) &&
            (overallMaximumX === rightward_max_x_bound || !hasRightData) &&
            (overallMinimumY === downward_min_y_bound || !hasDownwardData) &&
            (overallMaximumY === upward_max_y_bound || !hasUpwardData)
        );

        leftward_min_x_bound -= 0.5;
        leftward_max_x_bound -= 0.5;
        rightward_min_x_bound += 0.5;
        rightward_max_x_bound += 0.5;
        upward_min_y_bound += 0.5;
        upward_max_y_bound += 0.5;
        downward_min_y_bound -= 0.5;
        downward_max_y_bound -= 0.5;
    }

    console.log(smallestCalculatedArea);
}

processCoordinateInfo(require("fs").readFileSync("/dev/stdin", "utf8").trim().split(/\n|\s/));