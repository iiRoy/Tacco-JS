// This function orchestrates the analysis of social network connections based on input data.
function analyzeSocialNetwork(rawDataLines) {
    // Validate input data presence.
    if (!rawDataLines || rawDataLines.length === 0) {
        console.error("Error: No input data provided.");
        return;
    }

    // Deconstruct the input array into parameter line and subsequent connection lines.
    const [networkParamsLine, ...connectionDataLines] = rawDataLines;

    // Parse the initial network parameters.
    const [numEntities, numDirectLinks, numRestrictedPairs] = networkParamsLine.split(" ").map(value => parseInt(value, 10));

    // Early exit if no entities are present.
    if (numEntities <= 0) {
        console.log(""); // No entities, no potential friends.
        return;
    }

    // Initialize a Disjoint Set Union (DSU) structure to manage connectivity.
    const connectivityManager = new DisjointSet(numEntities);

    // A map to store pairs of entities that cannot be potential friends (direct links or blocked).
    // Key: entity index, Value: a Set of entity indices that are forbidden connections for the key.
    const forbiddenConnectionsRegistry = new Map();

    // Helper function to parse a connection line and adjust indices to be 0-based.
    const extractConnectionNodes = (line) => {
        const [node1Str, node2Str] = line.split(" ");
        return [parseInt(node1Str, 10) - 1, parseInt(node2Str, 10) - 1];
    };

    // Process all direct friendship links.
    // These links establish connectivity and also mark pairs as non-potential friends.
    for (let i = 0; i < numDirectLinks; i++) {
        const [personA, personB] = extractConnectionNodes(connectionDataLines[i]);
        
        // Unite the sets of connected individuals.
        connectivityManager.uniteSets(personA, personB);

        // Register these individuals as forbidden potential friends for each other.
        if (!forbiddenConnectionsRegistry.has(personA)) {
            forbiddenConnectionsRegistry.set(personA, new Set());
        }
        forbiddenConnectionsRegistry.get(personA).add(personB);

        if (!forbiddenConnectionsRegistry.has(personB)) {
            forbiddenConnectionsRegistry.set(personB, new Set());
        }
        forbiddenConnectionsRegistry.get(personB).add(personA);
    }

    // Process all explicitly restricted (blocked) pairs.
    // These pairs are also marked as non-potential friends.
    for (let i = 0; i < numRestrictedPairs; i++) {
        const [personX, personY] = extractConnectionNodes(connectionDataLines[numDirectLinks + i]);

        // Register these individuals as forbidden potential friends for each other.
        if (!forbiddenConnectionsRegistry.has(personX)) {
            forbiddenConnectionsRegistry.set(personX, new Set());
        }
        forbiddenConnectionsRegistry.get(personX).add(personY);

        if (!forbiddenConnectionsRegistry.has(personY)) {
            forbiddenConnectionsRegistry.set(personY, new Set());
        }
        forbiddenConnectionsRegistry.get(personY).add(personX);
    }

    // Maps to store component information.
    // `representativeToComponentMembers`: Key: component representative, Value: Set of all members in that component.
    // `entityToComponentSet`: Key: entity index, Value: the Set of members of its component.
    const representativeToComponentMembers = new Map();
    const entityToComponentSet = new Map();

    // Populate the component maps by iterating through all entities.
    for (let currentEntityIndex = 0; currentEntityIndex < numEntities; currentEntityIndex++) {
        const componentRepresentative = connectivityManager.findRepresentative(currentEntityIndex);

        // Initialize component set if not already present.
        if (!representativeToComponentMembers.has(componentRepresentative)) {
            representativeToComponentMembers.set(componentRepresentative, new Set());
        }
        // Add the current entity to its component's member set.
        representativeToComponentMembers.get(componentRepresentative).add(currentEntityIndex);
        // Link the entity directly to its component's member set for efficient lookup.
        entityToComponentSet.set(currentEntityIndex, representativeToComponentMembers.get(componentRepresentative));
    }

    // Initialize an array to store the final count of potential friends for each entity.
    const potentialFriendshipCounts = new Array(numEntities).fill(0);

    // Calculate potential friends for each entity.
    for (let entityIdx = 0; entityIdx < numEntities; entityIdx++) {
        const currentEntityComponent = entityToComponentSet.get(entityIdx);
        // Retrieve the set of forbidden connections for the current entity, or an empty set if none.
        const currentEntityForbiddenSet = forbiddenConnectionsRegistry.get(entityIdx) || new Set();

        let countForCurrentEntity = 0;
        // Iterate through all members within the current entity's connected component.
        for (const potentialCandidate of currentEntityComponent) {
            // An entity cannot be a potential friend to itself.
            if (potentialCandidate === entityIdx) {
                continue;
            }
            // If the candidate is not in the forbidden set for the current entity, it's a potential friend.
            if (!currentEntityForbiddenSet.has(potentialCandidate)) {
                countForCurrentEntity++;
            }
        }
        potentialFriendshipCounts[entityIdx] = countForCurrentEntity;
    }

    // Output the results.
    console.log(potentialFriendshipCounts.join(" "));
}

