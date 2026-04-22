const parseLineOfIntegers = (lineString) => lineString.split(" ").map(Number);

/**
 * Processes graph connectivity data from input to determine potential friendships.
 * This function takes raw problem data (lines of text) and computes for each node
 * how many other nodes are in its connected component but are not directly linked
 * or explicitly blocked.
 * @param {string[]} problemData - An array of strings, where each string represents a line of input.
 */
function analyzeGraphConnections(problemData) {
    // The very first line of the input contains three crucial parameters:
    // 1. The total number of nodes in the graph.
    // 2. The count of direct connection links.
    // 3. The count of explicitly blocked pairs.
    const [totalNodes, numDirectLinks, numBlockedPairs] = parseLineOfIntegers(problemData[0]);

    // Implement a basic guard clause for invalid or empty graph sizes.
    if (totalNodes <= 0) {
        console.log(""); // Output an empty line or handle as an error.
        return;
    }

    // Initialize a DisjointSet data structure. This will efficiently track
    // which nodes belong to the same connected components.
    const connectivityTracker = new DisjointSet(totalNodes);

    // This data structure will store all relationships that are considered "restricted"
    // for the purpose of potential friendship. A relationship is restricted if:
    // a) The two nodes are directly connected.
    // b) The two nodes are explicitly blocked.
    // c) A node is trying to befriend itself (a node cannot be its own friend).
    // It's a Map where keys are node IDs, and values are Sets of node IDs that are restricted.
    const restrictedRelationships = new Map();
    for (let i = 0; i < totalNodes; i++) {
        restrictedRelationships.set(i, new Set());
        // A node cannot form a friendship with itself. Mark this as restricted upfront.
        restrictedRelationships.get(i).add(i);
    }

    // --- PHASE 1: Process direct connection links ---
    // These links not only define connected components but also represent restricted friendships.
    for (let i = 0; i < numDirectLinks; i++) {
        // Parse the node IDs for the current direct link. Adjust to 0-indexed.
        const [nodeX, nodeY] = parseLineOfIntegers(problemData[i + 1]).map(val => val - 1);

        // Merge the components of nodeX and nodeY within the DisjointSet structure.
        connectivityTracker.uniteComponents(nodeX, nodeY);

        // Mark this pair as having a restricted relationship.
        restrictedRelationships.get(nodeX).add(nodeY);
        restrictedRelationships.get(nodeY).add(nodeX);
    }

    // --- PHASE 2: Process explicitly blocked pairs ---
    // These pairs are forbidden friendships, but they do not affect connected components.
    for (let i = 0; i < numBlockedPairs; i++) {
        // Parse the node IDs for the current blocked pair. Adjust to 0-indexed.
        const [nodeX, nodeY] = parseLineOfIntegers(problemData[i + numDirectLinks + 1]).map(val => val - 1);

        // Mark this pair as having a restricted relationship.
        restrictedRelationships.get(nodeX).add(nodeY);
        restrictedRelationships.get(nodeY).add(nodeX);
    }

    // --- PHASE 3: Aggregate nodes by their connected components ---

    // This map stores which nodes belong to which component.
    // Key: The representative node ID of a component.
    // Value: A Set of all node IDs that are part of that component.
    const componentMembership = new Map();
    // This map provides a quick lookup for any node to find its component's representative.
    // Key: Node ID.
    // Value: The representative node ID of the component that the key node belongs to.
    const nodeToComponentRep = new Map();

    for (let i = 0; i < totalNodes; i++) {
        const componentRepresentative = connectivityTracker.findSetRepresentative(i);
        // Ensure a Set exists for this component representative.
        if (!componentMembership.has(componentRepresentative)) {
            componentMembership.set(componentRepresentative, new Set());
        }
        // Add the current node to its component's set.
        componentMembership.get(componentRepresentative).add(i);
        // Record the representative for the current node.
        nodeToComponentRep.set(i, componentRepresentative);
    }

    // --- PHASE 4: Calculate the number of potential friendships for each node ---

    // An array to store the final counts of potential friends for each node.
    const friendshipCounts = new Array(totalNodes).fill(0);

    for (let i = 0; i < totalNodes; i++) {
        const currentNodeId = i;
        const currentRepresentative = nodeToComponentRep.get(currentNodeId);
        const nodesInSameComponent = componentMembership.get(currentRepresentative);

        // This is a safety check; `nodesInSameComponent` should always exist for valid `totalNodes`.
        if (!nodesInSameComponent) {
            continue;
        }

        // Retrieve the set of nodes that are restricted for the current node.
        // This Set is guaranteed to exist due to the initialization earlier.
        const currentRestrictedSet = restrictedRelationships.get(currentNodeId);

        let countForCurrentNode = 0;
        // Iterate through all other nodes within the same connected component.
        for (const potentialFriendId of nodesInSameComponent) {
            // Check if the `potentialFriendId` is NOT in the `currentRestrictedSet`.
            // This means it's in the same component AND not directly linked/blocked/self.
            if (!currentRestrictedSet.has(potentialFriendId)) {
                countForCurrentNode++;
            }
        }
        friendshipCounts[currentNodeId] = countForCurrentNode;
    }

    // Output the final counts, space-separated.
    console.log(friendshipCounts.join(" "));
}

