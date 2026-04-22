const NO_NODE_REF = -1;

const INPUT_FILE_SOURCE = '/dev/stdin';

/**
 * @class NodeStructure
 * @description Manages a collection of nodes forming a binary tree structure.
 *              Provides methods for initialization, node relation insertion,
 *              and various tree traversal algorithms.
 */
class NodeStructure {
    /**
     * @property {Array<Object>} elementRegistry - Stores all node records, indexed by their ID.
     */
    elementRegistry = [];

    /**
     * @property {number} totalCapacity - The maximum number of nodes this structure can hold.
     */
    totalCapacity = 0;

    /**
     * Constructs a new NodeStructure instance.
     * Initializes a fixed-size array to hold node records with default sentinel values.
     * @param {number} initialSize - The predetermined maximum number of nodes in the tree.
     */
    constructor(initialSize) {
        // Validate the provided size; ensure it's a non-negative integer.
        if (typeof initialSize !== 'number' || initialSize < 0 || !Number.isInteger(initialSize)) {
            console.error(`[NodeStructure] Warning: Invalid initial size '${initialSize}' provided. Initializing with capacity 0.`);
            this.totalCapacity = 0;
        } else {
            this.totalCapacity = initialSize;
        }

        // Pre-fill the registry with placeholder node records.
        // Each record contains sentinel values indicating an uninitialized state.
        for (let recordIndex = 0; recordIndex < this.totalCapacity; recordIndex++) {
            this.elementRegistry.push({
                nodeIdentifier: NO_NODE_REF,      // Unique ID for the node
                parentReference: NO_NODE_REF,     // ID of the parent node
                leftNodeReference: NO_NODE_REF,   // ID of the left child node
                rightNodeReference: NO_NODE_REF   // ID of the right child node
            });
        }
    }

    /**
     * Locates and returns the root node of the tree.
     * A root node is identified as having no parent reference (i.e., its parentReference is NO_NODE_REF).
     * It also must have a valid nodeIdentifier (not NO_NODE_REF).
     * @returns {Object | null} The root node record, or null if the tree is empty or no root is found.
     */
    obtainRootElement() {
        // If the registry is empty, there can be no root.
        if (this.elementRegistry.length === 0) {
            return null;
        }

        // Search for a node whose parent reference matches the sentinel value
        // and which has been properly initialized (nodeIdentifier is not NO_NODE_REF).
        const foundRoot = this.elementRegistry.find(
            (nodeRecord) => nodeRecord.parentReference === NO_NODE_REF && nodeRecord.nodeIdentifier !== NO_NODE_REF
        );

        // Return the found root or null if none is identified.
        return foundRoot || null;
    }

    /**
     * Inserts or updates the relationship data for a specific node.
     * This method sets the node's own ID and its children's IDs, and
     * also updates the parent references of its children.
     * @param {number} currentId - The identifier of the node being configured.
     * @param {number} leftChildRefId - The identifier of the left child node.
     * @param {number} rightChildRefId - The identifier of the right child node.
     */
    insertElementRelations(currentId, leftChildRefId, rightChildRefId) {
        // Basic validation for the current node's ID.
        if (currentId < 0 || currentId >= this.totalCapacity || !Number.isInteger(currentId)) {
            console.warn(`[NodeStructure] Skipping relation insertion for invalid node ID: ${currentId}.`);
            return;
        }

        // Retrieve the node record from the registry.
        let targetNodeRecord = this.elementRegistry[currentId];

        // This check is a safeguard; with pre-initialization, targetNodeRecord should always exist.
        if (!targetNodeRecord) {
            console.error(`[NodeStructure] Critical Error: Node record for ID ${currentId} is unexpectedly missing.`);
            return;
        }

        // Update the node's own identifier and its child references.
        targetNodeRecord.nodeIdentifier = currentId;
        targetNodeRecord.leftNodeReference = leftChildRefId;
        targetNodeRecord.rightNodeReference = rightChildRefId;

        // If a left child exists (not a sentinel value), update its parent reference.
        if (leftChildRefId !== NO_NODE_REF) {
            const potentialLeftChild = this.retrieveElement(leftChildRefId);
            // Only update parent if the child record is valid and has a proper identifier.
            if (potentialLeftChild && potentialLeftChild.nodeIdentifier !== NO_NODE_REF) {
                potentialLeftChild.parentReference = currentId;
            }
        }

        // If a right child exists, update its parent reference similarly.
        if (rightChildRefId !== NO_NODE_REF) {
            const potentialRightChild = this.retrieveElement(rightChildRefId);
            // Only update parent if the child record is valid and has a proper identifier.
            if (potentialRightChild && potentialRightChild.nodeIdentifier !== NO_NODE_REF) {
                potentialRightChild.parentReference = currentId;
            }
        }
    }

