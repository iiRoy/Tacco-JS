/*
 * This file contains functions and logic for constructing a binary tree
 * from input data and performing various tree traversals (Preorder, Inorder, Postorder).
 * It demonstrates Type III code cloning, incorporating significant structural
 * and syntactic changes while maintaining core functionality.
 */

// Define a constant for an invalid node identifier, often representing null or end of branch.
const INVALID_NODE_IDENTIFIER = -1;

/**
 * Helper function to safely retrieve a tree element by its unique identifier.
 * This abstracts away the underlying data structure (e.g., Map lookup).
 * @param {number} elementKey The unique ID of the node to retrieve.
 * @param {Map<number, object>} nodeMap The collection of tree nodes (ID -> node object).
 * @returns {object|null} The node object if found, otherwise null.
 */
function fetchTreeElementById(elementKey, nodeMap) {
    // A guard clause to handle invalid or non-existent keys efficiently.
    if (elementKey === INVALID_NODE_IDENTIFIER || !nodeMap.has(elementKey)) {
        return null; // No element found or invalid key.
    }
    return nodeMap.get(elementKey);
}

/**
 * Recursively updates the parent pointers for a given child node and its descendants.
 * This function ensures that each node correctly references its immediate parent.
 *
 * @param {number} currentChildId The identifier of the child node whose parent needs to be set.
 * @param {number} newParentId The identifier of the node that will become the parent.
 * @param {Map<number, object>} allTreeNodes The comprehensive collection of all tree nodes.
 * @returns {void}
 */
function reassignParents(currentChildId, newParentId, allTreeNodes) {
    // Retrieve the target node for parent assignment.
    const targetNode = fetchTreeElementById(currentChildId, allTreeNodes);

    // If the child node does not exist or is invalid, there's nothing to do.
    if (targetNode === null) {
        return;
    }

    // Set the parent property of the current node.
    targetNode.parentNodeId = newParentId;

    // Recursively call for the left subtree, if it exists.
    const leftBranchId = targetNode.leftNode;
    if (leftBranchId !== INVALID_NODE_IDENTIFIER) {
        reassignParents(leftBranchId, targetNode.nodeId, allTreeNodes);
    }

    // Recursively call for the right subtree, if it exists.
    const rightBranchId = targetNode.rightNode;
    if (rightBranchId !== INVALID_NODE_IDENTIFIER) {
        reassignParents(rightBranchId, targetNode.nodeId, allTreeNodes);
    }
}

/**
 * Performs a Preorder traversal (Root -> Left -> Right) of the binary tree.
 * The identifiers of visited nodes are appended to the result buffer.
 *
 * @param {number} currentElementId The identifier of the current node to visit.
 * @param {Array<number>} traversalBuffer An array to store the sequence of visited node IDs.
 * @param {Map<number, object>} sourceNodes The collection of all tree nodes.
 * @returns {void}
 */
function traversePreOrder(currentElementId, traversalBuffer, sourceNodes) {
    // Base case: if the current element is invalid or not found, stop recursion.
    if (currentElementId === INVALID_NODE_IDENTIFIER || !sourceNodes.has(currentElementId)) {
        return;
    }

    // Retrieve the node object.
    const currentElement = sourceNodes.get(currentElementId);

    // Visit the root (current node) first.
    traversalBuffer.push(currentElement.nodeId);

    // Then traverse the left subtree.
    traversePreOrder(currentElement.leftNode, traversalBuffer, sourceNodes);

    // Finally, traverse the right subtree.
    traversePreOrder(currentElement.rightNode, traversalBuffer, sourceNodes);
}

/**
 * Performs an Inorder traversal (Left -> Root -> Right) of the binary tree.
 * The identifiers of visited nodes are appended to the result buffer.
 *
 * @param {number} currentElementId The identifier of the current node to visit.
 * @param {Array<number>} traversalBuffer An array to store the sequence of visited node IDs.
 * @param {Map<number, object>} sourceNodes The collection of all tree nodes.
 * @returns {void}
 */
function traverseInOrder(currentElementId, traversalBuffer, sourceNodes) {
    // Base case: if the current element is invalid or not found, stop recursion.
    if (currentElementId === INVALID_NODE_IDENTIFIER || !sourceNodes.has(currentElementId)) {
        return;
    }

    // Retrieve the node object.
    const currentElement = sourceNodes.get(currentElementId);

    // Traverse the left subtree first.
    traverseInOrder(currentElement.leftNode, traversalBuffer, sourceNodes);

    // Visit the root (current node).
    traversalBuffer.push(currentElement.nodeId);

    // Then traverse the right subtree.
    traverseInOrder(currentElement.rightNode, traversalBuffer, sourceNodes);
}

/**
 * Performs a Postorder traversal (Left -> Right -> Root) of the binary tree.
 * The identifiers of visited nodes are appended to the result buffer.
 *
 * @param {number} currentElementId The identifier of the current node to visit.
 * @param {Array<number>} traversalBuffer An array to store the sequence of visited node IDs.
 * @param {Map<number, object>} sourceNodes The collection of all tree nodes.
 * @returns {void}
 */
