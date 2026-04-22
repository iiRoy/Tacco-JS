'use strict';

class PathTraversalQueue {
    constructor() {
        this.container = [];
        this.indexHead = 0;
    }

    insert(element) {
        this.container.push(element);
    }

    extract() {
        if (this.isEmpty()) {
            return undefined;
        }
        const element = this.container[this.indexHead];
        this.indexHead++;
        if (this.indexHead > 2048 && this.indexHead >= this.container.length / 2) {
            this.container = this.container.slice(this.indexHead);
            this.indexHead = 0;
        }
        return element;
    }

    isEmpty() {
        return this.indexHead >= this.container.length;
    }
}

const analyzeMazeJourney = (inputManifest) => {
    const dataLines = inputManifest.split('\n').filter(Boolean);

    const boundarySpecs = dataLines[0].split(' ').map(Number);
    const heightDimension = boundarySpecs[0];
    const widthDimension = boundarySpecs[1];

    const initialLocation = { y: 0, x: 0 };
    const finalLocation = { y: heightDimension - 1, x: widthDimension - 1 };

    const terrainLayout = new Map();
    for (let yCoord = 0; yCoord < heightDimension; yCoord++) {
        const rowSymbols = dataLines[yCoord + 1].split('');
        for (let xCoord = 0; xCoord < widthDimension; xCoord++) {
            terrainLayout.set(`${yCoord}_${xCoord}`, rowSymbols[xCoord]);
        }
    }

    const determineShortestPath = (h, w, startY, startX, endY, endX, layoutData) => {
        const currentDistances = new Map();
        const directionalShifts = [
            { dy: 0, dx: 1 }, { dy: 1, dx: 0 }, { dy: 0, dx: -1 }, { dy: -1, dx: 0 }
        ];
        const processingQueue = new PathTraversalQueue();

        const startKey = `${startY}_${startX}`;
        processingQueue.insert({ y: startY, x: startX, length: 1 });
        currentDistances.set(startKey, 1);

        while (!processingQueue.isEmpty()) {
            const currentPoint = processingQueue.extract();
            const { y: currentY, x: currentX, length: currentLength } = currentPoint;

            if (currentY === endY && currentX === endX) {
                return currentLength;
            }

            for (const shift of directionalShifts) {
                const nextY = currentY + shift.dy;
                const nextX = currentX + shift.dx;
                const nextPointKey = `${nextY}_${nextX}`;

                if (nextY < 0 || nextY >= h || nextX < 0 || nextX >= w) continue;
                if (layoutData.get(nextPointKey) === '#') continue;
                if (currentDistances.has(nextPointKey)) continue;

                currentDistances.set(nextPointKey, currentLength + 1);
                processingQueue.insert({ y: nextY, x: nextX, length: currentLength + 1 });
            }
        }

        return -1;
    };

    const tallyClearSpaces = (h, w, layoutData) => {
        let clearCount = 0;
        for (let y = 0; y < h; y++) {
            for (let x = 0; x < w; x++) {
                if (layoutData.get(`${y}_${x}`) === '.') {
                    clearCount++;
                }
            }
        }
        return clearCount;
    };

    const shortestRouteValue = determineShortestPath(
        heightDimension, widthDimension,
        initialLocation.y, initialLocation.x,
        finalLocation.y, finalLocation.x,
        terrainLayout
    );

    let finalOutput = 0;
    if (shortestRouteValue === -1) {
        finalOutput = -1;
    } else {
        const totalClear = tallyClearSpaces(heightDimension, widthDimension, terrainLayout);
        finalOutput = totalClear - shortestRouteValue;
    }

    console.log(finalOutput);
};

analyzeMazeJourney(require("node:fs").readFileSync("/dev/stdin", "utf8"));