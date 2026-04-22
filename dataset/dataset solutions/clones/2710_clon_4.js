const createDataParser = (sourceInput) => {
    let lineBuffer = sourceInput.trim().split('\n');
    let tokenBuffer = [];

    const ensureTokensAvailable = () => {
        if (tokenBuffer.length === 0 && lineBuffer.length > 0) {
            tokenBuffer = lineBuffer.shift().split(' ');
        }
    };

    const retrieveNumericValue = (asString = false) => {
        ensureTokensAvailable();
        const extractedValue = tokenBuffer.shift();
        return asString ? extractedValue : Number(extractedValue);
    };

    const retrieveNumericLine = (asStrings = false) => {
        const lineContent = lineBuffer.shift().split(' ');
        return asStrings ? lineContent : lineContent.map(Number);
    };

    return { retrieveNumericValue, retrieveNumericLine };
};

const getManhattanDistance = (pointOne, pointTwo) => Math.abs(pointOne.x - pointTwo.x) + Math.abs(pointOne.y - pointTwo.y);

const advanceCursor = (currentCoordinates, targetCoordinates, stepMagnitude) => {
    let remainingSteps = stepMagnitude;
    let nextXPosition = currentCoordinates.x;
    let nextYPosition = currentCoordinates.y;

    if (targetCoordinates.x < nextXPosition) {
        const xDifference = nextXPosition - targetCoordinates.x;
        if (remainingSteps >= xDifference) {
            remainingSteps -= xDifference;
            nextXPosition = targetCoordinates.x;
        } else {
            nextXPosition -= remainingSteps;
            remainingSteps = 0;
        }
    } else if (targetCoordinates.x > nextXPosition) {
        const xDifference = targetCoordinates.x - nextXPosition;
        if (remainingSteps >= xDifference) {
            remainingSteps -= xDifference;
            nextXPosition = targetCoordinates.x;
        } else {
            nextXPosition += remainingSteps;
            remainingSteps = 0;
        }
    }

    if (remainingSteps > 0) {
        if (targetCoordinates.y < nextYPosition) {
            nextYPosition -= remainingSteps;
        } else {
            nextYPosition += remainingSteps;
        }
    }
    return { x: nextXPosition, y: nextYPosition };
};

const performPathCalculation = (inputContent) => {
    const dataStreamProcessor = createDataParser(inputContent);

    const strideLength = dataStreamProcessor.retrieveNumericValue();
    let destinationX = dataStreamProcessor.retrieveNumericValue();
    let destinationY = dataStreamProcessor.retrieveNumericValue();

    let currentX = 0;
    let currentY = 0;

    if (destinationX === 0 && destinationY === 0) {
        console.log(0);
        return "0";
    }
    if (strideLength % 2 === 0 && (destinationX + destinationY) % 2 !== 0) {
        console.log(-1); // Original code doesn't print length here, just returns -1, then main prints it.
        return "-1";
    }

    const pathSegments = [];
    const doubleStrideLength = strideLength * 2;

    const recursiveMovementPhaseOne = (cx, cy, dx, dy, segments) => {
        const currentPoint = { x: cx, y: cy };
        const destinationPoint = { x: dx, y: dy };
        const currentDistance = getManhattanDistance(currentPoint, destinationPoint);

        if (currentDistance > doubleStrideLength || currentDistance % 2 !== 0) {
            const nextPoint = advanceCursor(currentPoint, destinationPoint, strideLength);
            segments.push(`${nextPoint.x} ${nextPoint.y}`);
            return recursiveMovementPhaseOne(nextPoint.x, nextPoint.y, dx, dy, segments);
        } else {
            return { finalX: cx, finalY: cy, finalDistance: currentDistance };
        }
    };

    const { finalX, finalY, finalDistance } = recursiveMovementPhaseOne(currentX, currentY, destinationX, destinationY, pathSegments);
    currentX = finalX;
    currentY = finalY;

    if (finalDistance % strideLength === 0) {
        const recursiveMovementPhaseTwo = (cx, cy, dx, dy, segments) => {
            if (getManhattanDistance({ x: cx, y: cy }, { x: dx, y: dy }) === 0) {
                return;
            }
            const nextPoint = advanceCursor({ x: cx, y: cy }, { x: dx, y: dy }, strideLength);
            segments.push(`${nextPoint.x} ${nextPoint.y}`);
            recursiveMovementPhaseTwo(nextPoint.x, nextPoint.y, dx, dy, segments);
        };
        recursiveMovementPhaseTwo(currentX, currentY, destinationX, destinationY, pathSegments);
    } else {
        const originalDestinationX = destinationX;
        const originalDestinationY = destinationY;

        const offsetMagnitude = (doubleStrideLength - finalDistance) / 2;

        const deltaX = Math.abs(currentX - destinationX);
        const deltaY = Math.abs(currentY - destinationY);

        if (deltaX >= deltaY) {
            destinationY = (currentY < destinationY) ? (currentY - offsetMagnitude) : (currentY + offsetMagnitude);
            destinationX = (currentX < destinationX) ? (currentX + strideLength - offsetMagnitude) : (currentX - strideLength + offsetMagnitude);
        } else {
            destinationX = (currentX < destinationX) ? (currentX - offsetMagnitude) : (currentX + offsetMagnitude);
            destinationY = (currentY < destinationY) ? (currentY + strideLength - offsetMagnitude) : (currentY - strideLength + offsetMagnitude);
        }

        const firstAdjustedPoint = advanceCursor({ x: currentX, y: currentY }, { x: destinationX, y: destinationY }, strideLength);
        pathSegments.push(`${firstAdjustedPoint.x} ${firstAdjustedPoint.y}`);
        currentX = firstAdjustedPoint.x;
        currentY = firstAdjustedPoint.y;

        destinationX = originalDestinationX;
        destinationY = originalDestinationY;

        const secondAdjustedPoint = advanceCursor({ x: currentX, y: currentY }, { x: destinationX, y: destinationY }, strideLength);
        pathSegments.push(`${secondAdjustedPoint.x} ${secondAdjustedPoint.y}`);
    }

    console.log(pathSegments.length);
    return pathSegments.join("\n");
};

const inputSource = require("fs").readFileSync("/dev/stdin", "utf8");
console.log(performPathCalculation(inputSource));