"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
// This module contains logic for analyzing connectivity within a graph structure.
// The primary function `ProcessGraphConnectivity` takes a raw string input
// representing graph data and determines a specific count based on permutation and edge information.
function ProcessGraphConnectivity(rawDataString) {
    // Validate input before parsing
    if (!rawDataString || typeof rawDataString !== 'string' || rawDataString.trim().length === 0) {
        console.error("Error: Input data string is invalid or empty.");
        return 0; // Return a default value or throw an error as appropriate
    }

    // Extract problem parameters from the input string.
    // This includes the number of nodes (vertexCount), a permutation array (permArray),
    // and a list of edges (connectionPairs).
    var _a = extractProblemParameters(rawDataString), vertexCount = _a.vertexCount, permArray = _a.permArray, connectionPairs = _a.connectionPairs;

    // Initialize a data structure to manage disjoint sets (connected components)
    // based on the total number of vertices and the provided edges.
    var componentTracker = ComponentTracker.createFromEdges(vertexCount, connectionPairs);

    // Calculate the number of elements in the permutation array (permArray)
    // that are in the same connected component as their corresponding index (plus one).
    // The permutation array uses 0-based indexing for its elements, but the problem
    // often refers to nodes as 1-indexed.
    var matchingComponentCount = permArray.filter(function (elementValue, currentIdx) {
        var nodeIndex = currentIdx + 1; // Convert 0-indexed array position to 1-indexed node identifier
        return componentTracker.shareCommonRoot(elementValue, nodeIndex);
    }).length;

    // Log the final count to the console.
    console.log(matchingComponentCount);

    // Return the calculated count.
    return matchingComponentCount;
}
exports.ProcessGraphConnectivity = ProcessGraphConnectivity;

// The `ComponentTracker` class implements a Disjoint Set Union (DSU) data structure,
// also known as Union-Find, to efficiently manage and query connected components in a graph.
var ComponentTracker = /** @class */ (function () {
    // Constructor initializes the tracker with an array of `UFNode` instances,
    // where each `UFNode` represents a vertex in the graph.
    function ComponentTracker(nodeElements) {
        this.nodeElements = nodeElements;
    }

    // Static factory method to construct a `ComponentTracker` instance.
    // It takes the total number of vertices (N) and a list of edges (edgeList).
    ComponentTracker.createFromEdges = function (N, edgeList) {
        // Initialize an array of `UFNode` objects. Each node initially represents its own set.
        // Array size is N+1 to accommodate 1-based indexing for nodes from 1 to N.
        var nodeElements = Array.from({ length: N + 1 }, function () { return new UFNode(); });

        // Iterate through each edge pair and perform a union operation.
        // This connects the two specified nodes into the same set.
        edgeList.forEach(function (currentEdge) {
            var nodeA = currentEdge.first;
            var nodeB = currentEdge.second;
            // Ensure nodes are valid before attempting union
            if (nodeA > 0 && nodeA <= N && nodeB > 0 && nodeB <= N) {
                nodeElements[nodeA].uniteWith(nodeElements[nodeB]);
            } else {
                // Optionally log an error for invalid edge
                console.warn("Skipping invalid edge: (".concat(nodeA, ", ").concat(nodeB, ") for N=").concat(N));
            }
        });
        return new ComponentTracker(nodeElements);
    };

    // Checks if two given node identifiers belong to the same connected component.
    // Node identifiers (firstVal, secondVal) are assumed to be 1-indexed.
    ComponentTracker.prototype.shareCommonRoot = function (firstVal, secondVal) {
        // Retrieve the `UFNode` objects corresponding to the input values.
        var node1 = this.nodeElements[firstVal];
        var node2 = this.nodeElements[secondVal];

        // Ensure both nodes exist before comparison.
        if (!node1 || !node2) {
            console.error("Attempted to check non-existent node: ".concat(firstVal, " or ").concat(secondVal));
            return false;
        }
        return node1.checkEquivalence(node2);
    };
    return ComponentTracker;
}());

