function processInput(rawInputString) {
    const inputLines = rawInputString.split('\n');
    const nodeCount = parseInt(inputLines.shift(), 10);
    const preorderTraversal = inputLines.shift().split(' ').map(e => parseInt(e, 10));
    const inorderTraversal = inputLines.shift().split(' ').map(e => parseInt(e, 10));

    const nodeDataStore = [];
    const postorderResult = [];

    // Initialize node data storage with default values
    for (let idx = 0; idx < nodeCount + 1; idx++) {
        nodeDataStore[idx] = [idx, -1, -1]; // [nodeId, leftChildId, rightChildId]
    }

    // Build the tree structure by populating child pointers in nodeDataStore
    buildTreeStructure(0, preorderTraversal, inorderTraversal, nodeDataStore);

    // The root of the tree is always the first element in the preorder traversal
    const rootNodeId = preorderTraversal[0];

    // Perform postorder traversal to get the final sequence
    performPostorderTraversal(nodeDataStore, rootNodeId, postorderResult);

    // Output the postorder sequence
    console.log(postorderResult.join(' '));
}

// Helper function to find the root of a subtree given its preorder and inorder sequences
function findSubtreeRoot(fullPreorder, currentInorderSubarray) {
    if (currentInorderSubarray.length === 0) {
        return -1; // No root for an empty subtree
    }
    // The root of any subtree is the first element in the preorder sequence
    // that is also present in the inorder sequence for that subtree.
    for (const nodeValue of fullPreorder) {
        if (currentInorderSubarray.includes(nodeValue)) {
            return nodeValue;
        }
    }
    return -1; // Should not happen if input is a valid tree
}

function buildTreeStructure(preorderIndex, fullPreorder, inorderSubarray, nodeDataStore) {
    const currentNodeId = fullPreorder[preorderIndex];
    const currentNodeInfo = nodeDataStore[currentNodeId];

    // Base case: If the inorder subarray is empty or contains only one element (a leaf node)
    // then this node has no children.
    if (inorderSubarray.length <= 1) {
        currentNodeInfo[1] = -1; // No left child
        currentNodeInfo[2] = -1; // No right child
        return;
    }

    // Find the current node's position in the inorder subarray to split it into left and right subtrees
    const splitPoint = inorderSubarray.indexOf(currentNodeId);

    const leftSubtreeInorder = inorderSubarray.slice(0, splitPoint);
    const rightSubtreeInorder = inorderSubarray.slice(splitPoint + 1);

    // Determine the root of the left subtree
    const leftChildId = findSubtreeRoot(fullPreorder, leftSubtreeInorder);
    if (leftChildId !== -1) {
        currentNodeInfo[1] = leftChildId;
        const leftChildPreorderIndex = fullPreorder.indexOf(leftChildId);
        buildTreeStructure(leftChildPreorderIndex, fullPreorder, leftSubtreeInorder, nodeDataStore);
    } else {
        currentNodeInfo[1] = -1; // Explicitly set if no left child
    }

    // Determine the root of the right subtree
    const rightChildId = findSubtreeRoot(fullPreorder, rightSubtreeInorder);
    if (rightChildId !== -1) {
        currentNodeInfo[2] = rightChildId;
        const rightChildPreorderIndex = fullPreorder.indexOf(rightChildId);
        buildTreeStructure(rightChildPreorderIndex, fullPreorder, rightSubtreeInorder, nodeDataStore);
    } else {
        currentNodeInfo[2] = -1; // Explicitly set if no right child
    }
}

function performPostorderTraversal(treeNodes, currentNodeId, postorderResult) {
    // Base case: If the current node ID is -1, it means there's no node (null child)
    if (currentNodeId === -1) {
        return;
    }

    // Retrieve the information for the current node
    const currentTreeNode = treeNodes[currentNodeId];

    // Recursively traverse the left subtree
    performPostorderTraversal(treeNodes, currentTreeNode[1], postorderResult);

    // Recursively traverse the right subtree
    performPostorderTraversal(treeNodes, currentTreeNode[2], postorderResult);

    // Add the current node's ID to the result array (postorder: left, right, root)
    postorderResult.push(currentTreeNode[0]);
}

// Read input from stdin and start the process
processInput(require('fs').readFileSync('/dev/stdin', 'utf8'));
