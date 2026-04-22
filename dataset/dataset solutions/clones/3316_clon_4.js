function ProcessGraphPaths(rawData) {
    const rawInputLines = rawData.split("\n");

    const firstConfiguration = rawInputLines.shift().split(" ").map(Number);
    const totalNodes = firstConfiguration[0]; 
    const totalEdges = firstConfiguration[1];

    const connectionStatements = rawInputLines
        .map(line => line.split(" ").map(Number))
        .filter(arr => arr.length === 2 && !isNaN(arr[0]) && !isNaN(arr[1])); 

    const adjacencyMap = new Map(); 
    const entryDegrees = new Map(); 
    const activeNodes = new Set(); 

    for (const [sourceVertex, destinationVertex] of connectionStatements) {
        activeNodes.add(sourceVertex);
        activeNodes.add(destinationVertex);

        if (!adjacencyMap.has(sourceVertex)) {
            adjacencyMap.set(sourceVertex, new Set());
        }
        adjacencyMap.get(sourceVertex).add(destinationVertex);

        entryDegrees.set(destinationVertex, (entryDegrees.get(destinationVertex) || 0) + 1);
        if (!entryDegrees.has(sourceVertex)) {
            entryDegrees.set(sourceVertex, 0);
        }
    }

    const topologicalQueue = [];
    const maxEdgePaths = new Map(); 

    for (const nodeIdentifier of activeNodes) {
        if ((entryDegrees.get(nodeIdentifier) || 0) === 0) { 
            topologicalQueue.push(nodeIdentifier);
        }
        maxEdgePaths.set(nodeIdentifier, 0); 
    }

    let resultantLength = 0;

    while (topologicalQueue.length > 0) {
        const processedNode = topologicalQueue.shift();
        resultantLength = Math.max(resultantLength, maxEdgePaths.get(processedNode));

        if (adjacencyMap.has(processedNode)) {
            for (const adjacentNode of adjacencyMap.get(processedNode)) {
                maxEdgePaths.set(
                    adjacentNode,
                    Math.max(
                        maxEdgePaths.get(adjacentNode),
                        maxEdgePaths.get(processedNode) + 1
                    )
                );

                entryDegrees.set(adjacentNode, entryDegrees.get(adjacentNode) - 1);
                if (entryDegrees.get(adjacentNode) === 0) {
                    topologicalQueue.push(adjacentNode);
                }
            }
        }
    }

    console.log('%s', resultantLength);
    return resultantLength;
}

function TestGraphAnalysis(testCaseNumber) {
    var testInput = document.getElementById("input" + testCaseNumber).value;
    var computedResult = ProcessGraphPaths(testInput);
    var expectedResult = document.getElementById("output" + testCaseNumber).value.split("\n")[0];
    var evaluationStatus = "FAIL";
    if (computedResult == expectedResult) {
        evaluationStatus = "PASS";
    }
    document.getElementById("result" + testCaseNumber).innerHTML = evaluationStatus;
}

ProcessGraphPaths(require("fs").readFileSync("/dev/stdin", "utf8"));