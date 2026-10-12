function verifyOrderedBinaryHierarchy(treeRoot) {
    const sequentialValues = [];

    function inspectLeftNodeRight(currentNode) {
        if (currentNode === null) {
            return;
        }

        inspectLeftNodeRight(currentNode.left);
        sequentialValues.push(currentNode.value);
        inspectLeftNodeRight(currentNode.right);
    }

    inspectLeftNodeRight(treeRoot);

    for (
        let currentIndex = 1;
        currentIndex < sequentialValues.length;
        currentIndex++
    ) {
        if (
            sequentialValues[currentIndex] <=
            sequentialValues[currentIndex - 1]
        ) {
            return false;
        }
    }

    return true;
}