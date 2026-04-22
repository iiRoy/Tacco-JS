const rawData = require('fs').readFileSync('/proc/self/fd/0', 'utf-8'); // Read input data from standard input path

const linesOfText = rawData.trim().split('\n'); // Split the raw input into an array of lines, removing leading/trailing whitespace
const totalElements = parseInt(linesOfText.shift(), 10); // Extract the first line as the total count, converting it to an integer
const adjacencyData = linesOfText.map((lineStr) =>
    lineStr.split(' ').map(parseInt) // For each remaining line, split by space and convert elements to integers
);

/**
 * Represents a single vertex in the graph structure.
 * Manages its unique identifier, direct successors, and its immediate predecessor.
 */
class GraphVertex {
    // Initializes a new vertex with a given identifier
    constructor(identifier) {
        this.vertexId = identifier; // Unique numerical identifier for this vertex
        this.successors = [];       // Array to store references to child vertices
        // The 'predecessor' property is set when this vertex is added as a child to another
    }

    // Establishes a directional link: this vertex becomes the predecessor of the provided childVertex
    attachSuccessor(childVertex) {
        childVertex.predecessor = this; // Assign this vertex as the parent of the child
        this.successors.push(childVertex); // Add the child to this vertex's list of successors
    }

    // Checks if this vertex has a predecessor (i.e., if it's not the root)
    hasPredecessor() {
        return !!this.predecessor;
    }

    // Checks if this vertex has any successors (i.e., if it's not a leaf)
    hasSuccessors() {
        return !!this.successors.length;
    }

    // Determines the topological category of the vertex within the graph
    determineCategory() {
        if (!this.hasPredecessor()) {
            return 'origin';            // This vertex is the graph's root
        } else if (this.hasSuccessors()) {
            return 'intermediate_point'; // This vertex has both a parent and children
        } else {
            return 'terminal_point';    // This vertex has a parent but no children (a leaf)
        }
    }

    // Recursively calculates and assigns the 'level' (depth) for this vertex and all its descendants
    computeDepths(currentLevel) {
        this.level = currentLevel; // Set the current depth for this vertex
        // Iterate over all successors and recursively call computeDepths with an incremented level
        this.successors.forEach((descendant) =>
            descendant.computeDepths(currentLevel + 1)
        );
    }

    // Generates a formatted string representation of the vertex's key properties
    representAsString() {
        const predecessorId = this.hasPredecessor() ? this.predecessor.vertexId : null; // Get predecessor ID or null if none
        const successorIds = this.successors.map((subNode) => subNode.vertexId).join(', '); // Get IDs of successors
        return `vertex ${this.vertexId}: predecessor = ${predecessorId}, level = ${this.level}, ${this.determineCategory()}, [${successorIds}]`;
    }
}

/**
 * Encapsulates the entire graph structure, managing a collection of GraphVertex objects.
 * Provides functionality to build, process, and display the graph.
 */
class GraphStructure {
    // Initializes the graph by creating an empty registry for all vertices
    constructor() {
        this.vertexRegistry = new Map(); // A Map to store vertices, keyed by their unique identifiers
    }

    // Retrieves a GraphVertex by its identifier, creating it if it does not yet exist in the registry
    retrieveVertex(identifier) {
        if (!this.vertexRegistry.has(identifier)) {
            this.vertexRegistry.set(identifier, new GraphVertex(identifier)); // Create and register new vertex
        }
        return this.vertexRegistry.get(identifier); // Return the existing or newly created vertex
    }

    // Locates and returns the single origin (root) vertex of the graph
    findOriginVertex() {
        // Convert Map values to an array and find the vertex without a predecessor
        return Array.from(this.vertexRegistry.values()).find(
            (currentVertex) => !currentVertex.hasPredecessor()
        );
    }

    // Initiates the depth calculation across the entire graph, starting from the root
    processStructure() {
        const mainRoot = this.findOriginVertex(); // Identify the root vertex
        mainRoot.computeDepths(0); // Begin the recursive depth calculation from level 0
    }

    // Iterates through all registered vertices and prints their string representations to the console
    displayStructure() {
        for (let vertexIndex = 0; vertexIndex < this.vertexRegistry.size; ++vertexIndex) {
            const currentGraphVertex = this.vertexRegistry.get(vertexIndex); // Retrieve vertex by its index (assuming sequential IDs)
            console.log(currentGraphVertex.representAsString()); // Output the vertex's formatted information
        }
    }
}

// Instantiate the primary graph structure manager
const graphInstance = new GraphStructure();

// Populate the graph by processing the parsed adjacency data
adjacencyData.forEach(([originId, countChildren, ...childIdentifiers]) => {
    const originVertex = graphInstance.retrieveVertex(originId); // Get or create the parent vertex
    childIdentifiers.forEach((childIdentifier) => {
        const childGraphVertex = graphInstance.retrieveVertex(childIdentifier); // Get or create the child vertex
        originVertex.attachSuccessor(childGraphVertex); // Establish the parent-child relationship
    });
});

// Execute the graph processing to determine all vertex depths
graphInstance.processStructure();
// Output the detailed structure of the graph to standard output
graphInstance.displayStructure();