function processCoordinates(rawData) {
    const inputLines = rawData.split("\n");
    const pathString = inputLines[0];
    const targetCoordsStr = inputLines[1].split(" ");

    const segments = pathString.split("T");

    const finalTarget = [Number(targetCoordsStr[0]), Number(targetCoordsStr[1])];

    const xMoves = [];
    const yMoves = [];

    for (let idx = 0; idx < segments.length; idx++) {
        if (idx % 2 === 0) {
            xMoves.push(segments[idx].length);
        } else {
            yMoves.push(segments[idx].length);
        }
    }

    const checkXReachability = (movementSteps, targetXCoord) => {
        if (movementSteps.length === 0 || movementSteps.length === 1) {
            return false;
        }

        let currentPossiblePositions = new Set([movementSteps[0]]);

        for (let stepIdx = 1; stepIdx < movementSteps.length - 1; stepIdx++) {
            const currentMoveAmount = movementSteps[stepIdx];
            const nextPossiblePositions = new Set();
            for (const currentPos of currentPossiblePositions) {
                nextPossiblePositions.add(currentPos + currentMoveAmount);
                if (currentMoveAmount !== 0) {
                    nextPossiblePositions.add(currentPos - currentMoveAmount);
                }
            }
            currentPossiblePositions = nextPossiblePositions;
        }

        const lastMoveAmount = movementSteps[movementSteps.length - 1];
        for (const currentPos of currentPossiblePositions) {
            if (currentPos + lastMoveAmount === targetXCoord || currentPos - lastMoveAmount === targetXCoord) {
                return true;
            }
        }
        return false;
    };

    const checkYReachability = (movementSteps, targetYCoord, targetXForBug) => {
        if (movementSteps.length === 0 || movementSteps.length === 1) {
            return false;
        }

        let currentPossiblePositions = new Set([movementSteps[0]]);

        for (let stepIdx = 1; stepIdx < movementSteps.length - 1; stepIdx++) {
            const currentMoveAmount = movementSteps[stepIdx];
            const nextPossiblePositions = new Set();
            for (const currentPos of currentPossiblePositions) {
                nextPossiblePositions.add(currentPos + currentMoveAmount);
                if (currentMoveAmount !== 0) {
                    nextPossiblePositions.add(currentPos - currentMoveAmount);
                }
            }
            currentPossiblePositions = nextPossiblePositions;
        }

        const lastMoveAmount = movementSteps[movementSteps.length - 1];
        for (const currentPos of currentPossiblePositions) {
            if (currentPos + lastMoveAmount === targetYCoord || currentPos - lastMoveAmount === targetXForBug) {
                return true;
            }
        }
        return false;
    };

    const xAchieved = checkXReachability(xMoves, finalTarget[0]);
    const yAchieved = checkYReachability(yMoves, finalTarget[1], finalTarget[0]);

    if (xAchieved && yAchieved) {
        console.log("Yes");
    } else {
        console.log("No");
    }
}

processCoordinates(require("fs").readFileSync("/dev/stdin", "utf8"));
