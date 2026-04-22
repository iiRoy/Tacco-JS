class NodeElement {
    // Constructor for a single element within the Disjoint Set Union structure.
    // Each element initially forms its own set, referencing itself as its parent
    // and having a component size of 1.
    constructor() {
        this._parentReference = this; // Points to the parent node in the DSU tree
        this._subsetSize = 1;         // Stores the size of the subset if this element is the root
    }

    // --- Getters and Setters for internal properties ---

    // Retrieves the current parent reference of this element.
    get parent() {
        return this._parentReference;
    }

    // Sets a new parent reference for this element.
    set parent(newParentNode) {
        this._parentReference = newParentNode;
    }

    // Retrieves the size of the subset rooted by this element.
    get size() {
        return this._subsetSize;
    }

    // Sets a new size for the subset rooted by this element.
    set size(newSizeValue) {
        this._subsetSize = newSizeValue;
    }

    // Finds the ultimate root of the set containing this element.
    // This method implements path compression for improved efficiency:
    // during traversal, it makes every visited node point directly to the root.
    findSetRepresentative() {
        // If this element is its own parent, it is the root of its set.
        if (this._parentReference === this) {
            return this;
        }
        // Otherwise, recursively find the root and compress the path.
        // The parent of this element is updated to point directly to the found root.
        this._parentReference = this._parentReference.findSetRepresentative();
        return this._parentReference;
    }
}

// A utility class providing static methods for Disjoint Set Union operations.
// It encapsulates the core logic for merging sets and checking set membership.
class DisjointSetOperations {
    /**
     * Merges the sets containing `elementA` and `elementB`.
     * This operation uses the "union by size" heuristic to maintain balanced trees,
     * attaching the smaller tree's root to the larger tree's root.
     * @param {NodeElement} elementA - The first element involved in the union.
     * @param {NodeElement} elementB - The second element involved in the union.
     * @returns {boolean} True if the union was successful (elements were in different sets), false otherwise.
     */
    static uniteSubsets(elementA, elementB) {
        // Basic validation: ensure both elements are valid NodeElement instances.
        if (!elementA || !elementB) {
            return false;
        }

        // Find the root (representative) of each element's set.
        const rootOfA = elementA.findSetRepresentative();
        const rootOfB = elementB.findSetRepresentative();

        // If the roots are already the same, the elements are in the same set,
        // so no union is needed.
        if (rootOfA === rootOfB) {
            return false;
        } else {
            // Perform union by size: attach the root of the smaller set to the root of the larger set.
            // This helps keep the tree's height minimal.
            if (rootOfA.size < rootOfB.size) {
                rootOfA.parent = rootOfB; // Make rootOfB the parent of rootOfA
                rootOfB.size += rootOfA.size; // Update the size of the new larger set
            } else {
                rootOfB.parent = rootOfA; // Make rootOfA the parent of rootOfB
                rootOfA.size += rootOfB.size; // Update the size of the new larger set
            }
            return true; // Union was successfully performed
        }
    }

    /**
     * Checks if two elements, `elementA` and `elementB`, belong to the same set.
     * @param {NodeElement} elementA - The first element for the comparison.
     * @param {NodeElement} elementB - The second element for the comparison.
     * @returns {number} Returns 1 if both elements are in the same set, 0 otherwise.
     */
    static areElementsInSameSet(elementA, elementB) {
        // Basic validation: ensure both elements are valid NodeElement instances.
        if (!elementA || !elementB) {
            return 0; // Treat invalid inputs as being in different sets
        }
        // Elements are in the same set if their set representatives (roots) are identical.
        return (elementA.findSetRepresentative() === elementB.findSetRepresentative()) ? 1 : 0;
    }
}

// Primary function to parse input and execute Disjoint Set Union queries.
function processInputData(rawDataString) {
    // Divide the entire input string into an array of individual lines.
    const allInputLines = rawDataString.split("\n");

    // Extract the problem parameters (N and Q) from the first line.
    // N: number of elements, Q: number of queries.
    const initialParameters = allInputLines[0].split(" ").map(val => parseInt(val, 10));
    const numberOfElements = initialParameters[0];
    const numberOfQueries = initialParameters[1];

    // Initialize an array to hold all NodeElement instances.
    // Each index `i` corresponds to element `i`.
    const elementNodes = [];
    for (let i = 0; i < numberOfElements; ++i) {
        elementNodes.push(new NodeElement());
    }

    // Process each query from the input lines. Queries start from the second line (index 1).
    for (let queryIndex = 0; queryIndex < numberOfQueries; ++queryIndex) {
        // Parse the current query line into its components: operation type, element A, element B.
        const currentQueryDetails = allInputLines[queryIndex + 1].split(" ");
        const operationCode = parseInt(currentQueryDetails[0], 10);
        const indexA = parseInt(currentQueryDetails[1], 10);
        const indexB = parseInt(currentQueryDetails[2], 10);

        // Retrieve the actual NodeElement objects using the parsed indices.
        const nodeForA = elementNodes[indexA];
        const nodeForB = elementNodes[indexB];

        // Based on the operation code, perform either a union or a same-set check.
        if (operationCode === 0) {
            // Operation type '0': Perform a union operation on the sets containing nodeForA and nodeForB.
            DisjointSetOperations.uniteSubsets(nodeForA, nodeForB);
        } else { // Assuming operationCode === 1 based on problem constraints
            // Operation type '1': Check if nodeForA and nodeForB are in the same set.
            // The result (1 for same, 0 for different) is printed to the console.
            console.log(DisjointSetOperations.areElementsInSameSet(nodeForA, nodeForB));
        }
    }
}

// Standard input reading for competitive programming environments.
// This line executes the main processing function with data from stdin.
processInputData(require("fs").readFileSync("/dev/stdin", "utf8"));