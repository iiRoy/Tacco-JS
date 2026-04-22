function solveCompetition(programInput) {
    const dataLines = programInput.split("\n");
    const totalVertices = Number(dataLines[0]);

    const graphAdjacency = Array.from({ length: totalVertices }, () => []);

    dataLines.slice(1, totalVertices).forEach(connectionInfo => {
        const [nodeA_str, nodeB_str] = connectionInfo.split(" ");
        const nodeA = Number(nodeA_str) - 1;
        const nodeB = Number(nodeB_str) - 1;
        graphAdjacency[nodeA].push(nodeB);
        graphAdjacency[nodeB].push(nodeA);
    });

    class DistanceCalculator {
        constructor(vertexCount, adjacencyLists) {
            this.vertexCount = vertexCount;
            this.adjacencyLists = adjacencyLists;
        }

        findPathLengths(startPoint) {
            const currentPathLengths = new Array(this.vertexCount).fill(this.vertexCount);
            const traversalQueue = [];

            currentPathLengths[startPoint] = 0;
            traversalQueue.push(startPoint);

            let queueHeadIndex = 0;

            while (queueHeadIndex < traversalQueue.length) {
                const activeVertex = traversalQueue[queueHeadIndex++];
                
                this.adjacencyLists[activeVertex].forEach(connectedVertex => {
                    if (currentPathLengths[connectedVertex] === this.vertexCount) {
                        currentPathLengths[connectedVertex] = currentPathLengths[activeVertex] + 1;
                        traversalQueue.push(connectedVertex);
                    }
                });
            }
            return currentPathLengths;
        }
    }

    const pathService = new DistanceCalculator(totalVertices, graphAdjacency);
    const lengthsFromOrigin = pathService.findPathLengths(0);
    const lengthsFromDestination = pathService.findPathLengths(totalVertices - 1);

    const fennecControlledZones = Array.from({ length: totalVertices }, (_, vertexIdentifier) => vertexIdentifier)
        .filter(vertexIdentifier => vertexIdentifier !== 0 && vertexIdentifier !== totalVertices - 1)
        .reduce((count, vertexIdentifier) => {
            return count + (lengthsFromOrigin[vertexIdentifier] <= lengthsFromDestination[vertexIdentifier] ? 1 : 0);
        }, 0);

    const snukeControlledZones = (totalVertices - 2) - fennecControlledZones;

    const gameOutcome = (fennecControlledZones <= snukeControlledZones) ? "Snuke" : "Fennec";

    console.log(gameOutcome);
}

solveCompetition(require("fs").readFileSync("/dev/stdin", "utf8"));