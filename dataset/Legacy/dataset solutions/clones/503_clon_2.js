var rawData = require('fs').readFileSync('/dev/stdin', 'utf8');

var lineData = rawData.trim().split("\n");

while (true) {
    var nodeEdgeCounts = lineData.shift().split(" ").map(Number);

    if (nodeEdgeCounts.join(" ") === "0 0") {
        break;
    }

    var numNodes = nodeEdgeCounts[0];
    var numEdges = nodeEdgeCounts[1];

    var stateCount = 2;
    var startNode = 1;
    var destinationNode = numNodes;

    var edgeList = [];
    for (var loopVar = 0; loopVar < numEdges; loopVar++) {
        edgeList.push(lineData.shift().split(" ").map(Number));
    }

    var minCosts = [];
    for (var nodeIdx = 0; nodeIdx <= numNodes; nodeIdx++) {
        minCosts[nodeIdx] = [];
        for (var stateIdx = 0; stateIdx <= stateCount; stateIdx++) {
            minCosts[nodeIdx][stateIdx] = Infinity;
        }
    }

    minCosts[startNode][0] = 0;

    var queueNodes = [startNode];
    var visitedNodes = {};

    while (true) {
        if (queueNodes.length === 0) {
            break;
        }

        var currentNode = queueNodes.shift();

        if (visitedNodes.hasOwnProperty(currentNode)) {
            continue;
        }
        visitedNodes[currentNode] = true;

        edgeList.forEach(function (currentEdge) {
            var nodeA = currentEdge[0];
            var nodeB = currentEdge[1];
            var edgeWeight = currentEdge[2];

            if (nodeA === currentNode) {
                for (var stateIter = 2; stateIter >= 0; stateIter--) {
                    var currentCost = minCosts[nodeA][stateIter];
                    if (stateIter === 0) {
                        minCosts[nodeB][0] = Math.min(minCosts[nodeB][0], currentCost + edgeWeight);
                        minCosts[nodeB][1] = Math.min(minCosts[nodeB][1], currentCost);
                    } else if (stateIter === 1) {
                        minCosts[nodeB][2] = Math.min(minCosts[nodeB][2], currentCost);
                    } else if (stateIter === 2) {
                        minCosts[nodeB][2] = Math.min(minCosts[nodeB][2], currentCost + edgeWeight);
                    }
                }
                queueNodes.push(nodeB);
            } else if (nodeB === currentNode) {
                for (var stateIter = 2; stateIter >= 0; stateIter--) {
                    var currentCost = minCosts[nodeB][stateIter];
                    if (stateIter === 0) {
                        minCosts[nodeA][0] = Math.min(minCosts[nodeA][0], currentCost + edgeWeight);
                        minCosts[nodeA][1] = Math.min(minCosts[nodeA][1], currentCost);
                    } else if (stateIter === 1) {
                        minCosts[nodeA][2] = Math.min(minCosts[nodeA][2], currentCost);
                    } else if (stateIter === 2) {
                        minCosts[nodeA][2] = Math.min(minCosts[nodeA][2], currentCost + edgeWeight);
                    }
                }
                queueNodes.push(nodeA);
            }
        });
    }

    var finalAnswer = Infinity;
    minCosts[destinationNode].forEach(function (finalCost, stateIndex) {
        if (stateIndex !== 1) {
            finalAnswer = Math.min(finalAnswer, finalCost);
        }
    });

    console.log(finalAnswer);
}
