// This function receives all necessary input as an array of strings.
function ProcessFriendshipData(rawData) {
    // Parse the initial line to get quantities: total entities, initial connections, blocked relationships.
    const [totalEntities, initialConnections, blockedRelationships] = rawData[0].split(" ").map(Number);
    
    // Initialize a Disjoint Set structure for managing connectivity.
    const setManager = new DisjointSetStructure(totalEntities);
    // A map to track excluded or existing connections between entities.
    const exclusionGraph = {};

    // Process initial connection data.
    // Each line i+1 represents a connection between two entities.
    for (let currentIdx = 0; currentIdx < initialConnections; currentIdx++) {
        const [entityA, entityB] = rawData[currentIdx + 1].split(" ").map(val => Number(val) - 1);
        
        // Link these entities in the Disjoint Set.
        setManager.unite(entityA, entityB);
        
        // Mark these entities as connected (or excluded from potential 'friend' count) in the graph.
        if (!exclusionGraph[entityA]) exclusionGraph[entityA] = {};
        if (!exclusionGraph[entityB]) exclusionGraph[entityB] = {};
        exclusionGraph[entityA][entityB] = false;
        exclusionGraph[entityB][entityA] = false;
    }

    // Process blocked relationship data.
    // Each line i+initialConnections+1 represents a blocked relationship.
    for (let currentIdx = 0; currentIdx < blockedRelationships; currentIdx++) {
        const [entityA, entityB] = rawData[currentIdx + initialConnections + 1].split(" ").map(val => Number(val) - 1);
        
        // Mark these entities as blocked in the graph.
        if (!exclusionGraph[entityA]) exclusionGraph[entityA] = {};
        if (!exclusionGraph[entityB]) exclusionGraph[entityB] = {};
        exclusionGraph[entityA][entityB] = false;
        exclusionGraph[entityB][entityA] = false;
    }

    // Maps to store component members and which component an entity belongs to.
    const componentGrouping = {}; // Maps root -> {member1: true, member2: true, ...}
    const entityToGroup = {};     // Maps entity -> {member1: true, member2: true, ...}

    // Populate component maps for all entities.
    for (let currentIdx = 0; currentIdx < totalEntities; currentIdx++) {
        const groupRepresentative = setManager.findSet(currentIdx);
        
        if (!componentGrouping[groupRepresentative]) {
            componentGrouping[groupRepresentative] = {};
        }
        componentGrouping[groupRepresentative][currentIdx] = true;
        entityToGroup[currentIdx] = componentGrouping[groupRepresentative];
        
        // Mark each entity as "excluded" from itself in the graph.
        if (!exclusionGraph[currentIdx]) exclusionGraph[currentIdx] = {};
        exclusionGraph[currentIdx][currentIdx] = false;
    }
    
    // Calculate the number of potential friends for each entity.
    const friendCounts = new Array(totalEntities);
    for (let currentIdx = 0; currentIdx < totalEntities; currentIdx++) {
        friendCounts[currentIdx] = 0;
        // If the entity belongs to a component, iterate its members.
        if (entityToGroup[currentIdx]) {
            Object.keys(entityToGroup[currentIdx]).forEach(groupMember => {
                // If the connection is NOT explicitly marked as false (i.e., not excluded/blocked/self),
                // then it's a potential friend.
                if (exclusionGraph[currentIdx][groupMember] !== false) {
                    friendCounts[currentIdx]++;
                }
            });
        }
    }
    
    // Output the results, joined by spaces.
    console.log(friendCounts.join(" "));
}

// Constructor for the DisjointSetStructure.
function DisjointSetStructure(initialSize) {
    this.parentArray = new Array(initialSize);
    this.rankArray = new Array(initialSize);
    
    // Initialize each element as its own parent with a rank of 0.
    for (let index = 0; index < initialSize; ++index) {
        this.parentArray[index] = index;
        this.rankArray[index] = 0;
    }
}

const dsProto = DisjointSetStructure.prototype;

// Define a getter for the current number of elements in the structure.
Object.defineProperty(dsProto, "setQuantity", {
    "get": function() {
        return this.parentArray.length;
    }
});

// Adds a new, isolated element to the set.
dsProto.addNewElement = function() {
    const newElementIndex = this.parentArray.length;
    this.parentArray.push(newElementIndex);
    this.rankArray.push(0);
    return newElementIndex;
};

// Finds the representative (root) of the set containing 'targetElement'.
// Performs path compression during traversal for efficiency.
dsProto.findSet = function(targetElement) {
    let originalElement = targetElement;
    const parentReferences = this.parentArray;

    // Traverse up the tree to find the root.
    while (parentReferences[targetElement] !== targetElement) {
        targetElement = parentReferences[targetElement];
    }

    // Path compression: make all nodes on the path point directly to the root.
    while (parentReferences[originalElement] !== targetElement) {
        const intermediateParent = parentReferences[originalElement];
        parentReferences[originalElement] = targetElement;
        originalElement = intermediateParent;
    }
    return targetElement;
};

// Unites the sets containing node1 and node2.
// Uses union by rank heuristic to keep the tree flat.
dsProto.unite = function(node1, node2) {
    const root1 = this.findSet(node1);
    const root2 = this.findSet(node2);

    // If they are already in the same set, do nothing.
    if (root1 === root2) {
        return;
    }

    const rankData = this.rankArray;
    const parentData = this.parentArray;
    const rank1 = rankData[root1];
    const rank2 = rankData[root2];

    // Attach the smaller rank tree under the root of the larger rank tree.
    if (rank1 < rank2) {
        parentData[root1] = root2;
    } else if (rank2 < rank1) {
        parentData[root2] = root1;
    } else {
        // If ranks are equal, attach one to the other and increment the rank of the new root.
        parentData[root2] = root1;
        ++rankData[root1];
    }
};


ProcessFriendshipData(require("fs").readFileSync("/dev/stdin", "utf8").trim().split("\n"));