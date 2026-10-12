function* inputSourceGen() {
    const rawInput = require("fs").readFileSync("/dev/stdin", "utf-8").trim().split(/\n|\s/);
    yield* rawInput;
}

function acquireTokens(count, sourceIterator) {
    const iterator = sourceIterator || (this.iterator = inputSourceGen());
    const tokens = [];
    for (let i = 0; i < count; i += 1) {
        tokens.push(iterator.next().value);
    }
    return tokens;
}

(() => {
    const [ gridHeight, gridWidth, maxJumpDistance ] = acquireTokens(3).map(Number);
    const [ startRow, startCol, targetRow, targetCol ] = acquireTokens(4).map(val => Number(val) - 1);

    const terrainLayout = [];
    for (let r = 0; r < gridHeight; r += 1) {
        const lineData = acquireTokens(1)[0];
        terrainLayout.push(Array.from(lineData));
    }

    const pathDistances = new Map();
    const explorationQueue = [];

    pathDistances.set(`${startRow},${startCol}`, 0);
    explorationQueue.push([startRow, startCol]);

    const cardinalDirections = [[1, 0], [-1, 0], [0, 1], [0, -1]];

    let finalDistance = -1;

    while (explorationQueue.length > 0) {
        const [currentRow, currentCol] = explorationQueue.shift();
        const currentPathLength = pathDistances.get(`${currentRow},${currentCol}`);

        if (currentRow === targetRow && currentCol === targetCol) {
            finalDistance = currentPathLength;
            break;
        }

        for (const [deltaR, deltaC] of cardinalDirections) {
            for (let step = 1; step <= maxJumpDistance; step += 1) {
                const nextRow = currentRow + deltaR * step;
                const nextCol = currentCol + deltaC * step;
                const nextCoordKey = `${nextRow},${nextCol}`;

                if (nextRow < 0 || nextRow >= gridHeight || nextCol < 0 || nextCol >= gridWidth) {
                    break;
                }

                if (terrainLayout[nextRow][nextCol] === '@') {
                    break;
                }

                if (pathDistances.has(nextCoordKey)) {
                    continue;
                }

                pathDistances.set(nextCoordKey, currentPathLength + 1);
                explorationQueue.push([nextRow, nextCol]);
            }
        }
    }

    console.log(finalDistance);
})();
