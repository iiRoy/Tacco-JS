function GameSimulation(dataSource) {
    const parsedLines = dataSource.split('\n').map(line => line.trim()).filter(line => line.length > 0);

    const totalVertices = Number(parsedLines[0]);

    const connectionDescriptions = parsedLines.slice(1).map(line => {
        const componentValues = line.split(' ').map(Number);
        return [componentValues[0] - 1, componentValues[1] - 1]; 
    });

    class GraphPathfinder {
        constructor(vertexQuantity, connections) {
            this.nodeAdjacency = new Map();
            for (let index = 0; index < vertexQuantity; ++index) {
                this.nodeAdjacency.set(index, new Set());
            }
            for (const [nodeA, nodeB] of connections) {
                this.nodeAdjacency.get(nodeA).add(nodeB);
                this.nodeAdjacency.get(nodeB).add(nodeA);
            }
        }

        evaluateShortestPaths(originVertex) {
            const distanceMeasures = new Map();
            for (let index = 0; index < this.nodeAdjacency.size; ++index) {
                distanceMeasures.set(index, Infinity);
            }
            distanceMeasures.set(originVertex, 0);

            const explorationFrontier = [originVertex];
            let currentHead = 0;

            while (currentHead < explorationFrontier.length) {
                const activeVertex = explorationFrontier[currentHead++];
                const currentPathLength = distanceMeasures.get(activeVertex);

                for (const adjacentVertex of this.nodeAdjacency.get(activeVertex)) {
                    if (distanceMeasures.get(adjacentVertex) > currentPathLength + 1) {
                        distanceMeasures.set(adjacentVertex, currentPathLength + 1);
                        explorationFrontier.push(adjacentVertex);
                    }
                }
            }
            return distanceMeasures;
        }
    }

    const graphProcessor = new GraphPathfinder(totalVertices, connectionDescriptions);

    const pathsFromZero = graphProcessor.evaluateShortestPaths(0);
    const pathsFromLast = graphProcessor.evaluateShortestPaths(totalVertices - 1);

    const centralNodeIndices = Array.from({ length: totalVertices }, (_, k) => k)
                                        .filter(idx => idx !== 0 && idx !== totalVertices - 1);

    const countCloserToZero = centralNodeIndices.filter(idx => 
        pathsFromZero.get(idx) <= pathsFromLast.get(idx)
    ).length;

    const totalMiddleNodes = totalVertices - 2;
    const countCloserToLast = totalMiddleNodes - countCloserToZero;

    const ultimateWinner = (countCloserToZero <= countCloserToLast) ? "Snuke" : "Fennec";

    console.log(ultimateWinner);
}

GameSimulation(require("fs").readFileSync("/dev/stdin", "utf8"));