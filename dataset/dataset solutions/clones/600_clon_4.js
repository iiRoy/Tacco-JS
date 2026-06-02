class PathQueue {
    constructor() {
        this.elements = [];
        this.headIndex = 0;
    }

    enqueue(element) {
        this.elements.push(element);
    }

    dequeue() {
        if (this.headIndex < this.elements.length) {
            const item = this.elements[this.headIndex];
            this.headIndex++;
            if (this.headIndex > 2000 && this.headIndex > this.elements.length / 2) {
                this.elements = this.elements.slice(this.headIndex);
                this.headIndex = 0;
            }
            return item;
        }
        return undefined;
    }

    isEmpty() {
        return this.headIndex >= this.elements.length;
    }

    size() {
        return this.elements.length - this.headIndex;
    }
}

function findPathToGoal(initialX, initialY) {
    let currentGridState = initialGridState.map(row => row);
    currentGridState[initialY] = currentGridState[initialY].substring(0, initialX) + '.' + currentGridState[initialY].substring(initialX + 1);

    const pathQueue = new PathQueue();
    const visitedStates = new Map();

    const movementVectors = [
        { dx: 0, dy: -1 },
        { dx: -1, dy: 0 },
        { dx: 1, dy: 0 },
        { dx: 0, dy: 1 }
    ];

    const generateMapKey = (mapArray) => mapArray.map(rowStr => rowStr.split('').join(',')).join(',');
    
    const initialNode = {
        x: initialX,
        y: initialY,
        cost: 0,
        requiredLevel: 1,
        currentMap: currentGridState
    };

    let initialStateKey = initialX + ' ' + initialY + ' ' + generateMapKey(currentGridState);
    visitedStates.set(initialStateKey, true);
    pathQueue.enqueue(initialNode);

    while (!pathQueue.isEmpty()) {
        const currentNode = pathQueue.dequeue();
        const { x, y, cost, requiredLevel, currentMap } = currentNode;

        if (requiredLevel === targetLevelCount + 1) {
            return cost;
        }

        for (const direction of movementVectors) {
            const nextX = x + direction.dx;
            const nextY = y + direction.dy;
            let nextRequiredLevel = requiredLevel;

            if (nextX < 0 || nextY < 0 || nextX >= gridDimensionsAndPower[1] || nextY >= gridDimensionsAndPower[0]) {
                continue;
            }
            if (currentMap[nextY][nextX] === 'X') {
                continue;
            }

            let nextMapState = [...currentMap];

            const cellValue = nextMapState[nextY][nextX];
            if (cellValue === String(nextRequiredLevel)) {
                nextRequiredLevel++;
                nextMapState[nextY] = nextMapState[nextY].substring(0, nextX) + '.' + nextMapState[nextY].substring(nextX + 1);
            }

            let nextStateKey = nextX + ' ' + nextY + ' ' + generateMapKey(nextMapState);

            if (visitedStates.has(nextStateKey)) {
                continue;
            }

            visitedStates.set(nextStateKey, true);
            pathQueue.enqueue({
                x: nextX,
                y: nextY,
                cost: cost + 1,
                requiredLevel: nextRequiredLevel,
                currentMap: nextMapState
            });
        }
    }

    return -1;
}

const rawInputData = require('fs').readFileSync('/dev/stdin', 'utf8');
const inputLines = rawInputData.trim().split("\n");

const gridDimensionsAndPower = (inputLines.shift()).split(" ").map(Number);
const targetLevelCount = gridDimensionsAndPower[2];

let initialGridState = [];
let startCoordinates = [];

for (let i = 0; i < gridDimensionsAndPower[0]; i++) {
    const rowChars = (inputLines.shift()).split("");
    if (rowChars.indexOf("S") !== -1) {
        startCoordinates = [rowChars.indexOf("S"), i];
    }
    initialGridState.push(rowChars.join(''));
}

const finalResult = findPathToGoal(startCoordinates[0], startCoordinates[1]);
console.log(finalResult);
