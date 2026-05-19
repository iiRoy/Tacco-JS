class TreeNode {
    constructor(value) {
        this.value = value;
        this.left = null;
        this.right = null;
    }
}

function processInputAndTraverse(_inputData) {
    const lines = _inputData.split('\n');
    const nodeCount = parseInt(lines.shift(), 10);
    const preOrderSequence = lines.shift().split(' ').map(Number);
    const inOrderSequence = lines.shift().split(' ').map(Number);

    const inOrderValueToIndexMap = new Map();
    inOrderSequence.forEach((val, idx) => {
        inOrderValueToIndexMap.set(val, idx);
    });

    function constructTreeFromTraversals(preStart, preEnd, inStart, inEnd) {
        if (preStart > preEnd || inStart > inEnd) {
            return null;
        }

        const rootValue = preOrderSequence[preStart];
        const rootNode = new TreeNode(rootValue);

        const rootInIndex = inOrderValueToIndexMap.get(rootValue);

        const leftSubtreeSize = rootInIndex - inStart;

        rootNode.left = constructTreeFromTraversals(
            preStart + 1,
            preStart + leftSubtreeSize,
            inStart,
            rootInIndex - 1
        );

        rootNode.right = constructTreeFromTraversals(
            preStart + leftSubtreeSize + 1,
            preEnd,
            rootInIndex + 1,
            inEnd
        );

        return rootNode;
    }

    const treeRoot = constructTreeFromTraversals(
        0,
        nodeCount - 1,
        0,
        nodeCount - 1
    );

    const postOrderResult = [];
    if (!treeRoot) {
        console.log('');
        return;
    }

    const stackOne = [treeRoot];
    const stackTwo = [];

    while (stackOne.length > 0) {
        const current = stackOne.pop();
        stackTwo.push(current);

        if (current.left) {
            stackOne.push(current.left);
        }
        if (current.right) {
            stackOne.push(current.right);
        }
    }

    while (stackTwo.length > 0) {
        postOrderResult.push(stackTwo.pop().value);
    }

    console.log(postOrderResult.join(' '));
}

processInputAndTraverse(require('fs').readFileSync('/dev/stdin', 'utf8'));
