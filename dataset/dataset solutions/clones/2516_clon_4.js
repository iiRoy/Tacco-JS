let inputCollector = [];
require('readline').createInterface({
    input: process.stdin,
    output: process.stdout
}).on('line', (line) => inputCollector.push(line))
  .on('close', () => {
    const dataHandler = new InputProcessor(inputCollector);
    console.error("\n");
    const executionStart = Date.now();
    processGraphAnalysis(dataHandler);
    const executionEnd = Date.now() - executionStart;
    debugLog(`time : ${executionEnd}ms`);
    debugLog(`memory : ${Math.round(process.memoryUsage().heapTotal / 1024)}KB`);
});

class InputProcessor {
    constructor(lines) {
        this.sourceLines = lines;
        this.currentLineIndex = 0;
    }

    hasMoreLines() {
        return this.currentLineIndex < this.sourceLines.length;
    }

    fetchNextLine() {
        if (!this.hasMoreLines()) {
            throw new Error("ArrayIndexOutOfBoundsException ‚There is no more input");
        }
        return this.sourceLines[this.currentLineIndex++];
    }

    extractInt() {
        return parseInt(this.fetchNextLine(), 10);
    }

    extractCharSequence() {
        return this.fetchNextLine().split('');
    }
}

function printOutput(content) {
    console.log(content);
}

function debugLog(content) {
    console.error(`debug:${require("util").inspect(content, false, null)}`);
}

function processGraphAnalysis(dataHandler) {
    const nodeCount = dataHandler.extractInt();

    const adjacencyMap = new Map(); // Map<NodeIndex, Set<NeighborNodeIndex>>
    const nodeDepths = new Map();   // Map<NodeIndex, Number> for depths
    const visitedStatus = new Set(); // Set<NodeIndex> for visited status

    // Initialize adjacency map for all nodes
    Array.from({ length: nodeCount }, (_, idx) => idx).forEach(idx => {
        adjacencyMap.set(idx, new Set());
    });

    // Build graph from input
    Array.from({ length: nodeCount }, (_, sourceNode) => {
        const connectionIndicators = dataHandler.extractCharSequence();
        connectionIndicators.forEach((indicator, targetNode) => {
            if (sourceNode !== targetNode && indicator === '1') {
                adjacencyMap.get(sourceNode).add(targetNode);
            }
        });
    });

    let maxDepthReached = -1;
    let traversalInitiated = false;
    
    // Find a starting node for BFS: a node with exactly one outgoing edge
    const potentialStartNode = Array.from(adjacencyMap.keys()).find(nodeIdx => 
        adjacencyMap.get(nodeIdx).size === 1
    );

    if (potentialStartNode !== undefined) {
        traversalInitiated = true;

        // BFS traversal using a generator
        function* bfsGenerator(startNode) {
            const traversalQueue = [[startNode, 1]]; // [node, currentDepth]
            visitedStatus.add(startNode);
            nodeDepths.set(startNode, 1);

            while (traversalQueue.length > 0) {
                const [currentNode, currentDepth] = traversalQueue.shift();
                yield { node: currentNode, depth: currentDepth };

                for (const neighbor of adjacencyMap.get(currentNode)) {
                    if (!visitedStatus.has(neighbor)) {
                        visitedStatus.add(neighbor);
                        nodeDepths.set(neighbor, currentDepth + 1);
                        traversalQueue.push([neighbor, currentDepth + 1]);
                    }
                }
            }
        }

        // Execute BFS and update maxDepthReached
        for (const { node, depth } of bfsGenerator(potentialStartNode)) {
            maxDepthReached = Math.max(maxDepthReached, depth);
        }
    }

    if (!traversalInitiated) {
        printOutput(maxDepthReached); // Will be -1
        return;
    }

    let finalResult = maxDepthReached;

    // Post-traversal validation: Check for connections between nodes at the same depth
    // Using nested functional iterations instead of imperative loops
    Array.from({ length: nodeCount - 1 }, (_, i) => i).some(nodeA => {
        return Array.from({ length: nodeCount - 1 - nodeA }, (_, j) => j + nodeA + 1).some(nodeB => {
            // If a node was not visited, its depth is implicitly 1 as per original logic
            const depthA = nodeDepths.has(nodeA) ? nodeDepths.get(nodeA) : 1;
            const depthB = nodeDepths.has(nodeB) ? nodeDepths.get(nodeB) : 1;

            if (depthA === depthB) {
                const connectedAtoB = adjacencyMap.get(nodeA).has(nodeB);
                const connectedBtoA = adjacencyMap.get(nodeB).has(nodeA);

                if (connectedAtoB || connectedBtoA) {
                    debugLog({ i: nodeA, j: nodeB }); // Preserve debug output format
                    finalResult = -1;
                    return true; // Break inner loop (equivalent to `break` in for loop)
                }
            }
            return false; // Continue inner loop
        });
    });

    printOutput(finalResult);
}
