'use strict';

function processGridConnections(rawData) {
    let lines = rawData.split("\n");
    let dimensions = lines[0].split(" ");
    let gridWidth = parseInt(dimensions[0]);
    let gridHeight = parseInt(dimensions[1]);

    let horizontalCosts = [];
    let verticalCosts = [];

    for (let k = 0; k < gridWidth; k++) {
        horizontalCosts.push(lines[1 + k]);
    }
    for (let k = 0; k < gridHeight; k++) {
        verticalCosts.push(lines[1 + gridWidth + k]);
    }

    class DisjointSetStructure {
        constructor(elementCount) {
            this.parentArray = Array.from({ length: elementCount }, (_, index) => index);
            this.rankArray = Array(elementCount).fill(0);
            this.setCounter = elementCount;
        }

        findRepresentative(elementIndex) {
            if (this.parentArray[elementIndex] === elementIndex) {
                return elementIndex;
            }
            this.parentArray[elementIndex] = this.findRepresentative(this.parentArray[elementIndex]);
            return this.parentArray[elementIndex];
        }

        uniteSets(firstElement, secondElement) {
            let rootA = this.findRepresentative(firstElement);
            let rootB = this.findRepresentative(secondElement);

            if (rootA !== rootB) {
                if (this.rankArray[rootA] < this.rankArray[rootB]) {
                    this.parentArray[rootA] = rootB;
                } else if (this.rankArray[rootA] > this.rankArray[rootB]) {
                    this.parentArray[rootB] = rootA;
                } else {
                    this.parentArray[rootB] = rootA;
                    this.rankArray[rootA]++;
                }
                this.setCounter--;
                return true;
            }
            return false;
        }

        getDisjointSetCount() {
            return this.setCounter;
        }
    }

    function calculateMinimumSpanningCost() {
        const maxPossibleCost = 100000001;

        const totalNodes = (gridWidth + 1) * (gridHeight + 1);
        let allEdges = [];

        for (let row = 0; row <= gridHeight; row++) {
            for (let col = 0; col <= gridWidth; col++) {
                const currentNodeId = row * (gridWidth + 1) + col;

                if (col < gridWidth) {
                    const nextNodeId = row * (gridWidth + 1) + (col + 1);
                    const edgeWeight = parseInt(horizontalCosts[col]) || maxPossibleCost;
                    allEdges.push({ u: currentNodeId, v: nextNodeId, weight: edgeWeight });
                }

                if (row < gridHeight) {
                    const nextNodeId = (row + 1) * (gridWidth + 1) + col;
                    const edgeWeight = parseInt(verticalCosts[row]) || maxPossibleCost;
                    allEdges.push({ u: currentNodeId, v: nextNodeId, weight: edgeWeight });
                }
            }
        }

        allEdges.sort((edgeA, edgeB) => edgeA.weight - edgeB.weight);

        let totalSpanningCost = 0;
        const ds = new DisjointSetStructure(totalNodes);
        let edgesIncluded = 0;

        for (const currentEdge of allEdges) {
            if (ds.uniteSets(currentEdge.u, currentEdge.v)) {
                totalSpanningCost += currentEdge.weight;
                edgesIncluded++;
                if (edgesIncluded === totalNodes - 1) {
                    break;
                }
            }
        }

        return totalSpanningCost;
    }

    let finalCost = calculateMinimumSpanningCost();
    console.log(finalCost);
}

processGridConnections(require("fs").readFileSync("/dev/stdin", "utf8"));
