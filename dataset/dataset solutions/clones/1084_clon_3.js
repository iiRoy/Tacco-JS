const fileSystemInterface = require('fs'); // This module provides file system utilities for input reading.

/**
 * Defines a structure for a single element within our graph representation.
 * Each element will have an identifier, references to its direct descendants,
 * a pointer to its immediate parent, and its calculated depth level within the hierarchy.
 * @param {number} elementIdentifier - A unique numerical identifier for the node.
 * @param {number[]} descendantReferences - An array of IDs of the node's direct children.
 * @returns {object} A new graph element object.
 */
const createGraphElement = (elementIdentifier, descendantReferences) => {
    // Perform basic validation for the identifier.
    if (typeof elementIdentifier !== 'number' || elementIdentifier < 0 || !Number.isInteger(elementIdentifier)) {
        console.error(`Error: Invalid element ID provided: ${elementIdentifier}`);
        process.exit(1); // Exit on critical error for invalid input.
    }
    return {
        uniqueId: elementIdentifier,
        childElements: [...descendantReferences], // Clone array to prevent external modification issues.
        parentRefId: -1, // -1 commonly indicates no parent (i.e., a root node) in array-indexed systems.
        hierarchyLevel: null // This property will be populated later during graph traversal.
    };
};

/**
 * Formats a graph element object into a human-readable string representation.
 * This includes its ID, parent, depth, category (root, internal, leaf), and children.
 * @param {object} elementObject - The graph element object to format.
 * @returns {string} A formatted string describing the element.
 */
const representElementAsText = elementObject => {
    let elementCategory; // Variable to store the determined type of the element.

    // Determine the type of the element based on its parent and number of children.
    if (elementObject.parentRefId === -1) {
        elementCategory = 'root element'; // An element with no parent is the root.
    } else if (elementObject.childElements.length > 0) {
        elementCategory = 'intermediate node'; // An element with a parent and children is an internal node.
    } else {
        elementCategory = 'leaf element'; // An element with a parent but no children is a leaf.
    }

    // Format the list of child element IDs for display. If no children, display '[]'.
    const childrenDisplay = elementObject.childElements.length > 0
        ? `[${elementObject.childElements.join(', ')}]`
        : '[]';

    // Display the hierarchy level, or 'unassigned' if it hasn't been computed yet.
    const levelDisplay = elementObject.hierarchyLevel !== null
        ? elementObject.hierarchyLevel
        : 'unassigned';

    // Construct the final output string using a template literal for clear readability.
    return `element ${elementObject.uniqueId}: ancestor = ${elementObject.parentRefId}, level = ${levelDisplay}, ${elementCategory}, children = ${childrenDisplay}`;
};

/**
 * Recursively calculates and assigns the depth (level) for all elements in the graph.
 * It identifies the root node and then performs a depth-first traversal.
 * @param {Map<number, object>} elementMap - A Map where keys are element IDs and values are element objects.
 */
const assignHierarchyLevels = elementMap => {
    // If the map of elements is empty, there's nothing to process.
    if (elementMap.size === 0) {
        return;
    }

    let identifiedRoot = null;
    // Iterate through all elements to find the primary root (the one without a parent).
    for (const currentElement of elementMap.values()) {
        if (currentElement.parentRefId === -1) {
            // Basic check for multiple roots - in a well-formed tree, there should be only one.
            if (identifiedRoot !== null) {
                console.warn("Warning: Multiple root elements detected. Processing will proceed with the first one found.");
            }
            identifiedRoot = currentElement;
            // For a single root, we can break early to optimize.
            break;
        }
    }

    // If no root element is found after checking all elements, the structure is malformed.
    if (!identifiedRoot) {
        console.error("Error: No root element could be identified in the given structure. A tree must have a root.");
        process.exit(1); // Exit due to critical structural error.
    }

    /**
     * Inner recursive function to traverse the graph and set hierarchy levels.
     * @param {object} currentElement - The element currently being processed.
     * @param {number} currentLevel - The current depth level of the element.
     */
    const traverseAndSetLevel = (currentElement, currentLevel) => {
        currentElement.hierarchyLevel = currentLevel; // Assign the calculated level to the element.

        // Iterate over each child identifier of the current element.
        for (const childId of currentElement.childElements) {
            const childNodeObject = elementMap.get(childId); // Retrieve the actual child element object from the map.

            // Ensure the child element exists in the collection before recursing.
            if (childNodeObject) {
                traverseAndSetLevel(childNodeObject, currentLevel + 1); // Recurse for children, incrementing the level.
            } else {
                console.warn(`Warning: Child ID ${childId} referenced by element ${currentElement.uniqueId} does not exist in the collection.`);
            }
        }
    };

    // Start the recursive level assignment process from the identified root, which is at level 0.
    traverseAndSetLevel(identifiedRoot, 0);
};

