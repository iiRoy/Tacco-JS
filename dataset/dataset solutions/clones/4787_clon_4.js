process.stdin.resume();
process.stdin.setEncoding('ascii');

let inputBuffer = "";
let lineBuffer = [];
let currentLineIndex = 0;

process.stdin.on('data', (chunk) => {
    inputBuffer += chunk;
});

process.stdin.on('end', () => {
    lineBuffer = inputBuffer.split("\n");
    processGraph();
});

function fetchLine() {
    return lineBuffer[currentLineIndex++];
}

function processGraph() {
    const UNREACHABLE_COST = 1000000000;

    const [nodeCountStr, edgeCountStr] = fetchLine().split(" ");
    const nodeCount = Number(nodeCountStr);
    const edgeCount = Number(edgeCountStr);

    const edgeRecords = Array.from({ length: edgeCount }, () => {
        const [uStr, vStr, wStr] = fetchLine().split(" ");
        return {
            src: Number(uStr) - 1,
            dest: Number(vStr) - 1,
            weight: Number(wStr)
        };
    });

    const distanceMatrix = Array.from({ length: nodeCount }, (_, r) =>
        Array.from({ length: nodeCount }, (_, c) => (r === c ? 0 : UNREACHABLE_COST))
    );

    edgeRecords.forEach(currentEdge => {
        distanceMatrix[currentEdge.src][currentEdge.dest] = Math.min(
            distanceMatrix[currentEdge.src][currentEdge.dest],
            currentEdge.weight
        );
        distanceMatrix[currentEdge.dest][currentEdge.src] = Math.min(
            distanceMatrix[currentEdge.dest][currentEdge.src],
            currentEdge.weight
        );
    });

    for (let idxK = 0; idxK < nodeCount; idxK++) {
        for (let idxI = 0; idxI < nodeCount; idxI++) {
            for (let idxJ = 0; idxJ < nodeCount; idxJ++) {
                const pathThroughK = distanceMatrix[idxI][idxK] + distanceMatrix[idxK][idxJ];
                if (distanceMatrix[idxI][idxJ] > pathThroughK) {
                    distanceMatrix[idxI][idxJ] = pathThroughK;
                }
            }
        }
    }

    let nonEssentialEdges = edgeCount;

    edgeRecords.forEach(currentEdge => {
        const isSegmentOfShortest = Array.from({ length: nodeCount }, (_, intermediatePoint) => intermediatePoint)
            .some(intermediatePoint => {
                return distanceMatrix[intermediatePoint][currentEdge.src] + currentEdge.weight === distanceMatrix[intermediatePoint][currentEdge.dest];
            });

        if (isSegmentOfShortest) {
            nonEssentialEdges--;
        }
    });

    console.log(nonEssentialEdges);
    process.exit();
}
