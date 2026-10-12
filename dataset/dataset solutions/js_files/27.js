function isValidBinarySearchTree(root) {
    const orderedValues = [];

    function traverseInOrder(node) {
        if (node === null) {
            return;
        }

        traverseInOrder(node.left);
        orderedValues.push(node.value);
        traverseInOrder(node.right);
    }

    traverseInOrder(root);

    for (
        let position = 1;
        position < orderedValues.length;
        position++
    ) {
        if (
            orderedValues[position] <=
            orderedValues[position - 1]
        ) {
            return false;
        }
    }

    return true;
}