    /**
     * Retrieves a node record by its identifier.
     * @param {number} elemId - The identifier of the node to retrieve.
     * @returns {Object} The node record object, or an empty object if the ID is out of bounds.
     *                   Returning an empty object mimics the original `|| {}` behavior for robustness
     *                   when accessing properties on a non-existent element.
     */
    retrieveElement(elemId) {
        // Return an empty object for out-of-bounds IDs to prevent errors when accessing properties,
        // and to align with the original `|| {}` behavior for non-existent elements.
        if (elemId < 0 || elemId >= this.totalCapacity || !Number.isInteger(elemId)) {
            return {};
        }
        return this.elementRegistry[elemId];
    }

    /**
     * Recursive helper for pre-order traversal.
     * Processes the current node, then its left child, then its right child.
     * @private
     * @param {number} currentNodeId - The ID of the node to visit.
     * @param {Array<number>} traversalResults - Array to accumulate visited node IDs.
     */
    _traversePreFix(currentNodeId, traversalResults) {
        // Base case: If the current node ID is a sentinel, stop.
        if (currentNodeId === NO_NODE_REF) {
            return;
        }

        const currentElementData = this.retrieveElement(currentNodeId);

        // Guard against retrieving an invalid or uninitialized node.
        // An empty object from retrieveElement means out-of-bounds ID.
        // nodeIdentifier === NO_NODE_REF means the node hasn't been set up yet.
        if (!currentElementData || currentElementData.nodeIdentifier === NO_NODE_REF) {
            return;
        }

        // Visit the current node (add its ID to results).
        traversalResults.push(currentNodeId);

        // Recursively traverse the left subtree.
        this._traversePreFix(currentElementData.leftNodeReference, traversalResults);
        // Recursively traverse the right subtree.
        this._traversePreFix(currentElementData.rightNodeReference, traversalResults);
    }

    /**
     * Initiates and returns the pre-order traversal sequence as a space-separated string.
     * @returns {string} A string containing node IDs in pre-order, separated by spaces.
     */
    displayPreFix() {
        const rootNode = this.obtainRootElement();
        if (!rootNode || rootNode.nodeIdentifier === NO_NODE_REF) {
            console.warn("[NodeStructure] Cannot perform pre-order traversal: Root node not found or tree is empty/uninitialized.");
            return "";
        }

        const collectedIds = [];
        this._traversePreFix(rootNode.nodeIdentifier, collectedIds);
        return collectedIds.join(' ');
    }

    /**
     * Recursive helper for in-order traversal.
     * Processes the left child, then the current node, then its right child.
     * @private
     * @param {number} currentNodeId - The ID of the node to visit.
     * @param {Array<number>} traversalResults - Array to accumulate visited node IDs.
     */
    _traverseInFix(currentNodeId, traversalResults) {
        if (currentNodeId === NO_NODE_REF) {
            return;
        }

        const currentElementData = this.retrieveElement(currentNodeId);
        if (!currentElementData || currentElementData.nodeIdentifier === NO_NODE_REF) {
            return;
        }

        this._traverseInFix(currentElementData.leftNodeReference, traversalResults);
        traversalResults.push(currentNodeId);
        this._traverseInFix(currentElementData.rightNodeReference, traversalResults);
    }

    /**
     * Initiates and returns the in-order traversal sequence as a space-separated string.
     * @returns {string} A string containing node IDs in in-order, separated by spaces.
     */
    displayInFix() {
        const rootNode = this.obtainRootElement();
        if (!rootNode || rootNode.nodeIdentifier === NO_NODE_REF) {
            console.warn("[NodeStructure] Cannot perform in-order traversal: Root node not found or tree is empty/uninitialized.");
            return "";
        }

        const collectedIds = [];
        this._traverseInFix(rootNode.nodeIdentifier, collectedIds);
        return collectedIds.join(' ');
    }

