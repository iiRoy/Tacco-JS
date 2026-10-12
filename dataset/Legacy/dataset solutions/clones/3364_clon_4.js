const inputBuffer = [];
const ioInterface = require("readline").createInterface({
    input: process.stdin,
    output: process.stdout,
});

ioInterface.on("line", (currentInputLine) => {
    inputBuffer.push(currentInputLine);
});

ioInterface.on("close", () => {
    const firstLineParts = inputBuffer.shift().split(" ");
    const totalBoundaryLength = Number(firstLineParts[0]);
    const numberOfPoints = Number(firstLineParts[1]);

    const pointCoordinates = inputBuffer.slice(0, numberOfPoints).map(Number);

    const calculateOptimalPath = (allPoints, boundaryLength, startWithLeftPreference) => {
        const sortedCoordinates = [...allPoints].sort((c1, c2) => c1 - c2);
        const coordinateCount = sortedCoordinates.length;

        const initialPathState = {
            accumulatedLength: 0,
            leftmostIndex: coordinateCount - 1,
            rightmostIndex: 0,
            lengthIfLastToLeft: boundaryLength - sortedCoordinates[coordinateCount - 1],
            lengthIfLastToRight: sortedCoordinates[0],
            isFirstStep: true,
            initialDirectionIsLeft: startWithLeftPreference
        };

        const finalPathState = Array.from({ length: coordinateCount }).reduce((currentIterationState, _, stepNum) => {
            let { accumulatedLength, leftmostIndex, rightmostIndex, lengthIfLastToLeft, lengthIfLastToRight, isFirstStep, initialDirectionIsLeft } = currentIterationState;

            let decisionToMoveLeft;
            if (isFirstStep) {
                decisionToMoveLeft = initialDirectionIsLeft;
                isFirstStep = false;
            } else {
                decisionToMoveLeft = lengthIfLastToRight <= lengthIfLastToLeft;
            }

            if (decisionToMoveLeft) {
                accumulatedLength += lengthIfLastToLeft;
                lengthIfLastToRight += lengthIfLastToLeft;
                lengthIfLastToLeft = (leftmostIndex > 0) ? (sortedCoordinates[leftmostIndex] - sortedCoordinates[leftmostIndex - 1]) : 0;
                leftmostIndex--;
            } else {
                accumulatedLength += lengthIfLastToRight;
                lengthIfLastToLeft += lengthIfLastToRight;
                lengthIfLastToRight = (rightmostIndex < coordinateCount - 1) ? (sortedCoordinates[rightmostIndex + 1] - sortedCoordinates[rightmostIndex]) : 0;
                rightmostIndex++;
            }

            return {
                accumulatedLength,
                leftmostIndex,
                rightmostIndex,
                lengthIfLastToLeft,
                lengthIfLastToRight,
                isFirstStep,
                initialDirectionIsLeft
            };
        }, initialPathState);

        return finalPathState.accumulatedLength;
    };

    const pathResultFromLeftStart = calculateOptimalPath(pointCoordinates, totalBoundaryLength, true);
    const pathResultFromRightStart = calculateOptimalPath(pointCoordinates, totalBoundaryLength, false);

    console.log(Math.max(pathResultFromLeftStart, pathResultFromRightStart));
});
