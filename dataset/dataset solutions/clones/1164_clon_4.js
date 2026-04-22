let textStore = "";
const outputHandler = console.log;

if (typeof process !== "undefined" && process.stdin) {
    process.stdin.resume();
    process.stdin.setEncoding('utf8');
    process.stdin.on('data', function (dataChunk) {
        textStore += dataChunk;
    });
    process.stdin.on('end', function () {
        const processedLines = textStore.split("\n").filter(l => l.trim() !== '');
        executeAnalysis(processedLines);
    });
}

function executeAnalysis(inputLines) {
    const numericData = inputLines.map(line => line.split(" ").map(Number));

    const firstRow = numericData.shift();
    const totalVertices = firstRow[0];

    const graphStructure = new Map();
    for (let j = 0; j < totalVertices; j++) {
        graphStructure.set(j, new Set());
    }

    numericData.forEach(pair => {
        const nodeA = pair[0];
        const nodeB = pair[1];
        graphStructure.get(nodeA).add(nodeB);
        graphStructure.get(nodeB).add(nodeA);
    });

    class BridgeFinder {
        constructor(graph, vertexCount) {
            this.graphRepresentation = graph;
            this.nodeCount = vertexCount;
            this.discoveryTimes = new Map();
            this.lowLinkValues = new Map();
            this.visitedStatus = new Map();
            this.currentTimestamp = 0;
            this.detectedSeparators = [];

            for (let i = 0; i < this.nodeCount; i++) {
                this.visitedStatus.set(i, false);
                this.discoveryTimes.set(i, -1);
                this.lowLinkValues.set(i, -1);
            }
        }

        performDepthFirstSearch(currentNode, parentNode) {
            this.visitedStatus.set(currentNode, true);
            this.discoveryTimes.set(currentNode, this.currentTimestamp);
            this.lowLinkValues.set(currentNode, this.currentTimestamp);
            this.currentTimestamp++;

            const adjacentNodes = this.graphRepresentation.get(currentNode);
            if (adjacentNodes) {
                for (const neighborNode of adjacentNodes) {
                    if (neighborNode === parentNode) {
                        continue;
                    }

                    if (this.visitedStatus.get(neighborNode)) {
                        this.lowLinkValues.set(
                            currentNode,
                            Math.min(
                                this.lowLinkValues.get(currentNode),
                                this.discoveryTimes.get(neighborNode)
                            )
                        );
                    } else {
                        this.performDepthFirstSearch(neighborNode, currentNode);

                        this.lowLinkValues.set(
                            currentNode,
                            Math.min(
                                this.lowLinkValues.get(currentNode),
                                this.lowLinkValues.get(neighborNode)
                            )
                        );

                        if (this.lowLinkValues.get(neighborNode) > this.discoveryTimes.get(currentNode)) {
                            this.detectedSeparators.push([
                                Math.min(currentNode, neighborNode),
                                Math.max(currentNode, neighborNode)
                            ]);
                        }
                    }
                }
            }
        }

        findSeparatingEdges() {
            for (let i = 0; i < this.nodeCount; i++) {
                if (!this.visitedStatus.get(i)) {
                    this.performDepthFirstSearch(i, -1);
                }
            }
            this.detectedSeparators.sort((a, b) => {
                if (a[0] !== b[0]) return a[0] - b[0];
                return a[1] - b[1];
            });
            return this.detectedSeparators;
        }
    }

    const analyzer = new BridgeFinder(graphStructure, totalVertices);
    const resultEdges = analyzer.findSeparatingEdges();

    resultEdges.forEach(bridgePair => {
        outputHandler(`${bridgePair[0]} ${bridgePair[1]}`);
    });
}