"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
function solveProblem(rawData) {
    var _a = processInputData(rawData), nodeCount = _a.nodeCount, edgeCount = _a.edgeCount, permutationArray = _a.permutationArray, edgeList = _a.edgeList;
    var disjointSetManager = UnionFindStructure.createFromEdges(nodeCount, edgeList);
    var matchingElements = permutationArray.filter(function (currentValue, currentIndex) {
        var elementIndex = currentIndex + 1;
        return disjointSetManager.checkSameSet(currentValue, elementIndex);
    });
    var finalCount = matchingElements.length;
    return finalCount.toString();
}
exports.Equals = solveProblem;
var UnionFindStructure = /** @class */ (function () {
    function UnionFindStructure(setNodes) {
        this.setNodes = setNodes;
    }
    UnionFindStructure.createFromEdges = function (nodeCount, edgeList) {
        var totalNodes = nodeCount + 1;
        var setNodes = Array.from({ length: totalNodes }, function () { return new UnionFindNode(); });
        for (var _i = 0, edgeList_1 = edgeList; _i < edgeList_1.length; _i++) {
            var edge = edgeList_1[_i];
            var firstNode = edge.firstNode, secondNode = edge.secondNode;
            setNodes[firstNode].uniteSets(setNodes[secondNode]);
        }
        return new UnionFindStructure(setNodes);
    };
    UnionFindStructure.prototype.checkSameSet = function (elementA, elementB) {
        return this.setNodes[elementA].isLinkedTo(this.setNodes[elementB]);
    };
    return UnionFindStructure;
}());
var UnionFindNode = /** @class */ (function () {
    function UnionFindNode() {
        this.parentNode = this;
        this.nodeRank = 0;
    }
    UnionFindNode.prototype.isLinkedTo = function (otherNode) {
        return this.findRoot() === otherNode.findRoot();
    };
    UnionFindNode.prototype.uniteSets = function (otherNode) {
        var rootX = this.findRoot();
        var rootY = otherNode.findRoot();
        if (rootX === rootY) {
            return;
        }
        if (rootX.nodeRank < rootY.nodeRank) {
            var tempRoot = rootX;
            rootX = rootY;
            rootY = tempRoot;
        }
        rootY.parentNode = rootX;
        if (rootY.nodeRank === rootX.nodeRank) {
            rootX.nodeRank++;
        }
    };
    UnionFindNode.prototype.findRoot = function () {
        if (this.parentNode !== this) {
            this.parentNode = this.parentNode.findRoot();
        }
        return this.parentNode;
    };
    return UnionFindNode;
}());
function processInputData(rawData) {
    var rawLines = rawData.split("\n");
    var firstLine = rawLines[0], secondLine = rawLines[1], remainingLines = rawLines.slice(2);
    var _a = parseNumericString(firstLine), nodeCount = _a[0], edgeCount = _a[1];
    var permutationArray = parseNumericString(secondLine);
    var edgeList = remainingLines.map(function (inputLine) {
        var _a = parseNumericString(inputLine), firstNode = _a[0], secondNode = _a[1];
        return { firstNode: firstNode, secondNode: secondNode };
    });
    return { nodeCount: nodeCount, edgeCount: edgeCount, permutationArray: permutationArray, edgeList: edgeList };
}
function parseNumericString(inputLine) {
    return inputLine.split(" ").map(Number);
}
function mainExecution(input) {
    console.log(solveProblem(input));
}
try {
    mainExecution(require("fs").readFileSync("/dev/stdin", "utf8"));
}
catch (e) {
}
