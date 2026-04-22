const emit = console.log;

function performAnalysis(textRows) {
    if (textRows.slice(-1)[0] === "") {
        textRows.pop();
    }

    const numericData = textRows.map(function(lineSegment) {
        return lineSegment.split(" ").map(function(elementString) {
            return Number(elementString);
        });
    });

    const initialConfig = numericData.shift();
    const totalVertices = initialConfig[0];
    const edgeCount = initialConfig[1];

    const adjacencyStructure = new Map();
    for (let i = 0; i < totalVertices; i++) {
        adjacencyStructure.set(i, []);
    }

    numericData.forEach(function(connectionPair) {
        const firstNode = connectionPair[0];
        const secondNode = connectionPair[1];
        adjacencyStructure.get(firstNode).push(secondNode);
        adjacencyStructure.get(secondNode).push(firstNode);
    });

    const analyzer = new GraphAnalyzer(totalVertices, adjacencyStructure);
    const criticalLinks = analyzer.findCriticalConnections();

    criticalLinks.forEach(function(link) {
        emit(link[0] + " " + link[1]);
    });
}

class GraphAnalyzer {
    constructor(totalVertices, graphAdjacencies) {
        this.totalVertices = totalVertices;
        this.graphAdjacencies = graphAdjacencies;
        this.discoveryTimings = new Map();
        this.minDiscovery = new Map();
        this.visitedSet = new Set();
        this.timeCounter = 0;
        this.criticalLinks = [];
    }

    findCriticalConnections() {
        for (let i = 0; i < this.totalVertices; i++) {
            if (!this.visitedSet.has(i)) {
                this.exploreGraph(i, -1);
            }
        }
        this.criticalLinks.forEach(pair => pair.sort((a, b) => a - b));
        this.criticalLinks.sort((a, b) => {
            if (a[0] !== b[0]) return a[0] - b[0];
            return a[1] - b[1];
        });
        return this.criticalLinks;
    }

    exploreGraph(currentVertex, parentVertex) {
        this.visitedSet.add(currentVertex);
        this.discoveryTimings.set(currentVertex, this.timeCounter);
        this.minDiscovery.set(currentVertex, this.timeCounter);
        this.timeCounter++;

        const neighbors = this.graphAdjacencies.get(currentVertex) || [];

        for (const neighborVertex of neighbors) {
            if (neighborVertex === parentVertex) {
                continue;
            }

            if (this.visitedSet.has(neighborVertex)) {
                this.minDiscovery.set(currentVertex, Math.min(
                    this.minDiscovery.get(currentVertex),
                    this.discoveryTimings.get(neighborVertex)
                ));
            } else {
                this.exploreGraph(neighborVertex, currentVertex);

                this.minDiscovery.set(currentVertex, Math.min(
                    this.minDiscovery.get(currentVertex),
                    this.minDiscovery.get(neighborVertex)
                ));

                if (this.minDiscovery.get(neighborVertex) > this.discoveryTimings.get(currentVertex)) {
                    this.criticalLinks.push([currentVertex, neighborVertex]);
                }
            }
        }
    }
}

if (typeof process !== "undefined" && process.stdin) {
    let entireText = "";
    process.stdin.resume();
    process.stdin.setEncoding('utf8');
    process.stdin.on('data', function (chunk) {
        entireText += chunk;
    });
    process.stdin.on('end', function () {
        const textRows = entireText.split("\n");
        performAnalysis(textRows);
    });
}