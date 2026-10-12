var inputLines = [];
var lineReaderModule = require('readline');

var inputHandler = lineReaderModule.createInterface({
    input: process.stdin,
    output: process.stdout,
});

inputHandler.on('line', function (currentLine) {
    inputLines.push(currentLine);
});

inputHandler.on('close', function () {
    const UNCOVERED_NODE_STATUS = -1;
    const COVERED_NODE_STATUS = 1;

    const parseNumberFromString = (str) => Number(str);

    var firstLineParts = inputLines[0].split(" ");
    var numNodes = parseNumberFromString(firstLineParts[0]);
    var numEdges = parseNumberFromString(firstLineParts[1]);

    inputLines.shift();

    var edgeData = inputLines.map(lineStr => lineStr.split(" ").map(parseNumberFromString));

    var nodeStatus = Array(numNodes).fill(UNCOVERED_NODE_STATUS);
    var resultCount = 0;

    edgeData.sort((edgeA, edgeB) => edgeA[0] - edgeB[0]);

    while (edgeData.length > 0) {
        var currentEdge = edgeData.shift();
        var nodeA_val = currentEdge[0];
        var nodeB_val = currentEdge[1];
        var edgeWeight_val = currentEdge[2]; // This value is not used in the original logic

        var nodeA_idx = nodeA_val - 1;
        var nodeB_idx = nodeB_val - 1;

        var isNodeA_covered = (nodeStatus[nodeA_idx] === COVERED_NODE_STATUS);
        var isNodeB_covered = (nodeStatus[nodeB_idx] === COVERED_NODE_STATUS);

        if (isNodeA_covered && !isNodeB_covered) {
            nodeStatus[nodeB_idx] = COVERED_NODE_STATUS;
        } else if (!isNodeA_covered && isNodeB_covered) {
            nodeStatus[nodeA_idx] = COVERED_NODE_STATUS;
        } else if (!isNodeA_covered && !isNodeB_covered) {
            resultCount++;
            nodeStatus[nodeA_idx] = COVERED_NODE_STATUS;
            nodeStatus[nodeB_idx] = COVERED_NODE_STATUS;
        }
    }

    for (var nodeIndex = 0; nodeIndex < numNodes; nodeIndex++) {
        if (nodeStatus[nodeIndex] === UNCOVERED_NODE_STATUS) {
            resultCount++;
        }
    }

    console.log(resultCount);
});
