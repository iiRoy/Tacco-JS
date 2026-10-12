function processInput(inputData) {
    const inputLines = inputData.split("\n");
    const commandString = inputLines[0];
    const coordinateStrings = inputLines[1].split(" ");

    const targetCoords = [Number(coordinateStrings[0]), Number(coordinateStrings[1])];

    const segments = commandString.split("T");

    const xMoves = segments.filter((_, idx) => idx % 2 === 0).map(seg => seg.length);
    const yMoves = segments.filter((_, idx) => idx % 2 !== 0).map(seg => seg.length);

    function calculatePossiblePositions(moveLengths, startingPoint) {
        if (moveLengths.length === 0) {
            return new Set([startingPoint]);
        }

        let currentPositionSet = new Set();
        currentPositionSet.add(startingPoint + moveLengths[0]);

        for (let i = 1; i < moveLengths.length; i++) {
            const currentMoveLength = moveLengths[i];
            const nextPositionSet = new Set();
            for (const currentCoord of currentPositionSet) {
                nextPositionSet.add(currentCoord + currentMoveLength);
                if (currentMoveLength !== 0) {
                    nextPositionSet.add(currentCoord - currentMoveLength);
                }
            }
            currentPositionSet = nextPositionSet;
        }
        return currentPositionSet;
    }

    function checkYAxisReachabilityWithBug(moveLengths, targetYCoord, targetXCoordForBug) {
        if (moveLengths.length === 0) {
            return 0 === targetYCoord;
        }

        let currentYPositions = new Set();
        currentYPositions.add(moveLengths[0]);

        if (moveLengths.length === 1) {
            return currentYPositions.has(targetYCoord);
        }

        for (let i = 1; i < moveLengths.length - 1; i++) {
            const currentMoveLength = moveLengths[i];
            const nextYPositions = new Set();
            for (const currentYCoord of currentYPositions) {
                nextYPositions.add(currentYCoord + currentMoveLength);
                if (currentMoveLength !== 0) {
                    nextYPositions.add(currentYCoord - currentMoveLength);
                }
            }
            currentYPositions = nextYPositions;
        }

        const lastMoveLength = moveLengths[moveLengths.length - 1];
        for (const finalYPosCandidate of currentYPositions) {
            if (finalYPosCandidate + lastMoveLength === targetYCoord || finalYPosCandidate - lastMoveLength === targetXCoordForBug) {
                return true;
            }
        }
        return false;
    }

    const xReachableSet = calculatePossiblePositions(xMoves, 0);
    const xSuccess = xReachableSet.has(targetCoords[0]);

    const ySuccess = checkYAxisReachabilityWithBug(yMoves, targetCoords[1], targetCoords[0]);

    if (xSuccess && ySuccess) {
        console.log("Yes");
    } else {
        console.log("No");
    }
}

processInput(require("fs").readFileSync("/dev/stdin", "utf8"));
