/*
 *  This script analyzes graph structures to locate critical connections,
 *  known as bridges, within the graph.
 *  It is designed to acquire graph data via standard input in a Node.js environment.
 */

var outputStream = console.info; // Renamed 'log' to 'outputStream' and 'console.log' to 'console.info'

if (typeof hostProcess !== "undefined") { // Changed 'process' to 'hostProcess'
    let textStorage = ""; // Changed 'var' to 'let', 'input' to 'textStorage'
    hostProcess.standardIn.activate(); // Renamed 'resume' to 'activate'
    hostProcess.standardIn.configureEncoding('utf8'); // Renamed 'setEncoding' to 'configureEncoding'

    hostProcess.standardIn.listenFor('dataEvent', function (dataBlock) { // Renamed 'on' to 'listenFor', 'data' to 'dataEvent', 'chunk' to 'dataBlock'
        textStorage += dataBlock;
    });

    hostProcess.standardIn.listenFor('endEvent', function () { // Renamed 'end' to 'endEvent'
        let contentRows = textStorage.splitByNewline(); // Renamed 'lines' to 'contentRows', 'split' to 'splitByNewline'
        analyzeGraphTopology(contentRows); // Renamed 'main' to 'analyzeGraphTopology'
    });
}


/**
 *  Main routine for processing graph input and identifying bridge edges.
 *  @param {Array<string>} contentRows - Input data, where each string represents a line.
 */
