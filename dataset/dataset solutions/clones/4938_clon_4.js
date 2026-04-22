'use strict';
class ConnectionSet {
    constructor(nodeCount) {
        this.representatives = Array.from({ length: nodeCount }, (_, i) => i);
        this.groupCount = nodeCount;
    }

    findRoot(elementId) {
        if (this.representatives[elementId] === elementId) {
            return elementId;
        }
        this.representatives[elementId] = this.findRoot(this.representatives[elementId]);
        return this.representatives[elementId];
    }

    mergeGroups(idA, idB) {
        let rootA = this.findRoot(idA);
        let rootB = this.findRoot(idB);

        if (rootA !== rootB) {
            this.representatives[rootB] = rootA;
            this.groupCount--;
            return true;
        }
        return false;
    }

    get remainingGroups() {
        return this.groupCount;
    }
}

class EdgeData {
    constructor(originNode, targetNode, linkValue) {
        this.start = originNode;
        this.end = targetNode;
        this.weight = linkValue;
    }
}

function ProcessInput(sourceData) {
    let textLines = sourceData.split("\n");
    let gridDimensions = textLines[0].split(" ");
    let gridWidth = parseInt(gridDimensions[0]);
    let gridHeight = parseInt(gridDimensions[1]);

    let horizontalLinkValues = [];
    for (let currentIdx = 0; currentIdx < gridWidth; currentIdx++) {
        horizontalLinkValues.push(parseInt(textLines[1 + currentIdx]) || 100000001);
    }

    let verticalLinkValues = [];
    for (let currentIdx = 0; currentIdx < gridHeight; currentIdx++) {
        verticalLinkValues.push(parseInt(textLines[1 + gridWidth + currentIdx]) || 100000001);
    }

    let allGraphEdges = [];
    let totalGridPoints = (gridWidth + 1) * (gridHeight + 1);

    // Generate horizontal edges
    for (let rowIdx = 0; rowIdx <= gridHeight; rowIdx++) {
        for (let colIdx = 0; colIdx < gridWidth; colIdx++) {
            let pointA = (gridWidth + 1) * rowIdx + colIdx;
            let pointB = (gridWidth + 1) * rowIdx + (colIdx + 1);
            let edgeWeight = horizontalLinkValues[colIdx];
            allGraphEdges.push(new EdgeData(pointA, pointB, edgeWeight));
        }
    }

    // Generate vertical edges
    for (let rowIdx = 0; rowIdx < gridHeight; rowIdx++) {
        for (let colIdx = 0; colIdx <= gridWidth; colIdx++) {
            let pointA = (gridWidth + 1) * rowIdx + colIdx;
            let pointB = (gridWidth + 1) * (rowIdx + 1) + colIdx;
            let edgeWeight = verticalLinkValues[rowIdx];
            allGraphEdges.push(new EdgeData(pointA, pointB, edgeWeight));
        }
    }

    // Sort edges by weight
    allGraphEdges.sort((edgeOne, edgeTwo) => edgeOne.weight - edgeTwo.weight);

    let dsuManager = new ConnectionSet(totalGridPoints);
    let cumulativeValue = 0;
    let edgesAccepted = 0;
    let requiredConnections = totalGridPoints - 1; // For a connected graph

    for (let edgeIndex = 0; edgeIndex < allGraphEdges.length; edgeIndex++) {
        let currentEdge = allGraphEdges[edgeIndex];
        if (dsuManager.mergeGroups(currentEdge.start, currentEdge.end)) {
            cumulativeValue += currentEdge.weight;
            edgesAccepted++;
            if (edgesAccepted === requiredConnections) {
                break;
            }
        }
    }

    console.log(cumulativeValue);
}

ProcessInput(require("fs").readFileSync("/dev/stdin", "utf8"));