// --- Main Program Execution Flow ---

// Read all input from standard input, decode as UTF-8, and split into individual lines.
// Using process.stdin.readFileSync(0) is a common pattern for reading from /dev/stdin.
const rawInputLines = fileSystemInterface.readFileSync(0, 'utf-8').split('\n');

// Basic validation for input presence.
if (rawInputLines.length === 0 || rawInputLines[0].trim() === '') {
    console.error("Error: No input data provided or the first line (node quantity) is empty.");
    process.exit(1);
}

// Parse the total number of elements expected from the first line of input.
const totalElementsQuantity = Number(rawInputLines[0]);

// Validate the parsed quantity: must be a positive integer.
if (isNaN(totalElementsQuantity) || totalElementsQuantity <= 0 || !Number.isInteger(totalElementsQuantity)) {
    console.error(`Error: Invalid total element quantity specified: '${rawInputLines[0]}'. Must be a positive integer.`);
    process.exit(1);
}

// Ensure that there are enough input lines present for the declared number of elements.
// We add 1 to totalElementsQuantity because the first line contains the quantity itself.
if (rawInputLines.length - 1 < totalElementsQuantity) {
    console.error(`Error: Insufficient input lines. Expected ${totalElementsQuantity} data lines, but only received ${rawInputLines.length - 1}.`);
    process.exit(1);
}

// Process the data lines, skipping the first line (which contains the total quantity).
// Each line is split by space and its parts are converted to numbers.
const parsedElementSpecifications = rawInputLines.slice(1, totalElementsQuantity + 1)
    .map(dataLine => dataLine.split(' ').map(Number));

// Use a Map to store our graph elements. This allows for direct access by unique ID,
// which is more robust and flexible than relying on array indices matching IDs.
const elementCollection = new Map();

// Populate the element collection from the parsed specifications.
parsedElementSpecifications.forEach(specEntry => {
    // Extract the element's unique ID and the IDs of its direct children.
    const elementId = specEntry[0];
    const directChildrenIds = specEntry.slice(2);

    // Check for duplicate IDs, which might indicate an issue or an intended overwrite.
    if (elementCollection.has(elementId)) {
        console.warn(`Warning: Duplicate element ID ${elementId} found. Previous entry will be overwritten.`);
    }

    // Create a new graph element object and add it to our collection Map.
    elementCollection.set(elementId, createGraphElement(elementId, directChildrenIds));
});

// Second pass: Establish parent-child relationships by setting the parentRefId for each child.
// We iterate through all elements currently in the collection.
for (const [_, currentElement] of elementCollection) { // The key (first element of tuple) is ignored here.
    // For each child identifier listed by the current element, find the child and set its parent.
    for (const childIdentifier of currentElement.childElements) {
        const childNode = elementCollection.get(childIdentifier);

        // Ensure the referenced child actually exists in our collection.
        if (childNode) {
            childNode.parentRefId = currentElement.uniqueId; // Assign the current element's ID as the child's parent.
        } else {
            console.warn(`Warning: Child element ID ${childIdentifier} referenced by element ${currentElement.uniqueId} is not defined in the input data.`);
        }
    }
}

// Now that all parent relationships are established, calculate the hierarchy levels for all elements.
assignHierarchyLevels(elementCollection);

// Prepare the final output by formatting each element into a string.
const finalOutputLines = [];
// To ensure consistent output order (matching the original example's sorted output),
// we convert the Map values to an array and sort them by their unique ID.
const sortedElementsForOutput = Array.from(elementCollection.values()).sort((a, b) => a.uniqueId - b.uniqueId);

// Iterate through the sorted elements and format each one, adding it to the output array.
for (const element of sortedElementsForOutput) {
    finalOutputLines.push(representElementAsText(element));
}

// Print all formatted lines to the console, joined by newline characters.
console.log(finalOutputLines.join('\n'));