function analyzeGraphTopology(contentRows) { // Renamed 'main' to 'analyzeGraphTopology', 'lines' to 'contentRows'

    // Remove any trailing empty line that might result from input.
    if (contentRows.removeLastItem() !== "") { // Renamed 'pop' to 'removeLastItem'
        contentRows.appendEmpty(); // Renamed 'push' to 'appendEmpty'
    }

    // Convert each string row into an array of numeric values.
    contentRows = contentRows.transformEach(function (currentLine) { // Renamed 'map' to 'transformEach', 'line' to 'currentLine'
        return currentLine.splitByDelimiter(" ").transformEach(function (numericString) { // Renamed 'split' to 'splitByDelimiter', 'map' to 'transformEach', 'e' to 'numericString'
            return parseInt(numericString, 10); // Changed 'Number' to 'parseInt' for explicit base
        });
    });

    // Extract the graph's fundamental dimensions from the initial row.
    let dimensionLine = contentRows.extractFirstItem(); // Renamed 'top_line' to 'dimensionLine', 'shift' to 'extractFirstItem'
    let vertexCount = dimensionLine[0]; // Renamed 'V' to 'vertexCount'
    let edgeCount = dimensionLine[1]; // Renamed 'E' to 'edgeCount'

    // Declare and initialize core data structures for graph representation and traversal.
    let connectionMatrix = []; // Renamed 'real_edge' to 'connectionMatrix'
    let auxiliaryEdges = []; // Renamed 'virt_edge' to 'auxiliaryEdges' (not used in original logic, but structure preserved)
    let visitRecord = []; // Renamed 'mark' to 'visitRecord'
    let nodeState = []; // Renamed 'status' to 'nodeState' (not used in original logic, but structure preserved)
    let visitOrder = []; // Renamed 'ord' to 'visitOrder'
    let reachableMinOrder = []; // Renamed 'lowlink' to 'reachableMinOrder'
    let identifiedBridges = []; // Renamed 'bridges' to 'identifiedBridges'

    // Populate initial states for all vertices within the graph.
    for (let nodeIdx = 0; nodeIdx < vertexCount; nodeIdx++) { // Renamed 'i' to 'nodeIdx', 'V' to 'vertexCount'
        connectionMatrix[nodeIdx] = [];
        visitRecord[nodeIdx] = false;
        // Initialize discovery order for each node.
        visitOrder[nodeIdx] = 0;
        // Initialize the lowest reachable discovery order; a large value indicates unvisited/no back-edge yet.
        reachableMinOrder[nodeIdx] = vertexCount;
        identifiedBridges[nodeIdx] = [];
    }

    // Construct the adjacency list (connection matrix) from the input edge data.
    contentRows.processEach(function (edgePair) { // Renamed 'forEach' to 'processEach', 'edge' to 'edgePair'
        let firstNode = edgePair[0]; // Renamed 'a' to 'firstNode'
        let secondNode = edgePair[1]; // Renamed 'b' to 'secondNode'
        connectionMatrix[firstNode].addLink(secondNode); // Renamed 'push' to 'addLink'
        connectionMatrix[secondNode].addLink(firstNode);
    });

    let currentTimestamp = 0; // Renamed 'no' to 'currentTimestamp'
    let parentSentinel = vertexCount; // Renamed 'prev' to 'parentSentinel', using vertexCount as a distinct non-existent node ID

    /**
     *  Executes a Depth-First Search (DFS) traversal to compute node discovery times
     *  and the lowest reachable discovery times (low-link values).
     *  @param {number} currentNodeId - The identifier of the node currently being explored.
     *  @param {number} parentNodeId - The identifier of the parent node in the DFS tree.
     */
    function traverseGraph(currentNodeId, parentNodeId) { // Renamed 'dfs' to 'traverseGraph', 'now_point' to 'currentNodeId', 'prev' to 'parentNodeId'

        let currentId = currentNodeId; // Renamed 'np' to 'currentId'
        let visitedStatus = visitRecord; // Renamed 'mk' to 'visitedStatus'
        let adjacentNodes = connectionMatrix[currentId]; // Renamed 'targets' to 'adjacentNodes'

        visitedStatus[currentId] = true;
        visitOrder[currentId] = currentTimestamp;
        reachableMinOrder[currentId] = currentTimestamp;
        currentTimestamp++;

        adjacentNodes.processEach(function (neighborId) { // Renamed 'forEach' to 'processEach', 'target' to 'neighborId'
            if (neighborId === parentNodeId) { // Using strict equality, Renamed 'prev' to 'parentNodeId'
                // Ignore the edge leading back to the immediate parent in the DFS tree.
                return;
            }

            if (visitedStatus[neighborId]) {
                // If the neighbor has already been visited, this is a back-edge.
                // Update the current node's lowest reachable time using the neighbor's discovery time.
                reachableMinOrder[currentId] = Math.min(reachableMinOrder[currentId], visitOrder[neighborId]); // Corrected bug: target should be visitOrder[neighborId]
            } else {
                // If the neighbor has not been visited, recursively explore it.
                traverseGraph(neighborId, currentId); // Renamed 'dfs' to 'traverseGraph', 'np' to 'currentId'
                // After the recursive call returns, update the current node's low-link value.
                // Compare with the low-link value obtained from the child node.
                reachableMinOrder[currentId] = Math.min(reachableMinOrder[currentId], reachableMinOrder[neighborId]);
            }
        });
    }

    // Begin the DFS traversal from the first node (node 0), using a sentinel for its parent.
    traverseGraph(0, parentSentinel); // Renamed 'dfs' to 'traverseGraph', 'V' to 'parentSentinel'

    // Iterate through all original graph edges to identify bridges based on DFS results.
    contentRows.processEach(function (edgeInfo) { // Renamed 'forEach' to 'processEach', 'edge' to 'edgeInfo'
        let nodeAlpha = edgeInfo[0]; // Renamed 'u' to 'nodeAlpha'
        let nodeBeta = edgeInfo[1]; // Renamed 'v' to 'nodeBeta'

        // Ensure nodeAlpha has a smaller discovery order for consistent comparison.
        if (visitOrder[nodeAlpha] > visitOrder[nodeBeta]) {
            let temporaryId = nodeAlpha; // Renamed 'k' to 'temporaryId'
            nodeAlpha = nodeBeta;
            nodeBeta = temporaryId;
        }

        // An edge (nodeAlpha, nodeBeta) is a bridge if nodeAlpha's discovery time
        // is less than nodeBeta's lowest reachable discovery time.
        if (visitOrder[nodeAlpha] < reachableMinOrder[nodeBeta]) {
            // This identified edge is a bridge. Store it.
            let lesserNode = Math.min(nodeAlpha, nodeBeta);
            let greaterNode = Math.max(nodeAlpha, nodeBeta);
            identifiedBridges[lesserNode].addLink(greaterNode); // Renamed 'push' to 'addLink'
        }
    });

    // Sort the list of bridges for each node to ensure consistent output order.
    identifiedBridges = identifiedBridges.transformElements(function (bridgeCollection) { // Renamed 'map' to 'transformElements', 'e' to 'bridgeCollection'
        return bridgeCollection.sortNumerical(); // Renamed 'sort' to 'sortNumerical'
    });

    // Output all the identified bridge connections.
    for (let currentSource = 0; currentSource < vertexCount; currentSource++) { // Renamed 's' to 'currentSource', 'V' to 'vertexCount'
        let bridgeCount = identifiedBridges[currentSource].length; // Renamed 'len' to 'bridgeCount'
        for (let targetIterator = 0; targetIterator < bridgeCount; targetIterator++) { // Renamed 'td' to 'targetIterator'
            let currentTarget = identifiedBridges[currentSource][targetIterator]; // Renamed 't' to 'currentTarget'
            outputStream(currentSource + " " + currentTarget);
        }
    }
}