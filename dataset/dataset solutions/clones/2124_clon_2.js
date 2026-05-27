// This script processes graph-related data to determine connection counts.
function ProcessInput(rawData) {
    // Parse initial parameters from the first line of input
    var nodeCount = rawData[0].split(' ')[0] - 0; // Total number of nodes
    var edgeCount = rawData[0].split(' ')[1] - 0; // Number of direct friendship edges
    var blockCount = rawData[0].split(' ')[2] - 0; // Number of blocked connection pairs

    // Initialize a Disjoint Set Union (DSU) structure for tracking connected components
    var disjointSet = new DisjointSet(nodeCount);
    // A map to store direct and blocked connections between nodes
    var connectionMap = {};

    // Process friendship edges
    for (var idx = 0; idx < edgeCount; idx++) {
        var nodeA = rawData[idx + 1].split(' ')[0] - 1; // Adjust to 0-indexed
        var nodeB = rawData[idx + 1].split(' ')[1] - 1; // Adjust to 0-indexed

        // Union the sets of connected nodes
        disjointSet.unite(nodeA, nodeB);

        // Mark these nodes as directly connected (or blocked) in the map
        if (!connectionMap[nodeA]) connectionMap[nodeA] = {};
        if (!connectionMap[nodeB]) connectionMap[nodeB] = {};
        connectionMap[nodeA][nodeB] = false; // 'false' indicates a direct connection or block
        connectionMap[nodeB][nodeA] = false;
    }

    // Process blocked connection pairs
    for (var idx = 0; idx < blockCount; idx++) {
        var nodeA = rawData[idx + edgeCount + 1].split(' ')[0] - 1; // Adjust to 0-indexed
        var nodeB = rawData[idx + edgeCount + 1].split(' ')[1] - 1; // Adjust to 0-indexed

        // Ensure map entries exist for these nodes
        if (!connectionMap[nodeA]) connectionMap[nodeA] = {};
        if (!connectionMap[nodeB]) connectionMap[nodeB] = {};
        connectionMap[nodeA][nodeB] = false; // Mark as blocked
        connectionMap[nodeB][nodeA] = false;
    }

    // Maps to store component information
    var componentMembers = {}; // Maps root node to an object of its members
    var nodeComponentMap = {}; // Maps each node to its component's member object

    // Populate component maps and mark self-connections as blocked
    for (var idx = 0; idx < nodeCount; idx++) {
        var rootNode = disjointSet.findRoot(idx); // Find the representative of the current node's set
        if (!componentMembers[rootNode]) componentMembers[rootNode] = {};
        componentMembers[rootNode][idx] = true; // Add current node to its component's member list
        nodeComponentMap[idx] = componentMembers[rootNode]; // Reference the component's member object

        // Mark self-connection as blocked (a node cannot be friends with itself in this context)
        if (!connectionMap[idx]) connectionMap[idx] = {};
        connectionMap[idx][idx] = false;
    }

    // Calculate the number of potential friends for each node
    var resultArray = [];
    for (var idx = 0; idx < nodeCount; idx++) {
        resultArray[idx] = 0; // Initialize count for current node

        // Iterate through all members of the current node's connected component
        if (nodeComponentMap[idx]) {
            Object.keys(nodeComponentMap[idx]).forEach(memberNode => {
                // If there's no direct connection or block between current node and memberNode
                if (connectionMap[idx][memberNode] !== false) {
                    resultArray[idx]++; // Increment potential friend count
                }
            });
        }
    }
    // Output the results, space-separated
    console.log(resultArray.join(' '));
}

// Disjoint Set Union (DSU) data structure implementation
function DisjointSet(initialSize) {
    this.parentArray = new Array(initialSize); // Stores parent of each element
    this.rankArray = new Array(initialSize);   // Stores rank (height) of each tree

    // Initialize each element as its own parent with rank 0
    for (var idx = 0; idx < initialSize; ++idx) {
        this.parentArray[idx] = idx;
        this.rankArray[idx] = 0;
    }
}

var dsPrototype = DisjointSet.prototype;

// Define a getter for the size of the DisjointSet
Object.defineProperty(dsPrototype, 'size', {
    'get': function() {
        return this.parentArray.length;
    }
});

// Adds a new, isolated element to the DisjointSet
dsPrototype.addElement = function() {
    var newElementIndex = this.parentArray.length;
    this.parentArray.push(newElementIndex);
    this.rankArray.push(0);
    return newElementIndex;
};

// Finds the representative (root) of the set containing 'element'
// Performs path compression during traversal
dsPrototype.findRoot = function(element) {
    var originalElement = element;
    var parents = this.parentArray;
    // Traverse up to find the actual root
    while (parents[element] !== element) {
        element = parents[element];
    }
    // Path compression: make all nodes on the path point directly to the root
    while (parents[originalElement] !== element) {
        var tempParent = parents[originalElement];
        parents[originalElement] = element;
        originalElement = tempParent;
    }
    return element;
};

// Unites the sets containing elements 'x' and 'y'
// Uses union by rank heuristic
dsPrototype.unite = function(x, y) {
    var rootX = this.findRoot(x);
    var rootY = this.findRoot(y);

    // If they are already in the same set, do nothing
    if (rootX === rootY) {
        return;
    }

    var ranks = this.rankArray;
    var parents = this.parentArray;
    var rankX = ranks[rootX];
    var rankY = ranks[rootY];

    // Attach the smaller rank tree under the root of the larger rank tree
    if (rankX < rankY) {
        parents[rootX] = rootY;
    } else if (rankY < rankX) {
        parents[rootY] = rootX;
    } else {
        // If ranks are equal, pick one as root and increment its rank
        parents[rootY] = rootX;
        ++ranks[rootX];
    }
};

// Read input from stdin, process it, and call the main function
ProcessInput(require('fs').readFileSync('/dev/stdin', 'utf8').trim().split('\n'));
