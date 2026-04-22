'use strict';

let componentRoots;
let componentSizes;

function setupComponents(countOfElements) {
    componentRoots = Array.from({ length: countOfElements }, (_, i) => i);
    componentSizes = Array.from({ length: countOfElements }, () => 1);
}

function findComponentRoot(elementIndex) {
    if (componentRoots[elementIndex] === elementIndex) {
        return elementIndex;
    }
    return componentRoots[elementIndex] = findComponentRoot(componentRoots[elementIndex]);
}

function mergeComponents(indexA, indexB) {
    let rootA = findComponentRoot(indexA);
    let rootB = findComponentRoot(indexB);

    if (rootA !== rootB) {
        if (componentSizes[rootA] < componentSizes[rootB]) {
            [rootA, rootB] = [rootB, rootA];
        }
        componentRoots[rootB] = rootA;
        componentSizes[rootA] += componentSizes[rootB];
        return true;
    }
    return false;
}

function calculateMinimumSpanningStructure(inputData) {
    const allLines = inputData.split('\n');

    const [horizontalExtent, verticalExtent] = allLines[0].split(' ').map(Number);

    const hConnectionCosts = allLines.slice(1, 1 + horizontalExtent).map(s => Number(s) || Number.MAX_SAFE_INTEGER);

    const vConnectionCosts = allLines.slice(1 + horizontalExtent, 1 + horizontalExtent + verticalExtent).map(s => Number(s) || Number.MAX_SAFE_INTEGER);

    const totalGridPoints = (horizontalExtent + 1) * (verticalExtent + 1);
    const pointsPerVerticalSlice = horizontalExtent + 1;

    const allPossibleConnections = [];

    for (let currentY = 0; currentY <= verticalExtent; currentY++) {
        for (let currentX = 0; currentX < horizontalExtent; currentX++) {
            const pointA = currentY * pointsPerVerticalSlice + currentX;
            const pointB = currentY * pointsPerVerticalSlice + (currentX + 1);
            const connectionWeight = hConnectionCosts[currentX];
            allPossibleConnections.push({ origin: pointA, destination: pointB, cost: connectionWeight });
        }
    }

    for (let currentY = 0; currentY < verticalExtent; currentY++) {
        for (let currentX = 0; currentX <= horizontalExtent; currentX++) {
            const pointA = currentY * pointsPerVerticalSlice + currentX;
            const pointB = (currentY + 1) * pointsPerVerticalSlice + currentX;
            const connectionWeight = vConnectionCosts[currentY];
            allPossibleConnections.push({ origin: pointA, destination: pointB, cost: connectionWeight });
        }
    }

    allPossibleConnections.sort((connA, connB) => connA.cost - connB.cost);

    setupComponents(totalGridPoints);

    let minimumTotalCost = 0;
    let connectionsFormed = 0;

    for (const connection of allPossibleConnections) {
        if (mergeComponents(connection.origin, connection.destination)) {
            minimumTotalCost += connection.cost;
            connectionsFormed++;
            if (connectionsFormed === totalGridPoints - 1) {
                break;
            }
        }
    }

    console.log(minimumTotalCost);
}

calculateMinimumSpanningStructure(require("fs").readFileSync("/dev/stdin", "utf8"));