const fileSystemModule = require('fs'); // Import the file system module for input operations

// Read the input from standard input, decode as UTF-8, and split into individual lines.
const inputRecords = fileSystemModule.readFileSync('/dev/stdin', 'utf-8')
                                     .split('\n');

/**
 * Creates a new tree element record with specified identifier and child references.
 * @param {number} elementId - The unique numerical identifier for the new element.
 * @param {number[]} childRefs - An array of numerical identifiers for its direct children.
 * @returns {object} A structured object representing a tree element.
 */
const createNodeRecord = (elementId, childRefs) => {
    return {
        nodeIdentifier: elementId,
        offspringReferences: [...childRefs], // Use spread to create a new array instance
        ancestorIdentifier: null,            // Initialize parent reference as null
        levelValue: undefined                // Initialize depth as undefined
    };
};

/**
 * Formats a given tree element's data into a readable string representation.
 * @param {object} treeItem - The element object to format.
 * @returns {string} A string containing the element's identifier, parent, depth, type, and children.
 */
const renderNodeInfo = treeItem => {
    // Determine the classification of the node based on its parent and children.
    const NODE_ROOT = 'root';
    const NODE_INTERNAL = 'internal node';
    const NODE_LEAF = 'leaf';

    const classification = treeItem.ancestorIdentifier === null
                         ? NODE_ROOT
                         : treeItem.offspringReferences.length > 0
                           ? NODE_INTERNAL
                           : NODE_LEAF;

    // Create a string representation of the children array.
    const offspringArrayString = `[${treeItem.offspringReferences.join(', ')}]`;

    // Construct and return the full descriptive string for the element.
    return `node ${treeItem.nodeIdentifier}: parent = ${treeItem.ancestorIdentifier}, depth = ${treeItem.levelValue}, ${classification}, ${offspringArrayString}`;
};

/**
 * Recursively calculates and assigns depth values to all elements in the tree structure.
 * @param {object[]} elementCollection - The array of all tree element objects.
 */
const assignNodeDepths = elementCollection => {
    // Find the root element, which has no parent (ancestorIdentifier is null).
    const topNode = elementCollection.filter(item => item.ancestorIdentifier === null)[0];

    /**
     * Helper function for depth-first traversal to set node levels.
     * @param {object} currentNode - The current element being processed.
     * @param {number} currentLevel - The depth level of the currentNode.
     */
    const depthTraversal = (currentNode, currentLevel) => {
        currentNode.levelValue = currentLevel; // Assign the current depth level.

        // Recursively call for each child, incrementing the level.
        currentNode.offspringReferences.forEach(childReference => {
            depthTraversal(elementCollection[childReference], currentLevel + 1);
        });
    };

    // Begin the depth assignment process starting from the root at level 0.
    depthTraversal(topNode, 0);
};

// Parse the first line to get the total number of elements.
const totalElements = parseInt(inputRecords[0], 10);

// Process the subsequent lines to extract raw node data.
// Each line (from 1 to totalElements) is split by space, and numbers are parsed.
const rawStructureData = inputRecords.slice(1, totalElements + 1)
                                     .map(entryLine => entryLine.split(' ').map(Number));

// Transform the raw data into an array of structured node objects.
const nodeStructureArray = rawStructureData.map(recordEntry => {
    const elementIdentifier = recordEntry[0];       // The first number is the node's ID.
    const directOffspring = recordEntry.slice(2);   // Numbers from the third onwards are children IDs.
    return createNodeRecord(elementIdentifier, directOffspring);
});

// Sort the node array by their identifiers for consistent indexing.
nodeStructureArray.sort((itemA, itemB) => itemA.nodeIdentifier - itemB.nodeIdentifier);

// Iterate through the sorted nodes to establish parent-child relationships.
// For each node, assign its ID as the parent to all its children.
nodeStructureArray.forEach((currentElement, idx, entireCollection) => {
    currentElement.offspringReferences.forEach(childRef => {
        // The child's parent reference is set to the current element's ID.
        entireCollection[childRef].ancestorIdentifier = currentElement.nodeIdentifier;
    });
});

// Calculate and assign the depth for every element in the tree.
assignNodeDepths(nodeStructureArray);

// Format each node's information and print it to the console, separated by newlines.
console.log(nodeStructureArray.map(element => renderNodeInfo(element)).join('\n'));