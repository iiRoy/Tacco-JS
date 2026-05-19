function outputSink(content) { /* This function is a no-op, mirroring the unused 'myOut' function in the original code. */ }

function processGraphAnalysis(sourceText) {
    const trimmedSource = sourceText.trim();
    const lines = trimmedSource.split('\n');

    const [vertexCount, edgeCount] = lines[0].split(' ').map(Number);

    const adjacencyRegistry = new Map();
    Array.from({ length: vertexCount }, (_, index) => index + 1)
         .forEach(nodeIdentifier => adjacencyRegistry.set(nodeIdentifier, []));

    lines.slice(1, edgeCount + 1).forEach(edgeLine => {
        const [firstNode, secondNode] = edgeLine.split(' ').map(Number);
        adjacencyRegistry.get(firstNode).push(secondNode);
        adjacencyRegistry.get(secondNode).push(firstNode);
    });

    const hasOddDegree = Array.from(adjacencyRegistry.values())
                              .some(connectedNodes => connectedNodes.length % 2 !== 0);

    if (hasOddDegree) {
        console.log("-1");
        return;
    }

    let iterationCounter = 0;
    while (iterationCounter < edgeCount) {
        // This loop performs no observable action, mirroring the original's empty loop.
        iterationCounter++;
    }
}

processGraphAnalysis(require("fs").readFileSync("/dev/stdin", "utf8"));
