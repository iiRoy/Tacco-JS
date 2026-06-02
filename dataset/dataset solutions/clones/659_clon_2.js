let rawInputData = '';
process.stdin.resume();
process.stdin.setEncoding('utf8');

process.stdin.on('data', function(chunkOfData) {
    rawInputData += chunkOfData;
});

process.stdin.on('end', function() {
    const processedLines = rawInputData.split('\n');

    class BinaryTreeNode {
        constructor() {
            this.leftChild = null;
            this.rightChild = null;
            this.parentNode = null;
        }

        attachLeft(childNode) {
            this.leftChild = childNode;
            childNode.parentNode = this;
        }

        attachRight(childNode) {
            this.rightChild = childNode;
            childNode.parentNode = this;
        }

        toString() {
            return `(${this.leftChild == null ? '' : this.leftChild.toString()},${this.rightChild == null ? '' : this.rightChild.toString()})`;
        }
    }

    const buildTreeFromString = treeStringRepresentation => {
        const initialNode = new BinaryTreeNode();
        let currentNodePointer = initialNode;
        let separatorFlag = 0;
        for (const charToken of treeStringRepresentation) {
            if (charToken === "(") {
                const newNodeInstance = new BinaryTreeNode();
                if (separatorFlag === 0) currentNodePointer.attachLeft(newNodeInstance);
                else currentNodePointer.attachRight(newNodeInstance);
                currentNodePointer = newNodeInstance;
            }
            if (charToken === ",") separatorFlag = 1;
            if (charToken === ")") {
                currentNodePointer = currentNodePointer.parentNode;
                separatorFlag = 0;
            }
        }
        return initialNode.leftChild;
    };

    const combineTrees = (firstTree, secondTree) => {
        const resultNode = new BinaryTreeNode();
        if (firstTree === null) return secondTree;
        if (secondTree === null) return firstTree;
        let recursiveResult = combineTrees(firstTree.leftChild, secondTree.leftChild);
        if (recursiveResult !== null) resultNode.attachLeft(recursiveResult);
        recursiveResult = combineTrees(firstTree.rightChild, secondTree.rightChild);
        if (recursiveResult !== null) resultNode.attachRight(recursiveResult);
        return resultNode;
    };

    const findCommonNodes = (firstTree, secondTree) => {
        const resultNode = new BinaryTreeNode();
        if (firstTree === null || secondTree === null) return null;
        let recursiveResult = findCommonNodes(firstTree.leftChild, secondTree.leftChild);
        if (recursiveResult !== null) resultNode.attachLeft(recursiveResult);
        recursiveResult = findCommonNodes(firstTree.rightChild, secondTree.rightChild);
        if (recursiveResult !== null) resultNode.attachRight(recursiveResult);
        return resultNode;
    };

    for (const currentLine of processedLines) {
        const [operationType, firstTreeString, secondTreeString] = currentLine.split(' ');
        const parsedTreeOne = buildTreeFromString(firstTreeString);
        const parsedTreeTwo = buildTreeFromString(secondTreeString);
        let finalResultTree;
        if (operationType === "u") {
            finalResultTree = combineTrees(parsedTreeOne, parsedTreeTwo);
        } else if (operationType === "i") {
            finalResultTree = findCommonNodes(parsedTreeOne, parsedTreeTwo);
        }
        console.log(finalResultTree.toString());
    }
});
