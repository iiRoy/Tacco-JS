'use strict';

function ProcessInput(rawData) {
    const lineData = rawData.split("\n");
    const dimensions = lineData[0].split(" ");
    const gridWidth = parseInt(dimensions[0]);
    const gridHeight = parseInt(dimensions[1]);

    const horizontalEdgeCosts = [];
    for (let i = 0; i < gridWidth; i++) {
        horizontalEdgeCosts.push(lineData[1 + i]);
    }

    const verticalEdgeCosts = [];
    for (let i = 0; i < gridHeight; i++) {
        verticalEdgeCosts.push(lineData[1 + gridWidth + i]);
    }

    const numPointsX = gridWidth + 1;
    const numPointsY = gridHeight + 1;
    const totalGraphVertices = numPointsX * numPointsY;
    const infiniteEdgeWeight = 100000001;

    const graphEdges = [];

    // Construct horizontal edges
    for (let yPosition = 0; yPosition < numPointsY; yPosition++) {
        for (let xPosition = 0; xPosition < gridWidth; xPosition++) {
            const edgeWeight = parseInt(horizontalEdgeCosts[xPosition]) || infiniteEdgeWeight;
            if (edgeWeight < infiniteEdgeWeight) {
                const vertexA = yPosition * numPointsX + xPosition;
                const vertexB = yPosition * numPointsX + (xPosition + 1);
                graphEdges.push({ u: vertexA, v: vertexB, w: edgeWeight });
            }
        }
    }

    // Construct vertical edges
    for (let xPosition = 0; xPosition < numPointsX; xPosition++) {
        for (let yPosition = 0; yPosition < gridHeight; yPosition++) {
            const edgeWeight = parseInt(verticalEdgeCosts[yPosition]) || infiniteEdgeWeight;
            if (edgeWeight < infiniteEdgeWeight) {
                const vertexA = yPosition * numPointsX + xPosition;
                const vertexB = (yPosition + 1) * numPointsX + xPosition;
                graphEdges.push({ u: vertexA, v: vertexB, w: edgeWeight });
            }
        }
    }

    // Sort edges by their weight in ascending order
    graphEdges.sort((edgeOne, edgeTwo) => edgeOne.w - edgeTwo.w);

    class DisjointSetStructure {
        constructor(elementCount) {
            this.parentArray = Array.from({ length: elementCount }, (_, idx) => idx);
            this.rankArray = Array(elementCount).fill(0);
            this.componentCount = elementCount;
        }

        findRepresentative(elementIdx) {
            if (this.parentArray[elementIdx] === elementIdx) {
                return elementIdx;
            }
            return this.parentArray[elementIdx] = this.findRepresentative(this.parentArray[elementIdx]);
        }

        mergeComponents(indexOne, indexTwo) {
            let rootOne = this.findRepresentative(indexOne);
            let rootTwo = this.findRepresentative(indexTwo);

            if (rootOne !== rootTwo) {
                if (this.rankArray[rootOne] < this.rankArray[rootTwo]) {
                    this.parentArray[rootOne] = rootTwo;
                } else if (this.rankArray[rootOne] > this.rankArray[rootTwo]) {
                    this.parentArray[rootTwo] = rootOne;
                } else {
                    this.parentArray[rootTwo] = rootOne;
                    this.rankArray[rootOne]++;
                }
                this.componentCount--;
                return true;
            }
            return false;
        }
    }

    const dsuInstance = new DisjointSetStructure(totalGraphVertices);
    let minimumSpanningTreeWeight = 0;

    for (const currentEdge of graphEdges) {
        if (dsuInstance.mergeComponents(currentEdge.u, currentEdge.v)) {
            minimumSpanningTreeWeight += currentEdge.w;
        }
        if (dsuInstance.componentCount === 1) {
            break;
        }
    }

    console.log(minimumSpanningTreeWeight);
}

ProcessInput(require("fs").readFileSync("/dev/stdin", "utf8"));
