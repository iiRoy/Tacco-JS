const processInput = () => {
    const rawData = require("fs").readFileSync("/dev/stdin", "utf-8").trim();
    const allTokens = rawData.split(/\s|\n/).filter(token => token !== '');

    let tokenIndex = 0;
    const retrieveNext = () => allTokens[tokenIndex++];

    const gridHeight = parseInt(retrieveNext());
    const gridWidth = parseInt(retrieveNext());
    const maxJump = parseInt(retrieveNext());

    const startX = parseInt(retrieveNext()) - 1;
    const startY = parseInt(retrieveNext()) - 1;
    const endX = parseInt(retrieveNext()) - 1;
    const endY = parseInt(retrieveNext()) - 1;

    const terrainLayout = [];
    for (let r = 0; r < gridHeight; r++) {
        terrainLayout.push(retrieveNext().split(''));
    }

    return { gridHeight, gridWidth, maxJump, startX, startY, endX, endY, terrainLayout };
};

class PathQueue {
    constructor() {
        this.elements = [];
        this.head = 0;
    }

    insert(item) {
        this.elements.push(item);
    }

    extract() {
        if (this.head < this.elements.length) {
            const item = this.elements[this.head];
            this.head++;
            return item;
        }
        return undefined;
    }

    isEmpty() {
        return this.head >= this.elements.length;
    }
}

const generateCoordinateKey = (x, y) => `${x},${y}`;

const findOptimalPath = () => {
    const { gridHeight, gridWidth, maxJump, startX, startY, endX, endY, terrainLayout } = processInput();

    const currentDistances = new Map();
    const obstacleLocations = new Set();

    for (let r = 0; r < gridHeight; r++) {
        for (let c = 0; c < gridWidth; c++) {
            const coordKey = generateCoordinateKey(r, c);
            if (terrainLayout[r][c] === '@') {
                obstacleLocations.add(coordKey);
            } else {
                currentDistances.set(coordKey, Infinity);
            }
        }
    }

    const explorationQueue = new PathQueue();

    const initialCoordKey = generateCoordinateKey(startX, startY);
    if (obstacleLocations.has(initialCoordKey)) {
        console.log(-1);
        return;
    }
    currentDistances.set(initialCoordKey, 0);
    explorationQueue.insert([startX, startY]);

    const movementVectors = [
        [0, 1],
        [0, -1],
        [1, 0],
        [-1, 0]
    ];

    while (!explorationQueue.isEmpty()) {
        const [ currentR, currentC ] = explorationQueue.extract();
        const currentPathLength = currentDistances.get(generateCoordinateKey(currentR, currentC));

        for (const [rowDelta, colDelta] of movementVectors) {
            for (let step = 1; step <= maxJump; step++) {
                const nextR = currentR + rowDelta * step;
                const nextC = currentC + colDelta * step;
                const nextCoordKey = generateCoordinateKey(nextR, nextC);

                if (nextR < 0 || nextR >= gridHeight || nextC < 0 || nextC >= gridWidth) {
                    break;
                }

                if (obstacleLocations.has(nextCoordKey)) {
                    break;
                }

                if (currentDistances.get(nextCoordKey) > currentPathLength + 1) {
                    currentDistances.set(nextCoordKey, currentPathLength + 1);
                    explorationQueue.insert([nextR, nextC]);
                }
            }
        }
    }

    const finalCoordKey = generateCoordinateKey(endX, endY);
    const result = currentDistances.get(finalCoordKey);

    if (result === Infinity) {
        console.log(-1);
    } else {
        console.log(result);
    }
};

findOptimalPath();