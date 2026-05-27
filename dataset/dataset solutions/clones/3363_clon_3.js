function processInput(rawData) {
    "use strict";

    const dataLines = rawData.split("\n");
    const configParams = dataLines[0].split(" ").map(Number);
    const trackLength = configParams[0];
    const numAnts = configParams[1];

    const initialAntPositions = dataLines.slice(1).filter(Boolean).map(Number);

    let totalCosts = [];

    const calculateCircularDistance = (startPoint, endPoint, circleLength, isClockwiseDirection) => {
        if (isClockwiseDirection) {
            return endPoint >= startPoint ? endPoint - startPoint : (circleLength - startPoint) + endPoint;
        } else {
            return endPoint <= startPoint ? startPoint - endPoint : startPoint + (circleLength - endPoint);
        }
    };

    const explorePaths = (currentPosition, remainingAnts, accumulatedCost) => {
        if (remainingAnts.length === 0) {
            totalCosts.push(accumulatedCost);
            return;
        }

        const leftmostAntPosition = remainingAnts[0];
        const rightmostAntPosition = remainingAnts[remainingAnts.length - 1];

        const distanceToLeftmost = calculateCircularDistance(currentPosition, leftmostAntPosition, trackLength, true);
        const distanceToRightmost = calculateCircularDistance(currentPosition, rightmostAntPosition, trackLength, false);

        const remainingAntsAfterLeftPick = Array.from(remainingAnts);
        const chosenLeftAntPosition = remainingAntsAfterLeftPick.shift();
        explorePaths(chosenLeftAntPosition, remainingAntsAfterLeftPick, accumulatedCost + distanceToLeftmost);

        const remainingAntsAfterRightPick = [...remainingAnts];
        const chosenRightAntPosition = remainingAntsAfterRightPick.pop();
        explorePaths(chosenRightAntPosition, remainingAntsAfterRightPick, accumulatedCost + distanceToRightmost);
    };

    explorePaths(0, initialAntPositions, 0);
    console.log(Math.max(...totalCosts));
}

processInput(require("fs").readFileSync("/dev/stdin", "utf8"));
