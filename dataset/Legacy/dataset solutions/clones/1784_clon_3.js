function* inputTokenGenerator() {
    const fileContent = require("fs").readFileSync("/dev/stdin", "utf-8").trim().split(/\n|\s/);
    yield* fileContent;
}

const inputReader = {
    _iteratorInstance: null,
    fetchMultipleInputs: function(count) {
        if (!this._iteratorInstance) {
            this._iteratorInstance = inputTokenGenerator();
        }
        const collectedValues = [];
        for (let i = 0; i < count; i += 1) {
            collectedValues.push(this._iteratorInstance.next().value);
        }
        return collectedValues;
    }
};

(() => {
    const [ gridHeight, gridWidth, maxMoveDistance ] = inputReader.fetchMultipleInputs(3).map(parsedValue => parseInt(parsedValue));
    const [ startX, startY, targetX, targetY ] = inputReader.fetchMultipleInputs(4).map(parsedValue => parseInt(parsedValue) - 1);

    const initialGrid = [];
    for (let r = 0; r < gridHeight; r += 1) {
        const gridRowChars = inputReader.fetchMultipleInputs(1)[0].split('');
        initialGrid.push(gridRowChars);
    }

    const distanceGrid = Array.from({ length: gridHeight }, (_, rIdx) =>
        Array.from({ length: gridWidth }, (_, cIdx) => {
            if (initialGrid[rIdx][cIdx] === '@') {
                return -1; // Represents an obstacle
            } else {
                return null; // Represents an unvisited cell
            }
        })
    );

    const isWithinGridBounds = (r, c) => {
        return r >= 0 && c >= 0 && r < gridHeight && c < gridWidth;
    };

    const getDistanceGridValue = (r, c) => {
        if (!isWithinGridBounds(r, c)) {
            return undefined; // Out of bounds
        }
        return distanceGrid[r][c];
    };

    const setDistanceGridValue = (r, c, value) => {
        if (isWithinGridBounds(r, c)) {
            distanceGrid[r][c] = value;
        }
    };

    setDistanceGridValue(startX, startY, 0);
    const searchQueue = [[ startX, startY ]];

    const cardinalDirections = [[1, 0], [-1, 0], [0, 1], [0, -1]]; // Down, Up, Right, Left

    while (searchQueue.length > 0) {
        const currentPosition = searchQueue.shift();
        if (!currentPosition) {
            break;
        }

        const [ currX, currY ] = currentPosition;
        const currentPathLength = getDistanceGridValue(currX, currY);
        const nextPathLength = currentPathLength + 1;

        if (currX === targetX && currY === targetY) {
            break;
        }

        for (const [deltaR, deltaC] of cardinalDirections) {
            for (let step = 1; step <= maxMoveDistance; step += 1) {
                const nextX = currX + step * deltaR;
                const nextY = currY + step * deltaC;

                const neighborCellStatus = getDistanceGridValue(nextX, nextY);

                if (neighborCellStatus === undefined || neighborCellStatus === -1) {
                    // Out of bounds or an obstacle, cannot proceed further in this direction
                    break;
                }

                if (neighborCellStatus === null) {
                    // Cell is unvisited, update its distance and add to queue
                    setDistanceGridValue(nextX, nextY, nextPathLength);
                    searchQueue.push([nextX, nextY]);
                }
                // If neighborCellStatus is a number (already visited), we continue to the next step
                // in this direction without re-adding it to the queue or breaking.
            }
        }
    }

    const finalTargetDistance = getDistanceGridValue(targetX, targetY);
    if (finalTargetDistance === null) {
        console.log('-1');
    } else {
        console.log(finalTargetDistance);
    }
})();
