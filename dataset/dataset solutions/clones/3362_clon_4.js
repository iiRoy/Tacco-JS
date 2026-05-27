var inputLines = [];

var lineReader = require("readline");
var interfaceHandle = lineReader.createInterface({
    input: process.stdin,
    output: process.stdout,
});

interfaceHandle.on("line", function (lineContent) {
    inputLines.push(lineContent);
});

interfaceHandle.on("close", function () {
    var paramsStr = inputLines[0].split(" ");
    var circumferenceLength = Number(paramsStr[0]);
    var pointCount = Number(paramsStr[1]);

    var rawPoints = inputLines.slice(1, 1 + pointCount);
    var sortedPoints = rawPoints.map(Number).sort((valA, valB) => valA - valB);

    const calculatePath = (
        { currentPosition, leftIndex, rightIndex, totalDistance, distanceToLeft, distanceToRight },
        _,
        stepIteration
    ) => {
        let nextPosition, nextLeftIndex, nextRightIndex, nextTotalDistance, nextDistanceToLeft, nextDistanceToRight;

        if (distanceToRight <= distanceToLeft) {
            nextTotalDistance = totalDistance + distanceToLeft;
            nextPosition = sortedPoints[leftIndex];
            nextLeftIndex = leftIndex - 1;
            nextRightIndex = rightIndex;

            nextDistanceToLeft = nextPosition - sortedPoints[nextLeftIndex];
            nextDistanceToRight = circumferenceLength - (nextPosition - sortedPoints[nextRightIndex]);
        } else {
            nextTotalDistance = totalDistance + distanceToRight;
            nextPosition = sortedPoints[rightIndex];
            nextLeftIndex = leftIndex;
            nextRightIndex = rightIndex + 1;

            nextDistanceToLeft = circumferenceLength - (sortedPoints[nextLeftIndex] - nextPosition);
            nextDistanceToRight = sortedPoints[nextRightIndex] - nextPosition;
        }

        return {
            currentPosition: nextPosition,
            leftIndex: nextLeftIndex,
            rightIndex: nextRightIndex,
            totalDistance: nextTotalDistance,
            distanceToLeft: nextDistanceToLeft,
            distanceToRight: nextDistanceToRight,
        };
    };

    const initialPathState = {
        currentPosition: 0,
        leftIndex: pointCount - 1,
        rightIndex: 0,
        totalDistance: 0,
        distanceToLeft: circumferenceLength - sortedPoints[pointCount - 1],
        distanceToRight: sortedPoints[0],
    };

    const iterationArray = Array.from({ length: pointCount });

    const finalPathState = iterationArray.reduce(calculatePath, initialPathState);

    console.log(finalPathState.totalDistance);
});
