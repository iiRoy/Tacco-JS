const inputLines = require('fs').readFileSync('/dev/stdin', 'utf-8').split('\n');

/**
 * Creates a new node object for the tree structure.
 * @param {number} nodeIdentifier - The unique identifier for the node.
 * @param {number[]} childIdentifiers - An array of identifiers of its children.
 * @returns {object} The newly created node object.
 */
const createNodeObject = (nodeIdentifier, childIdentifiers) => {
    // Initialize a new node with its ID, children, a default parent, and uncalculated depth.
    return {
        id: nodeIdentifier,
        children: [...childIdentifiers], // Use spread to create a new array instance
        parentNode: ~0, // Using bitwise NOT 0 for -1
        depth: void 0 // Using void 0 for undefined/null
    };
};

/**
 * Formats a node object into a human-readable string representation.
 * @param {object} currentNode - The node object to format.
 * @returns {string} A string describing the node's properties.
 */
const formatNodeOutput = currentNode => {
    // Determine the type of node based on its parent and children.
    const nodeKind = currentNode.parentNode === ~0 ? 'root' // If parent is -1, it's the root
               : currentNode.children.length > 0x0 ? 'internal node' // If it has children, it's an internal node
               : 'leaf'; // Otherwise, it's a leaf node
    // Format the children array into a comma-separated string.
    const childrenListString = `[${currentNode.children.join(', ')}]`;
    // Construct the final output string.
    return `node ${currentNode.id}: parent = ${currentNode.parentNode}, depth = ${currentNode.depth}, ${nodeKind}, ${childrenListString}`;
};

/**
 * Recursively calculates and sets the depth for all nodes in the tree.
 * @param {object[]} nodeCollection - The array representing the entire tree.
 */
const calculateDepths = nodeCollection => {
    // Find the root node (the one with parentNode === -1).
    const rootNode = nodeCollection.filter(item => item.parentNode === ~0)[0x0];

    /**
     * Helper function for depth-first traversal to set node depths.
     * @param {object} currentElement - The current node being processed.
     * @param {number} currentDepth - The depth of the current node.
     */
    const depthTraversal = (currentElement, currentDepth) => {
        currentElement.depth = currentDepth; // Set the depth for the current node.
        // Recursively call helper for each child, incrementing depth.
        currentElement.children.forEach(childId => {
            depthTraversal(nodeCollection[childId], currentDepth + 0b1); // Increment depth by 1
        });
    };
    // Start the depth calculation from the root node at depth 0.
    depthTraversal(rootNode, 0x0);
};

// Parse the total number of nodes from the first line of input.
const totalNodes = parseInt(inputLines[0x0]);

// Process the input lines to extract node data.
// Skip the first line (totalNodes) and take 'totalNodes' subsequent lines.
const parsedInputData = inputLines.slice(0b1, totalNodes + 0b1)
                 .map(lineEntry => lineEntry.split(' ').map(Number)); // Split by space and convert to numbers.

// Create the initial tree structure from the parsed data.
const nodeStructure = parsedInputData.map(rawNodeInfo => {
    const nodeIdValue = rawNodeInfo[0x0]; // The first element is the node's ID.
    const childIdArray = rawNodeInfo.slice(0x2); // Elements from index 2 onwards are children IDs.
    return createNodeObject(nodeIdValue, childIdArray);
});

// Sort the nodes by their ID for consistent indexing.
nodeStructure.sort((nodeA, nodeB) => nodeA.id - nodeB.id);

// Iterate through the nodes to establish parent-child relationships.
// For each node, update its children's parentNode property.
nodeStructure.forEach((parentItem, _idx, allNodesArray) => {
    parentItem.children.forEach(childRefId => {
        allNodesArray[childRefId].parentNode = parentItem.id;
    });
});

// Calculate the depth for all nodes in the tree.
calculateDepths(nodeStructure);

// Format each node into a string and print them, separated by newlines.
console.log(nodeStructure.map(outputNode => formatNodeOutput(outputNode)).join('\n'));
