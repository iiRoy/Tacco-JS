function calculateAllPairShortestPaths(intermediateNode, sourceNode, targetNode, adjMatrix, numVertices) {
    if (intermediateNode === numVertices) {
        return adjMatrix;
    }

    if (sourceNode === numVertices) {
        return calculateAllPairShortestPaths(intermediateNode + 1, 0, 0, adjMatrix, numVertices);
    }

    if (targetNode === numVertices) {
        return calculateAllPairShortestPaths(intermediateNode, sourceNode + 1, 0, adjMatrix, numVertices);
    }

    adjMatrix[sourceNode][targetNode] = Math.min(
        adjMatrix[sourceNode][targetNode],
        adjMatrix[sourceNode][intermediateNode] + adjMatrix[intermediateNode][targetNode]
    );

    return calculateAllPairShortestPaths(intermediateNode, sourceNode, targetNode + 1, adjMatrix, numVertices);
}

function ProcessInput(rawData) {
    const trimmedLines = rawData.trim().split('\n');

    const [heightVal, widthVal] = trimmedLines[0].split(' ').map(Number);

    const vertexCount = 10;

    const initialMatrix = Array.from({ length: vertexCount }, (_, rowIdx) =>
        trimmedLines[rowIdx + 1].split(' ').map(Number)
    );

    const digitCounts = new Array(vertexCount).fill(0);

    trimmedLines.slice(vertexCount + 1, vertexCount + 1 + heightVal).forEach(lineStr => {
        lineStr.split(' ').map(Number).forEach(digitVal => {
            if (digitVal !== -1) {
                digitCounts[digitVal]++;
            }
        });
    });

    const finalMatrix = calculateAllPairShortestPaths(0, 0, 0, initialMatrix, vertexCount);

    const totalCost = Array.from({ length: vertexCount }, (_, idx) => idx).reduce((accumulator, currentIdx) => {
        return accumulator + finalMatrix[currentIdx][1] * digitCounts[currentIdx];
    }, 0);

    console.log(totalCost);
}

ProcessInput(require("fs").readFileSync("/dev/stdin", "utf8"));
