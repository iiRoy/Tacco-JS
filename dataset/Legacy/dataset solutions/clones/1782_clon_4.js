function* inputSourceGenerator() {
    const rawInput = require("fs").readFileSync("/dev/stdin", "utf-8").trim().split(/\n|\s/);
    yield* rawInput;
}

function fetchMultipleValues(count, iteratorInstance) {
    const currentIterator = iteratorInstance || this.inputIterator || (this.inputIterator = inputSourceGenerator());
    const collectedValues = [];
    for (let i = 0; i < count; i += 1) {
        collectedValues.push(currentIterator.next().value);
    }
    return collectedValues;
}

(() => {
    const [rowsCount, colsCount, maxReach] = fetchMultipleValues(3).map(val => parseInt(val));
    const [startRowIdx, startColIdx, targetRowIdx, targetColIdx] = fetchMultipleValues(4).map(val => parseInt(val) - 1);

    const initialLayout = [];
    for (let r = 0; r < rowsCount; r += 1) {
        const rowString = fetchMultipleValues(1)[0].split('');
        initialLayout.push([...rowString]);
    }

    const pathDistances = Array.from({ length: rowsCount }, () => Array(colsCount).fill(Infinity));

    for (let r = 0; r < rowsCount; r += 1) {
        for (let c = 0; c < colsCount; c += 1) {
            if (initialLayout[r][c] === '@') {
                pathDistances[r][c] = -1; // Obstacle
            }
        }
    }

    pathDistances[startRowIdx][startColIdx] = 0;
    let currentLevelCells = new Set();
    currentLevelCells.add(`${startRowIdx},${startColIdx}`);

    const debugGridDisplay = () => {
        return; // No-op, as in original
    };

    const directionVectors = [[1, 0], [-1, 0], [0, 1], [0, -1]]; // Down, Up, Right, Left

    while (currentLevelCells.size > 0) {
        let nextLevelCells = new Set();

        for (const cellKey of currentLevelCells) {
            const [r, c] = cellKey.split(',').map(Number);
            const currentDistance = pathDistances[r][c];

            for (const [dr, dc] of directionVectors) {
                for (let stepIncrement = 1; stepIncrement <= maxReach; stepIncrement++) {
                    const nextR = r + dr * stepIncrement;
                    const nextC = c + dc * stepIncrement;

                    if (nextR < 0 || nextR >= rowsCount || nextC < 0 || nextC >= colsCount) {
                        break; // Out of bounds, stop this direction
                    }

                    if (pathDistances[nextR][nextC] === -1) {
                        break; // Obstacle, stop this direction
                    }

                    if (pathDistances[nextR][nextC] === Infinity) { // If unvisited
                        pathDistances[nextR][nextC] = currentDistance + 1;
                        nextLevelCells.add(`${nextR},${nextC}`);
                    }
                    debugGridDisplay(); // No-op
                }
            }
        }
        currentLevelCells = nextLevelCells;
    }

    const finalDistance = pathDistances[targetRowIdx][targetColIdx];

    if (finalDistance === Infinity) {
        console.log('-1');
    } else {
        console.log(finalDistance);
    }
})();