/**
 * Implements a Disjoint Set Union (DSU) data structure, optimized with path compression
 * and union by rank, for efficient tracking of connected components in a graph.
 */
function DisjointSet(initialElementCount) {
    // Validate the initial size to prevent errors.
    if (initialElementCount < 0) {
        throw new Error("DisjointSet cannot be initialized with a negative element count.");
    }
    // `parentArray[i]` stores the parent of element `i`. If `parentArray[i] === i`,
    // then `i` is the representative (root) of its set.
    this.parentArray = Array.from({ length: initialElementCount }, (_, i) => i);
    // `rankArray[i]` stores the rank (or approximate height) of the tree rooted at `i`.
    // Used during union operations to keep trees balanced.
    this.rankArray = new Array(initialElementCount).fill(0);
}

// Define methods on the prototype for efficient memory usage and proper object-oriented structure.
const dsMethods = DisjointSet.prototype;

// A getter property to retrieve the total number of elements currently managed by the DisjointSet.
Object.defineProperty(dsMethods, "elementCount", {
    "get": function() {
        return this.parentArray.length;
    }
});

/**
 * Finds the representative (root) of the set containing `elementId`.
 * This method includes path compression for optimized future lookups.
 * @param {number} elementId - The ID of the element whose set representative is to be found.
 * @returns {number} The ID of the representative element for the set.
 * @throws {Error} If the elementId is out of the valid bounds.
 */
dsMethods.findSetRepresentative = function(elementId) {
    // Ensure the provided element ID is within the valid range.
    if (elementId < 0 || elementId >= this.parentArray.length) {
        throw new Error(`Element ID ${elementId} is out of bounds [0, ${this.parentArray.length - 1}] for DisjointSet.`);
    }

    let currentNode = elementId;
    // Traverse up the parent chain until the representative (a node whose parent is itself) is found.
    while (this.parentArray[currentNode] !== currentNode) {
        currentNode = this.parentArray[currentNode];
    }
    const representative = currentNode; // Store the found representative.

    // Path compression phase: Traverse from the original element back to the representative,
    // setting each node's parent directly to the representative.
    let pathWalker = elementId;
    while (this.parentArray[pathWalker] !== representative) {
        let nextNodeOnPath = this.parentArray[pathWalker];
        this.parentArray[pathWalker] = representative; // Compress the path.
        pathWalker = nextNodeOnPath;
    }
    return representative;
};

/**
 * Unites (merges) the sets containing `elementA` and `elementB`.
 * This operation uses the union by rank heuristic to maintain balanced trees.
 * @param {number} elementA - The ID of the first element.
 * @param {number} elementB - The ID of the second element.
 * @throws {Error} If either elementId is out of the valid bounds.
 */
dsMethods.uniteComponents = function(elementA, elementB) {
    // Find the representatives of the sets containing elementA and elementB.
    // Error checks are handled by findSetRepresentative.
    const repA = this.findSetRepresentative(elementA);
    const repB = this.findSetRepresentative(elementB);

    // If both elements already belong to the same set, no action is needed.
    if (repA === repB) {
        return;
    }

    const rankA = this.rankArray[repA];
    const rankB = this.rankArray[repB];

    // Union by rank heuristic: Attach the root of the tree with the smaller rank
    // to the root of the tree with the larger rank. This helps keep tree heights minimal.
    if (rankA < rankB) {
        this.parentArray[repA] = repB;
    } else if (rankB < rankA) {
        this.parentArray[repB] = repA;
    } else {
        // If ranks are equal, either root can become the new parent.
        // The rank of the new parent tree is then incremented.
        this.parentArray[repB] = repA;
        this.rankArray[repA]++;
    }
};

// The main execution block: reads input from standard input, processes it, and prints the result.
analyzeGraphConnections(require("fs").readFileSync("/dev/stdin", "utf8").trim().split("\n"));