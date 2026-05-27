var fileSystem = require('fs');
var allInputLines = fileSystem.readFileSync(0, 'utf8').split('\n');

var linePointer = 0;
function getNextInputLine() {
    return allInputLines[linePointer++];
}

function DisjointSetUnion(nodeCount) {
    var parentArray = new Array(nodeCount);
    var componentSize = new Array(nodeCount);

    for (var i = 0; i < nodeCount; i++) {
        parentArray[i] = i;
        componentSize[i] = 1;
    }

    function findRepresentative(nodeIdentifier) {
        if (parentArray[nodeIdentifier] === nodeIdentifier) {
            return nodeIdentifier;
        }
        return parentArray[nodeIdentifier] = findRepresentative(parentArray[nodeIdentifier]);
    }

    function uniteSets(nodeA, nodeB) {
        var rootA = findRepresentative(nodeA);
        var rootB = findRepresentative(nodeB);

        if (rootA !== rootB) {
            if (componentSize[rootA] < componentSize[rootB]) {
                var temp = rootA;
                rootA = rootB;
                rootB = temp;
            }
            parentArray[rootB] = rootA;
            componentSize[rootA] += componentSize[rootB];
            return true;
        }
        return false;
    }

    function getComponentCount(activeNodesSet) {
        var distinctRoots = new Set();
        activeNodesSet.forEach(function(nodeIdentifier) {
            distinctRoots.add(findRepresentative(nodeIdentifier));
        });
        return distinctRoots.size;
    }

    function checkConnectivity(nodeA, nodeB) {
        return findRepresentative(nodeA) === findRepresentative(nodeB);
    }

    return {
        uniteSets: uniteSets,
        findRepresentative: findRepresentative,
        getComponentCount: getComponentCount,
        checkConnectivity: checkConnectivity
    };
}

function processGraphData() {
    var nodeCount, edgeCount;
    var lineParts, i, k;
    var nodeDayValues, graphEdges;
    var dsuManager;
    var accumulatedWeight;
    var activeNodesSet;

    while (true) {
        lineParts = getNextInputLine().split(' ').map(Number);
        nodeCount = lineParts[0];
        edgeCount = lineParts[1];

        if (nodeCount === 0 && edgeCount === 0) {
            break;
        }

        nodeDayValues = new Array(nodeCount);
        activeNodesSet = new Set();

        for (i = 0; i < nodeCount; i++) {
            nodeDayValues[i] = {
                id: i,
                dayValue: +getNextInputLine()
            };
        }

        graphEdges = new Array(edgeCount);
        for (i = 0; i < edgeCount; i++) {
            lineParts = getNextInputLine().split(' ').map(Number);
            graphEdges[i] = [lineParts[0] - 1, lineParts[1] - 1, lineParts[2]];
        }

        nodeDayValues.sort(function(a, b) {
            return a.dayValue - b.dayValue;
        });

        graphEdges.sort(function(edgeA, edgeB) {
            return edgeA[2] - edgeB[2];
        });

        dsuManager = new DisjointSetUnion(nodeCount);
        accumulatedWeight = 0;

        k = nodeCount - 1;
        while (k >= 0) {
            var currentDayValue = nodeDayValues[k].dayValue;
            var nodesToActivate = [];

            while (k >= 0 && nodeDayValues[k].dayValue === currentDayValue) {
                nodesToActivate.push(nodeDayValues[k].id);
                k--;
            }

            nodesToActivate.forEach(function(nodeId) {
                activeNodesSet.add(nodeId);
            });

            for (var j = 0; j < edgeCount; j++) {
                var currentEdge = graphEdges[j];
                var u = currentEdge[0];
                var v = currentEdge[1];
                var weight = currentEdge[2];

                if (activeNodesSet.has(u) && activeNodesSet.has(v) && !dsuManager.checkConnectivity(u, v)) {
                    dsuManager.uniteSets(u, v);
                    accumulatedWeight += weight;
                }
            }

            if (dsuManager.getComponentCount(activeNodesSet) > 1) {
                accumulatedWeight = 0;
                dsuManager = new DisjointSetUnion(nodeCount);
            }
        }
        console.log(accumulatedWeight);
    }
}

processGraphData();