    /**
     * Recursive helper for post-order traversal.
     * Processes the left child, then the right child, then the current node.
     * @private
     * @param {number} currentNodeId - The ID of the node to visit.
     * @param {Array<number>} traversalResults - Array to accumulate visited node IDs.
     */
    _traversePostFix(currentNodeId, traversalResults) {
        if (currentNodeId === NO_NODE_REF) {
            return;
        }

        const currentElementData = this.retrieveElement(currentNodeId);
        if (!currentElementData || currentElementData.nodeIdentifier === NO_NODE_REF) {
            return;
        }

        this._traversePostFix(currentElementData.leftNodeReference, traversalResults);
        this._traversePostFix(currentElementData.rightNodeReference, traversalResults);
        traversalResults.push(currentNodeId);
    }

    /**
     * Initiates and returns the post-order traversal sequence as a space-separated string.
     * @returns {string} A string containing node IDs in post-order, separated by spaces.
     */
    displayPostFix() {
        const rootNode = this.obtainRootElement();
        if (!rootNode || rootNode.nodeIdentifier === NO_NODE_REF) {
            console.warn("[NodeStructure] Cannot perform post-order traversal: Root node not found or tree is empty/uninitialized.");
            return "";
        }

        const collectedIds = [];
        this._traversePostFix(rootNode.nodeIdentifier, collectedIds);
        return collectedIds.join(' ');
    }
}

/**
 * @function readInputData
 * @description Reads and returns the content of a specified file.
 *              Includes basic error handling for file operations.
 * @param {string} filePath - The path to the file to read.
 * @returns {string} The trimmed content of the file, or an empty string if an error occurs.
 */
function readInputData(filePath) {
    try {
        // Use 'node:fs' for explicit Node.js built-in module.
        return require('node:fs').readFileSync(filePath, 'utf8').trim();
    } catch (error) {
        // Log a more informative error message.
        console.error(`[FileHandler] Failed to read input file at '${filePath}': ${error.message}`);
        // Return an empty string to allow the program to continue without crashing,
        // but subsequent logic should handle this empty input.
        return "";
    }
}

// Immediately Invoked Function Expression (IIFE) for the main program logic.
(function executeTreeOperations() {
    // Read raw input from the predefined source.
    const rawContent = readInputData(INPUT_FILE_SOURCE);

    // If no content, exit gracefully.
    if (!rawContent) {
        console.log("[Main] No input content to process. Exiting.");
        return;
    }

    // Split content into individual lines.
    const allInputLines = rawContent.split('\n');

    // Filter out any empty lines that might result from splitting or trimming.
    const processedLines = allInputLines.filter(line => line.length > 0);

    let totalNodeCount = 0;

    // Extract the first line, which should specify the total number of nodes.
    if (processedLines.length > 0) {
        const firstDataLine = processedLines.shift(); // Remove and get the first line
        totalNodeCount = Number(firstDataLine);

        // Validate the parsed number of nodes.
        if (isNaN(totalNodeCount) || totalNodeCount < 0 || !Number.isInteger(totalNodeCount)) {
            console.error(`[Main] Invalid number of nodes specified: '${firstDataLine}'. Defaulting to 0.`);
            totalNodeCount = 0;
            // Clear remaining lines if initial count is invalid to prevent further errors.
            processedLines.length = 0;
        }
    } else {
        console.warn("[Main] Input file is empty after filtering. No nodes to process.");
    }

    // Instantiate the tree structure with the determined capacity.
    const treeDataStructure = new NodeStructure(totalNodeCount);

    // Iterate through the remaining lines to populate the tree.
    // Each line contains node ID, left child ID, and right child ID.
    for (const nodeLine of processedLines) {
        const numericNodeData = nodeLine.split(' ').map(val => Number(val.trim()));

        // Ensure exactly three numeric values are present and valid before adding.
        if (numericNodeData.length === 3 && numericNodeData.every(val => !isNaN(val))) {
            treeDataStructure.insertElementRelations(...numericNodeData);
        } else {
            console.warn(`[Main] Skipping malformed or incomplete input line for node relations: '${nodeLine}'`);
        }
    }

    // Perform and display the different tree traversals.
    console.log('--- Tree Traversal Results ---');

    console.log('Preorder Traversal:');
    // The leading space is added here to match the original `process.stdout.write` output format.
    console.log(` ${treeDataStructure.displayPreFix()}`);

    console.log('\nInorder Traversal:');
    console.log(` ${treeDataStructure.displayInFix()}`);

    console.log('\nPostorder Traversal:');
    console.log(` ${treeDataStructure.displayPostFix()}`);

    console.log('\n--- End of Traversal ---');
})();