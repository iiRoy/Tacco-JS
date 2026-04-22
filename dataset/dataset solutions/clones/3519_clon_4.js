const obtainInput = (sourcePath) => {
    const content = require("fs").readFileSync(sourcePath, "utf8");
    const segments = content.trim().split('\n');
    let position = 0;

    const acquireNumeric = () => {
        const segment = segments[position];
        const pieces = segment.split(' ');
        position++;
        return Number(pieces[0]);
    };

    const acquireCollection = (quantity) => {
        const outcome = [];
        for (let k = 0; k < quantity; k++) {
            const segment = segments[position];
            const pieces = segment.split(' ').map(Number);
            outcome.push(pieces);
            position++;
        }
        return outcome;
    };

    return {
        getNumeric: acquireNumeric,
        getCollection: acquireCollection,
    };
};

const resolveChallenge = () => {
    const dataFeeder = obtainInput("/dev/stdin");

    const entityCount = dataFeeder.getNumeric();
    const entityCoordinates = dataFeeder.getCollection(entityCount);

    const initialParityState = (entityCoordinates[0][0] + entityCoordinates[0][1]) % 2;

    for (let pointIdx = 1; pointIdx < entityCount; pointIdx++) {
        const currentParityState = (entityCoordinates[pointIdx][0] + entityCoordinates[pointIdx][1]) % 2;
        if (currentParityState !== initialParityState) {
            return -1;
        }
    }

    const totalMoveSteps = 20 - initialParityState;
    const individualStepDistances = Array(totalMoveSteps).fill(1);

    const generateMovementTrace = (currentX, currentY, stepsRemaining) => {
        if (stepsRemaining === 0) {
            return "";
        }

        let nextX = currentX;
        let nextY = currentY;
        let moveDirection;

        if (currentX > 0) {
            nextX--;
            moveDirection = 'R';
        } else if (currentX < 0) {
            nextX++;
            moveDirection = 'L';
        } else if (currentY > 0) {
            nextY--;
            moveDirection = 'U';
        } else { // currentY <= 0
            nextY++;
            moveDirection = 'D';
        }
        return moveDirection + generateMovementTrace(nextX, nextY, stepsRemaining - 1);
    };

    const allMovementTraces = entityCoordinates.map(pair =>
        generateMovementTrace(pair[0], pair[1], totalMoveSteps)
    );

    return totalMoveSteps + "\n" + individualStepDistances.join(" ") + "\n" + allMovementTraces.join("\n");
};

console.log(resolveChallenge());