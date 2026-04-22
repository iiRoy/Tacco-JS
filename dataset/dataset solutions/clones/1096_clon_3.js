function processInput(rawInputText) {
    // This function orchestrates the reconstruction of a binary tree
    // from its preorder and inorder traversals, then performs a postorder walk.

    if (typeof rawInputText !== 'string' || rawInputText.trim() === '') {
        console.error("Error: Empty or invalid input provided.");
        return;
    }

    // Process raw input lines, filtering out any empty lines that might occur.
    const inputLines = rawInputText.split('\n').filter(line => line.trim() !== '');

    // Extract the total count of nodes for the tree.
    let treeSize = parseInt(inputLines.shift(), 10);
    if (isNaN(treeSize) || treeSize <= 0) {
        console.error("Error: Tree size must be a positive integer.");
        return;
    }

    // Parse the preorder sequence, converting string elements to numbers.
    const preOrderSequence = inputLines.shift().split(' ').map(Number);
    // Parse the inorder sequence, converting string elements to numbers.
    const inOrderSequence = inputLines.shift().split(' ').map(Number);

    // Validate if the lengths of the sequences match the declared tree size.
    if (preOrderSequence.length !== treeSize || inOrderSequence.length !== treeSize) {
        console.error("Error: Mismatch between declared tree size and sequence lengths.");
        return;
    }

    // Initialize a registry to store tree node information.
    // Each entry will hold [nodeValue, leftChildValue, rightChildValue].
    // We use an array indexed by node value for quick lookups.
    const nodeRegistry = [];
    for (let k = 0; k <= treeSize; ++k) {
        // Initialize all potential node entries with default values.
        // -1 signifies a null child.
        nodeRegistry[k] = [k, -1, -1];
    }

    // The first element of the preorder sequence is always the root of the entire tree.
    const initialNodeVal = preOrderSequence[0];
    if (initialNodeVal === undefined) {
        console.error("Error: Preorder sequence is empty, cannot determine root.");
        return;
    }

    // Recursively build the tree structure by populating the nodeRegistry.
    // We start with the full preorder and inorder sequences.
    buildTreeStructure(0, preOrderSequence, inOrderSequence, nodeRegistry);

    // Prepare an array to collect the nodes during the postorder traversal.
    const traversalResult = [];

    // Perform a postorder traversal on the constructed tree.
    traversePostOrder(nodeRegistry, initialNodeVal, traversalResult);

    // Output the collected postorder traversal sequence.
    process.stdout.write(traversalResult.join(' ') + '\n');
}

/**
 * Recursively constructs the binary tree structure based on preorder and inorder traversals.
 *
 * @param {number} preIndex      The current index in the preorder array, pointing to the root of the current subtree.
 * @param {number[]} preOrderArray   The complete preorder traversal array.
 * @param {number[]} inOrderSlice    The inorder traversal slice corresponding to the current subtree.
 * @param {Array<Array<number>>} registryRef The global registry storing node information.
 */
function buildTreeStructure(preIndex, preOrderArray, inOrderSlice, registryRef) {
    // Guard against empty inorder slices, indicating an empty subtree.
    if (!inOrderSlice || inOrderSlice.length === 0) {
        return;
    }

    // The current node's value is determined by the preIndex in the preorder array.
    const currentNodeValue = preOrderArray[preIndex];
    if (currentNodeValue === undefined) {
        // This indicates an issue if preIndex is out of bounds for the preOrderArray.
        return;
    }

    // Retrieve the entry for the current node from the registry.
    const currentEntry = registryRef[currentNodeValue];

    // If the inorder slice contains only one element, it's a leaf node.
    // Its children are already initialized to -1, so no further action needed for children.
    if (inOrderSlice.length === 1) {
        currentEntry[1] = -1; // Explicitly set left child to null
        currentEntry[2] = -1; // Explicitly set right child to null
        return;
    }

    // Find the position of the current node in the inorder slice.
    // This split point divides the inorder slice into left and right subtrees.
    const splitPoint = inOrderSlice.indexOf(currentNodeValue);

    // Basic validation: the current node *must* be found in its corresponding inorder slice.
    if (splitPoint === -1) {
        console.warn(`Warning: Node ${currentNodeValue} not found in its inorder slice.`);
        return; // Or throw an error, depending on error handling strategy.
    }

    // Divide the inorder slice into left and right sub-slices.
    const leftInOrder = inOrderSlice.slice(0, splitPoint);
    const rightInOrder = inOrderSlice.slice(splitPoint + 1);

    // --- Process the left subtree ---
    if (leftInOrder.length > 0) {
        // Find the root of the left subtree from the preorder array.
        // This is the first element in the preorder array that is also present in the left inorder slice.
        let nextLeftRootVal = -1;
        for (let val of preOrderArray) {
            if (leftInOrder.includes(val)) {
                nextLeftRootVal = val;
                break; // Found the root of the left subtree.
            }
        }

        if (nextLeftRootVal !== -1) {
            currentEntry[1] = nextLeftRootVal; // Set left child.
            // Determine the preorder index for the left child's root.
            const nextPreOrderIdx = preOrderArray.indexOf(nextLeftRootVal);
            // Recursively build the left subtree.
            buildTreeStructure(nextPreOrderIdx, preOrderArray, leftInOrder, registryRef);
        } else {
            currentEntry[1] = -1; // No left child if no root found.
        }
    } else {
        currentEntry[1] = -1; // No left subtree.
    }

    // --- Process the right subtree ---
    if (rightInOrder.length > 0) {
        // Find the root of the right subtree from the preorder array.
        let nextRightRootVal = -1;
        for (let val of preOrderArray) {
            if (rightInOrder.includes(val)) {
                nextRightRootVal = val;
                break; // Found the root of the right subtree.
            }
        }

        if (nextRightRootVal !== -1) {
            currentEntry[2] = nextRightRootVal; // Set right child.
            // Determine the preorder index for the right child's root.
            const nextPreOrderIdx = preOrderArray.indexOf(nextRightRootVal);
            // Recursively build the right subtree.
            buildTreeStructure(nextPreOrderIdx, preOrderArray, rightInOrder, registryRef);
        } else {
            currentEntry[2] = -1; // No right child if no root found.
        }
    } else {
        currentEntry[2] = -1; // No right subtree.
    }
}

/**
 * Performs a postorder traversal of the tree and collects node values.
 *
 * @param {Array<Array<number>>} nodeLookup    The global registry of tree nodes.
 * @param {number} currentNodeId The ID of the current node to visit.
 * @param {number[]} traversalResult The array to accumulate the postorder sequence.
 */
function traversePostOrder(nodeLookup, currentNodeId, traversalResult) {
    // Base case: If the current node ID is invalid or represents a null child (-1),
    // or if the registry itself is invalid, stop the recursion.
    if (!nodeLookup || !Array.isArray(nodeLookup) || currentNodeId === -1 ||
        currentNodeId >= nodeLookup.length || !nodeLookup[currentNodeId]) {
        return;
    }

    // Retrieve the current node's information from the lookup table.
    const currentChildren = nodeLookup[currentNodeId];

    // Recursively traverse the left child first.
    traversePostOrder(nodeLookup, currentChildren[1], traversalResult);

    // Then, recursively traverse the right child.
    traversePostOrder(nodeLookup, currentChildren[2], traversalResult);

    // Finally, visit (add) the current node's value to the result array.
    traversalResult.push(currentChildren[0]);
}

// Entry point: Read input from standard input and start the process.
processInput(require('fs').readFileSync('/dev/stdin', 'utf8'));