function traversePostOrder(currentElementId, traversalBuffer, sourceNodes) {
    // Base case: if the current element is invalid or not found, stop recursion.
    if (currentElementId === INVALID_NODE_IDENTIFIER || !sourceNodes.has(currentElementId)) {
        return;
    }

    // Retrieve the node object.
    const currentElement = sourceNodes.get(currentElementId);

    // Traverse the left subtree first.
    traversePostOrder(currentElement.leftNode, traversalBuffer, sourceNodes);

    // Then traverse the right subtree.
    traversePostOrder(currentElement.rightNode, traversalBuffer, sourceNodes);

    // Finally, visit the root (current node).
    traversalBuffer.push(currentElement.nodeId);
}

// Main execution block for processing tree data and performing traversals.
(() => {
    // Load raw input data from standard input.
    const fileSystem = require('fs');
    const rawInputData = fileSystem.readFileSync('/dev/stdin', 'utf8');

    // Process input lines, splitting by newline and filtering out empty lines.
    const processedInputLines = rawInputData
        .trim()
        .split('\n')
        .filter(line => line.length > 0);

    // The first line contains the total number of nodes.
    const totalNodeCount = parseInt(processedInputLines.shift(), 10);

    // Initialize a Map to store tree nodes for efficient lookup by ID.
    // Key: Node ID (number), Value: Node object.
    const binaryTreeNodes = new Map();

    // Parse each subsequent line to construct node objects.
    for (let currentLineIndex = 0; currentLineIndex < totalNodeCount; currentLineIndex++) {
        const nodeDataParts = processedInputLines.shift().split(' ');

        // Basic validation for input format.
        if (nodeDataParts.length !== 3) {
            console.error(`Error: Invalid node data format on line ${currentLineIndex + 2}. Skipping.`);
            continue;
        }

        // Convert string parts to numbers.
        const nodeIdValue = parseInt(nodeDataParts[0], 10);
        const leftChildId = parseInt(nodeDataParts[1], 10);
        const rightChildId = parseInt(nodeDataParts[2], 10);

        // Create a new node object and store it in the map.
        // Initialize parentNodeId to the sentinel value, it will be updated later.
        binaryTreeNodes.set(nodeIdValue, {
            nodeId: nodeIdValue,
            leftNode: leftChildId,
            rightNode: rightChildId,
            parentNodeId: INVALID_NODE_IDENTIFIER // Default parent is invalid until assigned.
        });
    }

    // After all nodes are parsed, iterate through them to establish parent-child relationships.
    // This loop ensures that the 'parentNodeId' property is correctly set for all children.
    for (const [nodeIdentifier, currentNodeObject] of binaryTreeNodes.entries()) {
        const leftChild = fetchTreeElementById(currentNodeObject.leftNode, binaryTreeNodes);
        if (leftChild !== null) {
            leftChild.parentNodeId = currentNodeObject.nodeId;
        }

        const rightChild = fetchTreeElementById(currentNodeObject.rightNode, binaryTreeNodes);
        if (rightChild !== null) {
            rightChild.parentNodeId = currentNodeObject.nodeId;
        }
    }

    // Identify the root of the tree. The root is the node whose parentNodeId remains -1.
    let mainRootNode = null;
    for (const nodeCandidate of binaryTreeNodes.values()) {
        if (nodeCandidate.parentNodeId === INVALID_NODE_IDENTIFIER) {
            mainRootNode = nodeCandidate;
            break; // Found the root, exit loop.
        }
    }

    // If no root is found, it indicates an error in the tree structure (e.g., empty tree or cycle).
    if (mainRootNode === null && totalNodeCount > 0) {
        console.error("Error: Could not determine the root node of the tree.");
        return; // Exit if no root is found for a non-empty tree.
    } else if (mainRootNode === null && totalNodeCount === 0) {
        // Handle empty tree case gracefully.
        console.log("The tree is empty. No traversals to perform.");
        return;
    }

    // --- Perform and display tree traversals ---

    let collectedIds = []; // Buffer for collecting node IDs during traversal.

    // Preorder Traversal
    traversePreOrder(mainRootNode.nodeId, collectedIds, binaryTreeNodes);
    console.log('Preorder Traversal:');
    console.log(` ${collectedIds.join(' ')}`);

    // Reset buffer for the next traversal.
    collectedIds = [];

    // Inorder Traversal
    traverseInOrder(mainRootNode.nodeId, collectedIds, binaryTreeNodes);
    console.log('\nInorder Traversal:');
    console.log(` ${collectedIds.join(' ')}`);

    // Reset buffer for the next traversal.
    collectedIds = [];

    // Postorder Traversal
    traversePostOrder(mainRootNode.nodeId, collectedIds, binaryTreeNodes);
    console.log('\nPostorder Traversal:');
    console.log(` ${collectedIds.join(' ')}\n`);

})(); // Self-invoking function to encapsulate the main logic.