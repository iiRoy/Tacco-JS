function processGraphData(inputSegments) {
    const parsedValues = inputSegments[0].split(' ').map(Number);
    const vertexCount = parsedValues[0];
    const targetEdgeCount = parsedValues[1];

    const calculateCombinations2 = (quantity) => quantity < 2 ? 0 : (quantity * (quantity - 1)) / 2;

    let selectedParameter = undefined;
    const potentialParameters = Array.from({ length: vertexCount }, (_, index) => vertexCount - index); // Generates [N, N-1, ..., 1]
    
    selectedParameter = potentialParameters.find(currentParam => {
        const derivedEdgeCount = calculateCombinations2(vertexCount - currentParam) + currentParam - 1;
        return derivedEdgeCount === targetEdgeCount;
    });

    if (selectedParameter === undefined) {
        return "-1";
    }

    const outputLines = [];
    outputLines.push(`Ident=${selectedParameter}`);
    outputLines.push(vertexCount - 1);

    const pathEdges = Array.from({ length: selectedParameter }, (_, j) => `${j + 1} ${j + 2}`);
    outputLines.push(...pathEdges);

    const starEdgeQuantity = vertexCount - (selectedParameter + 1);
    if (starEdgeQuantity > 0) {
        const starEdges = Array.from({ length: starEdgeQuantity }, (_, k) => `${selectedParameter + 1} ${selectedParameter + 2 + k}`);
        outputLines.push(...starEdges);
    }
    
    return outputLines.join('\n');
}

function activateProcessor() {
    let receivedData = "";
    process.stdin.resume();
    process.stdin.setEncoding("utf8");
    process.stdin.on("data", (dataChunk) => {
        receivedData += dataChunk;
    });
    process.stdin.on("end", () => {
        console.log(processGraphData(receivedData.split("\n")));
    });
}

activateProcessor();