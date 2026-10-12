function processInput(rawInputString) {
    // Split the entire input string into individual lines.
    const inputLines = rawInputString.split('\n');

    // Parse the first line to get the total number of nodes.
    const nodeCount = parseInt(inputLines.shift(), 10);

    // Parse the second line for the preorder traversal sequence.
    const preorderTraversal = inputLines.shift().split(' ').map(item => parseInt(item, 10));

    // Parse the third line for the inorder traversal sequence.
    const inorderTraversal = inputLines.shift().split(' ').map(item => parseInt(item, 10));

    // Initialize an array to store node details: [nodeId, leftChildId, rightChildId].
    // The index of the array corresponds to the nodeId.
    const nodeDetails = [];
    // Initialize an array to store the postorder traversal result.
    const postorderResult = [];

    // Populate the nodeDetails array with initial values.
    // Each node entry is [itself, -1 (left child), -1 (right child)].
    for (let k = 0; k < nodeCount + 1; k++) {
        // The first element (index 0) is not used for actual nodes, but initialized for consistency.
        if (k === 0) {
            nodeDetails[k] = 0; // Placeholder, actual nodes start from 1.
        }
        nodeDetails[k] = [k, -1, -1];
    }

    // Recursively build the binary tree structure using preorder and inorder traversals.
    buildTreeStructure(0, preorderTraversal, inorderTraversal, nodeDetails);

    // The root of the tree is the first element in the preorder traversal.
    const treeRootId = preorderTraversal[0];

    // Perform a postorder traversal on the constructed tree and store the result.
    performPostorderTraversal(nodeDetails, treeRootId, postorderResult);

    // Output the postorder traversal sequence, space-separated.
    console.log(postorderResult.join(' '));
}

/**
 * Recursively constructs the binary tree by determining left and right children.
 * @param {number} preorderIndex - The current index in the preorder traversal array.
 * @param {number[]} currentPreorder - The current segment of the preorder traversal.
 * @param {number[]} currentInorder - The current segment of the inorder traversal.
 * @param {Array<Array<number>>} nodeDetails - The array storing [nodeId, leftChildId, rightChildId] for each node.
 */
function buildTreeStructure(preorderIndex, currentPreorder, currentInorder, nodeDetails) {
    // The current root node's ID is found at the given preorder index.
    const currentRootId = currentPreorder[preorderIndex];
    // Get the data entry for the current root node.
    const currentNodeData = nodeDetails[currentRootId];

    // Base case: If the inorder segment has only one element, it's a leaf node.
    // It has no children, so set children to -1 and return.
    if (currentInorder.length === 1) {
        currentNodeData[1] = -1; // No left child
        currentNodeData[2] = -1; // No right child
        return;
    }

    // Find the position of the current root node in the inorder traversal.
    // This position splits the inorder array into left and right subtrees.
    let splitPoint;
    for (let k = 0, inorderLength = currentInorder.length; k < inorderLength; k++) {
        if (currentInorder[k] === currentRootId) {
            splitPoint = k;
            break; // Found the split point, exit loop.
        }
    }

    // Extract the left and right subtrees from the inorder traversal.
    const leftSubtreeInorder = currentInorder.slice(0, splitPoint);
    const rightSubtreeInorder = currentInorder.slice(splitPoint + 1);

    // Process the left subtree if it exists.
    if (leftSubtreeInorder.length) {
        // Filter the preorder traversal to find nodes belonging to the left subtree.
        // The first element of this filtered list is the root of the left subtree.
        const leftSubtreePreorder = currentPreorder.filter(item => leftSubtreeInorder.indexOf(item) > -1);
        currentNodeData[1] = leftSubtreePreorder[0]; // Set left child ID.

        // Find the index of the left child's root in the original preorder array.
        const preorderRootIndex = currentPreorder.indexOf(currentNodeData[1]);
        // Recursively build the left subtree.
        buildTreeStructure(preorderRootIndex, currentPreorder, leftSubtreeInorder, nodeDetails);
    } else {
        // No left subtree, set left child ID to -1.
        currentNodeData[1] = -1;
    }

    // Process the right subtree if it exists.
    if (rightSubtreeInorder.length) {
        // Filter the preorder traversal to find nodes belonging to the right subtree.
        // The first element of this filtered list is the root of the right subtree.
        const rightSubtreePreorder = currentPreorder.filter(item => rightSubtreeInorder.indexOf(item) > -1);
        currentNodeData[2] = rightSubtreePreorder[0]; // Set right child ID.

        // Find the index of the right child's root in the original preorder array.
        const preorderRootIndex = currentPreorder.indexOf(currentNodeData[2]);
        // Recursively build the right subtree.
        buildTreeStructure(preorderRootIndex, currentPreorder, rightSubtreeInorder, nodeDetails);
    } else {
        // No right subtree, set right child ID to -1.
        currentNodeData[2] = -1;
    }
}

/**
 * Performs a postorder traversal of the tree and collects node IDs.
 * @param {Array<Array<number>>} treeNodes - The array storing [nodeId, leftChildId, rightChildId] for each node.
 * @param {number} currentNodeId - The ID of the current node being visited.
 * @param {number[]} postorderResult - The array to accumulate the postorder traversal sequence.
 */
function performPostorderTraversal(treeNodes, currentNodeId, postorderResult) {
    // Base case: If the current node ID is -1 (null child), return.
    if (currentNodeId === -1) {
        return;
    }

    // Recursively visit the left child.
    performPostorderTraversal(treeNodes, treeNodes[currentNodeId][1], postorderResult);
    // Recursively visit the right child.
    performPostorderTraversal(treeNodes, treeNodes[currentNodeId][2], postorderResult);

    // After visiting left and right children, add the current node's ID to the result.
    postorderResult.push(treeNodes[currentNodeId][0]);
}

// Read input from standard input and pass it to the main processing function.
processInput(require('fs').readFileSync('/dev/stdin', 'utf8'));
