function isValidBinarySearchTree(root) {
    if (root === null) {
        return true;
    }

    const pendingNodes = [];

    let currentNode = root;
    let previousValue = null;
    let previousValueExists = false;

    while (
        currentNode !== null ||
        pendingNodes.length > 0
    ) {
        while (currentNode !== null) {
            pendingNodes.push(currentNode);
            currentNode = currentNode.left;
        }

        currentNode = pendingNodes.pop();

        if (
            previousValueExists &&
            currentNode.value <= previousValue
        ) {
            return false;
        }

        previousValue = currentNode.value;
        previousValueExists = true;

        currentNode = currentNode.right;
    }

    return true;
}