// The `UFNode` class represents a single element within the Disjoint Set Union structure.
// Each node has a `representative` (its parent in the tree) and a `depthRank` (for union by rank optimization).
var UFNode = /** @class */ (function () {
    // Initializes a new node. Initially, each node is its own representative
    // and has a rank of 0.
    function UFNode() {
        this.representative = this; // Pointer to the parent (or itself if root)
        this.depthRank = 0;        // Rank for union-by-rank heuristic
    }

    // Determines if this node and another node belong to the same set (component).
    UFNode.prototype.checkEquivalence = function (otherNode) {
        if (!otherNode) {
            return false; // Cannot compare with a null or undefined node
        }
        return this.findRoot() === otherNode.findRoot();
    };

    // Performs the union operation between the set containing this node
    // and the set containing 'otherNode'. Uses union-by-rank heuristic.
    UFNode.prototype.uniteWith = function (otherNode) {
        if (!otherNode) {
            return; // Cannot unite with a null or undefined node
        }

        var rootA = this.findRoot();
        var rootB = otherNode.findRoot();

        // If both nodes are already in the same set, do nothing.
        if (rootA === rootB) {
            return;
        }

        // Apply union by rank: attach the smaller rank tree under the root of the larger rank tree.
        // If ranks are equal, pick one as the new root and increment its rank.
        if (rootA.depthRank < rootB.depthRank) {
            // Swap roots to ensure rootA always has rank >= rootB
            var tempRoot = rootA;
            rootA = rootB;
            rootB = tempRoot;
        }

        rootB.representative = rootA; // Make rootA the parent of rootB
        if (rootA.depthRank === rootB.depthRank) {
            rootA.depthRank++; // Increment rank only if ranks were equal before union
        }
    };

    // Finds the representative (root) of the set to which this node belongs.
    // Implements path compression optimization during traversal.
    UFNode.prototype.findRoot = function () {
        var current = this;
        // Traverse up the tree until the root (a node whose representative is itself) is found.
        while (current.representative !== current) {
            // Path compression: set current's representative to its grandparent (or higher),
            // effectively flattening the tree.
            current.representative = current.representative.representative; // Direct to grandparent
            current = current.representative; // Move to the new representative
        }
        return current; // Return the root node
    };
    return UFNode;
}());

// Parses the raw input string to extract graph parameters.
// The input is expected to be multi-line, with specific data on each line.
function extractProblemParameters(dataString) {
    var _b = dataString.split("\n"), firstLine = _b[0], secondLine = _b[1], remainingLines = _b.slice(2);

    // Parse the first line for N (vertexCount) and M (edgeCount).
    var _c = tokenizeAndConvertNumbers(firstLine), vertexCount = _c[0], edgeCount = _c[1];

    // Parse the second line for the permutation array.
    var permutationArray = tokenizeAndConvertNumbers(secondLine);

    // Parse subsequent lines to construct the list of edges.
    // Each line represents an edge (x, y).
    var edgeList = remainingLines.map(function (lineContent) {
        var _a = tokenizeAndConvertNumbers(lineContent), x = _a[0], y = _a[1];
        return { first: x, second: y };
    });

    // Return an object containing all extracted parameters.
    return { vertexCount: vertexCount, edgeCount: edgeCount, permutationArray: permutationArray, edgeList: edgeList };
}

// Helper function to parse a space-separated string of numbers into an array of integers.
function tokenizeAndConvertNumbers(textSegment) {
    // Basic validation for the text segment
    if (!textSegment || typeof textSegment !== 'string' || textSegment.trim().length === 0) {
        return [];
    }
    return textSegment.split(" ").map(function(s) {
        var num = Number(s);
        // Filter out NaN results from non-numeric strings
        return isNaN(num) ? null : num;
    }).filter(function(n) { return n !== null; }); // Remove nulls
}

// Don't edit this line!
try {
    ProcessGraphConnectivity(require("fs").readFileSync("/dev/stdin", "utf8"));
}
catch (e) {
    // ignore
}
//# sourceMappingURL=Equals.js.map