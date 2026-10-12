// This script processes input data to determine connectivity.
function ProcessInput(rawData) {
    // Parse initial parameters from the first line of input.
    // nodeCount: total number of nodes
    // edgeCount: number of direct friendship connections
    // blockCount: number of blocked connections
    const nodeCount = rawData[0].split(" ")[0] | 0; // Using bitwise OR for number conversion
    const edgeCount = rawData[0].split(" ")[1] | 0;
    const blockCount = rawData[0].split(" ")[2] | 0;
    
    // Initialize a Disjoint Set Union (DSU) structure for tracking connected components.
    const disjointSet = new DisjointSet(nodeCount);
    // A map to store connection statuses between nodes.
    // `false` indicates a direct connection or a blocked connection.
    const connectionStatus = {};

    // Process friendship connections (edgeCount lines).
    for (let idx = 0; idx < edgeCount; ++idx) {
        const nodeA = (rawData[idx + 1].split(" ")[0] | 0) - 1; // Adjust to 0-indexed
        const nodeB = (rawData[idx + 1].split(" ")[1] | 0) - 1; // Adjust to 0-indexed
        
        // Union the two nodes in the DSU, as they are friends.
        disjointSet.unite(nodeA, nodeB);
        
        // Mark these nodes as directly connected in the connectionStatus map.
        if (!connectionStatus[nodeA]) connectionStatus[nodeA] = {};
        if (!connectionStatus[nodeB]) connectionStatus[nodeB] = {};
        connectionStatus[nodeA][nodeB] = !0; // Using !0 for false
        connectionStatus[nodeB][nodeA] = !0; // Using !0 for false
    }

    // Process blocked connections (blockCount lines).
    for (let idx = 0; idx < blockCount; ++idx) {
        const nodeA = (rawData[idx + edgeCount + 1].split(" ")[0] | 0) - 1; // Adjust to 0-indexed
        const nodeB = (rawData[idx + edgeCount + 1].split(" ")[1] | 0) - 1; // Adjust to 0-indexed
        
        // Mark these nodes as blocked in the connectionStatus map.
        // They are not friends, and cannot be considered for friendship.
        if (!connectionStatus[nodeA]) connectionStatus[nodeA] = {};
        if (!connectionStatus[nodeB]) connectionStatus[nodeB] = {};
        connectionStatus[nodeA][nodeB] = !0; // Using !0 for false
        connectionStatus[nodeB][nodeA] = !0; // Using !0 for false
    }

    // Maps to store connected components and their members.
    const componentNodes = {}; // Maps root node to an object of its component members
    const nodeComponentMap = {}; // Maps each node to its component's member object

    // Populate component maps and mark self-connections as false.
    for (let idx = 0; idx < nodeCount; ++idx) {
        const rootNode = disjointSet.findRoot(idx);
        if (!componentNodes[rootNode]) componentNodes[rootNode] = {};
        componentNodes[rootNode][idx] = !1; // Using !1 for true
        nodeComponentMap[idx] = componentNodes[rootNode];
        
        // A node is always "connected" to itself, but we mark it as false
        // in connectionStatus to exclude it from potential friend counts later.
        if (!connectionStatus[idx]) connectionStatus[idx] = {};
        connectionStatus[idx][idx] = !0; // Using !0 for false
    }
    
    // Calculate the number of potential friends for each node.
    const resultArray = [];
    for (let idx = 0; idx < nodeCount; ++idx) {
        resultArray[idx] = 0; // Initialize count for current node
        
        // Create a temporary object combining component members and existing connections.
        // Start with all nodes in the same component as potential friends.
        const tempConnections = Object.assign({}, nodeComponentMap[idx]);
        // Overlay existing connections/blocks. If a node is in connectionStatus[idx],
        // it means it's either a direct friend or blocked, so it's not a *new* potential friend.
        Object.assign(tempConnections, connectionStatus[idx]);
        
        // Count how many nodes are still marked as true (i.e., in the same component
        // but not directly connected or blocked).
        resultArray[idx] = Object.keys(tempConnections).filter(nodeIdentifier => tempConnections[nodeIdentifier]).length;
    }
    
    // Output the results, space-separated.
    console.log(resultArray.join(" "));
}

// DisjointSet class for managing sets of elements.
function DisjointSet(initialSize) {
  this.parentArray = new Array(initialSize); // Stores parent of each element
  this.rankArray = new Array(initialSize);   // Stores rank (height) of trees
  
  // Initialize each element as its own parent with rank 0.
  for (let jdx = 0; jdx < initialSize; ++jdx) {
    this.parentArray[jdx] = jdx;
    this.rankArray[jdx] = 0;
  }
}

// Get the prototype object for DisjointSet.
const dsPrototype = DisjointSet.prototype;

// Define a getter for the 'size' property, returning the number of elements.
Object.defineProperty(dsPrototype, "size", {
  "get": function() {
    return this.parentArray.length;
  }
});

// Adds a new, isolated node to the DisjointSet.
dsPrototype.addNode = function() {
  const newNodeIndex = this.parentArray.length;
  this.parentArray.push(newNodeIndex);
  this.rankArray.push(0);
  return newNodeIndex;
};

// Finds the root (representative) of the set containing 'element'
// using path compression.
dsPrototype.findRoot = function(element) {
  let originalElement = element;
  const parentArray = this.parentArray;
  
  // Traverse up to find the root.
  while (parentArray[element] !== element) {
    element = parentArray[element];
  }
  
  // Path compression: make all nodes on the path point directly to the root.
  while (parentArray[originalElement] !== element) {
    const tempParent = parentArray[originalElement];
    parentArray[originalElement] = element;
    originalElement = tempParent;
  }
  return element;
};

// Unites the sets containing 'elem1' and 'elem2' using union by rank.
dsPrototype.unite = function(elem1, elem2) {
  let root1 = this.findRoot(elem1);
  let root2 = this.findRoot(elem2);
  
  // If they are already in the same set, do nothing.
  if (root1 === root2) {
    return;
  }
  
  const rankArray = this.rankArray;
  const parentArray = this.parentArray;
  const rank1 = rankArray[root1];
  const rank2 = rankArray[root2];
  
  // Attach the smaller rank tree under the root of the larger rank tree.
  if (rank1 < rank2) {
    parentArray[root1] = root2;
  } else if (rank2 < rank1) {
    parentArray[root2] = root1;
  } else {
    // If ranks are equal, attach one to the other and increment the rank of the new root.
    parentArray[root2] = root1;
    ++rankArray[root1];
  }
};

// Read input from stdin, process it, and execute the main logic.
ProcessInput(require("fs").readFileSync("/dev/stdin", "utf8").trim().split('\n'));