/**
 * Implements a Disjoint Set Union (DSU) data structure with path compression and union by rank.
 */
class DisjointSet {
    // Stores the parent of each element. `parentArray[i] = i` means `i` is a root.
    #parentArray;
    // Stores the rank (or size) of each set's root, used for optimizing union operations.
    #rankArray;
    // The total number of elements managed by this DSU instance.
    #elementCount;

    /**
     * Constructs a new DisjointSet instance with a specified number of elements.
     * Each element is initially in its own set.
     * @param {number} initialSize - The number of elements to initialize the DSU with.
     */
    constructor(initialSize) {
        if (initialSize < 0) {
            throw new Error("Initial size for DisjointSet cannot be negative.");
        }
        this.#elementCount = initialSize;
        this.#parentArray = Array.from({ length: initialSize }, (_, i) => i); // Each element is its own parent.
        this.#rankArray = new Array(initialSize).fill(0); // All ranks initially zero.
    }

    /**
     * Finds the representative (root) of the set containing the given element,
     * applying path compression to flatten the tree structure.
     * @param {number} elementIndex - The index of the element to find the representative for.
     * @returns {number} The index of the representative of the element's set.
     */
    findRepresentative(elementIndex) {
        // Input validation.
        if (elementIndex < 0 || elementIndex >= this.#elementCount) {
            throw new Error(`Element index ${elementIndex} is out of bounds [0, ${this.#elementCount - 1}].`);
        }

        // Find the root of the component.
        let currentPathNode = elementIndex;
        while (this.#parentArray[currentPathNode] !== currentPathNode) {
            currentPathNode = this.#parentArray[currentPathNode];
        }
        const componentRoot = currentPathNode;

        // Path compression: make all nodes on the path point directly to the root.
        currentPathNode = elementIndex;
        while (this.#parentArray[currentPathNode] !== componentRoot) {
            const oldParent = this.#parentArray[currentPathNode];
            this.#parentArray[currentPathNode] = componentRoot;
            currentPathNode = oldParent;
        }
        return componentRoot;
    }

    /**
     * Unites the sets containing two given elements.
     * Uses union by rank heuristic to keep the trees flat.
     * @param {number} element1 - The index of the first element.
     * @param {number} element2 - The index of the second element.
     */
    uniteSets(element1, element2) {
        // Find the representatives of the sets containing element1 and element2.
        const rootOfSet1 = this.findRepresentative(element1);
        const rootOfSet2 = this.findRepresentative(element2);

        // If they are already in the same set, do nothing.
        if (rootOfSet1 === rootOfSet2) {
            return;
        }

        // Get the ranks of the two roots.
        const rankOfRoot1 = this.#rankArray[rootOfSet1];
        const rankOfRoot2 = this.#rankArray[rootOfSet2];

        // Attach the smaller rank tree under the root of the larger rank tree.
        if (rankOfRoot1 < rankOfRoot2) {
            this.#parentArray[rootOfSet1] = rootOfSet2;
        } else if (rankOfRoot2 < rankOfRoot1) {
            this.#parentArray[rootOfSet2] = rootOfSet1;
        } else {
            // If ranks are equal, attach one to the other and increment the rank of the new root.
            this.#parentArray[rootOfSet2] = rootOfSet1;
            this.#rankArray[rootOfSet1]++;
        }
    }
}

// Standard input processing for competitive programming environments.
analyzeSocialNetwork(require("fs").readFileSync("/dev/stdin", "utf8").trim().split("\n"));