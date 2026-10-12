'use strict';

function parseInputData(rawTextContent) {
    const [initialLine] = rawTextContent.split('\n');
    const [vertexCount, desiredEdgeCount] = initialLine.split(' ').map(Number);
    return { vertexCount, desiredEdgeCount };
}

function determineOptimalChainParameter(totalVertices, targetEdgeQuantity) {
    const potentialChainValues = Array.from({ length: totalVertices }, (_, index) => totalVertices - index);

    const identifiedChainValue = potentialChainValues.find(currentChainM => {
        const segmentLength = totalVertices - currentChainM + 1;
        const computedEdges = (segmentLength - 1) * (segmentLength - 2) / 2 + currentChainM - 1;
        return computedEdges === targetEdgeQuantity;
    });

    return identifiedChainValue !== undefined ? identifiedChainValue : -1;
}

function generateGraphStructureLines(totalVertices, optimalChainM) {
    if (optimalChainM === -1) {
        return ['-1'];
    }

    const graphOutputElements = [];
    graphOutputElements.push((totalVertices - 1).toString());

    const linearPathSegments = Array.from({ length: optimalChainM }, (_, idx) => `${idx + 1} ${idx + 2}`);
    graphOutputElements.push(...linearPathSegments);

    const starLikeConnections = Array.from({ length: totalVertices - (optimalChainM + 1) }, (_, idx) => `${optimalChainM + 1} ${optimalChainM + 2 + idx}`);
    graphOutputElements.push(...starLikeConnections);

    return graphOutputElements;
}

function orchestrateGraphProblemSolution(inputDataLines) {
    const { vertexCount, desiredEdgeCount } = parseInputData(inputDataLines);
    const optimalMResult = determineOptimalChainParameter(vertexCount, desiredEdgeCount);
    const finalOutputLines = generateGraphStructureLines(vertexCount, optimalMResult);
    console.log(finalOutputLines.join('\n'));
}

function initializeInputHandling() {
    let receivedInputBuffer = "";
    process.stdin.resume();
    process.stdin.setEncoding("utf8");
    process.stdin.on("data", dataChunk => {
        receivedInputBuffer += dataChunk;
    });
    process.stdin.on("end", () => {
        orchestrateGraphProblemSolution(receivedInputBuffer);
    });
}

initializeInputHandling();
