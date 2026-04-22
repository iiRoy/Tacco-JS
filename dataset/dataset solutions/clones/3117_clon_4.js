function* tokenGenerator(rawInput) {
    const linesOfText = rawInput.split('\n');
    for (const currentLine of linesOfText) {
        const lineSegments = currentLine.trim().split(' ');
        for (const segment of lineSegments) {
            if (segment !== '') {
                yield Number(segment);
            }
        }
    }
}

function processNetwork(sourceData) {
    const dataStream = tokenGenerator(sourceData);

    const totalVertices = dataStream.next().value;
    const totalConnections = dataStream.next().value;

    const vertexAdjacency = new Map();
    for (let vertexIdentifier = 1; vertexIdentifier <= totalVertices; vertexIdentifier++) {
        vertexAdjacency.set(vertexIdentifier, []);
    }

    for (let connectionIndex = 0; connectionIndex < totalConnections; connectionIndex++) {
        const firstPoint = dataStream.next().value;
        const secondPoint = dataStream.next().value;
        vertexAdjacency.get(firstPoint).push(secondPoint);
        vertexAdjacency.get(secondPoint).push(firstPoint);
    }

    const degreeAnalysis = Array.from({ length: totalVertices }, (_, zeroBasedIndex) => zeroBasedIndex + 1).reduce((summary, currentVertexId) => {
        const currentVertexDegree = vertexAdjacency.get(currentVertexId).length;

        if (currentVertexDegree === 6) {
            summary.hasDegreeSix = true;
        }
        if (currentVertexDegree === 4) {
            summary.degreeFourCount++;
        }
        if (currentVertexDegree % 2 !== 0) {
            summary.allDegreesEven = false;
        }
        return summary;
    }, { hasDegreeSix: false, degreeFourCount: 0, allDegreesEven: true });

    const finalVerdict = (degreeAnalysis.hasDegreeSix || degreeAnalysis.degreeFourCount >= 2) && degreeAnalysis.allDegreesEven;
    console.log(finalVerdict ? "Yes" : "No");
}

processNetwork(require("fs").readFileSync("/dev/stdin", "utf8"));