(function commenceProcessing() {
    const rawInput = require('node:fs').readFileSync('/dev/stdin', 'utf8');
    const inputParts = rawInput.trim().split(/\s+/);

    let currentInputIndex = 0;
    const totalVertices = Number(inputParts[currentInputIndex++]);

    const nodeConnections = new Map();
    for (let nodeIdentifier = 0; nodeIdentifier < totalVertices; nodeIdentifier++) {
        nodeConnections.set(nodeIdentifier, []);
    }

    let currentVertexBeingParsed = 0;
    while (currentVertexBeingParsed < totalVertices) {
        currentInputIndex++; // Skip the node ID which is currentVertexBeingParsed + 1
        const neighborCount = Number(inputParts[currentInputIndex++]);
        const currentVertexNeighbors = [];
        for (let k = 0; k < neighborCount; k++) {
            currentVertexNeighbors.push(Number(inputParts[currentInputIndex++]) - 1);
        }
        nodeConnections.set(currentVertexBeingParsed, currentVertexNeighbors);
        currentVertexBeingParsed++;
    }

    const globalTimeKeeper = { value: 0 };
    const discoveryRecords = new Array(totalVertices).fill(0);
    const completionRecords = new Array(totalVertices).fill(0);
    const vertexVisitStates = new Array(totalVertices).fill(0); // 0: untouched, 1: visiting, 2: visited

    traverseGraphDepthFirstIterative(totalVertices, nodeConnections, globalTimeKeeper, discoveryRecords, completionRecords, vertexVisitStates);

    const outputSegments = [];
    for (let vertexIndex = 0; vertexIndex < totalVertices; vertexIndex++) {
        outputSegments.push(`${vertexIndex + 1} ${discoveryRecords[vertexIndex]} ${completionRecords[vertexIndex]}`);
    }
    console.log(outputSegments.join('\n'));
})();

function traverseGraphDepthFirstIterative(numNodes, adjacencyMap, timerObject, entryMoments, exitMoments, nodeStates) {
    const UNTOUCHED = 0;
    const VISITING = 1;
    const VISITED = 2;

    for (let startingNode = 0; startingNode < numNodes; startingNode++) {
        if (nodeStates[startingNode] === UNTOUCHED) {
            const processingStack = [];

            processingStack.push({ actionType: 'discover', targetNode: startingNode });

            while (processingStack.length > 0) {
                const currentOperation = processingStack.pop();
                const focusNode = currentOperation.targetNode;

                if (currentOperation.actionType === 'discover') {
                    if (nodeStates[focusNode] === UNTOUCHED) {
                        nodeStates[focusNode] = VISITING;
                        entryMoments[focusNode] = ++timerObject.value;

                        processingStack.push({ actionType: 'finish', targetNode: focusNode });

                        const connectedNodes = adjacencyMap.get(focusNode) || [];
                        for (let j = connectedNodes.length - 1; j >= 0; j--) {
                            const connected = connectedNodes[j];
                            if (nodeStates[connected] === UNTOUCHED) {
                                processingStack.push({ actionType: 'discover', targetNode: connected });
                            }
                        }
                    }
                } else if (currentOperation.actionType === 'finish') {
                    if (nodeStates[focusNode] !== VISITED) {
                        nodeStates[focusNode] = VISITED;
                        exitMoments[focusNode] = ++timerObject.value;
                    }
                }
            }
        }
    }
}