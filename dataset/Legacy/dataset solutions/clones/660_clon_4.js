let rawInputData = '';
process.stdin.resume();
process.stdin.setEncoding('utf8');
process.stdin.on('data', function(chunk) {
    rawInputData += chunk;
});
process.stdin.on('end', function() {
    const inputLines = rawInputData.split('\n');

    // Tree representation: plain objects { leftChild: null, rightChild: null }

    function parseTreeString(treeText) {
        const sentinelRoot = { leftChild: null, rightChild: null };
        let activeNode = sentinelRoot;
        let childSlot = 'leftChild';

        const nodeStack = [];

        for (const char of treeText) {
            if (char === '(') {
                const freshNode = { leftChild: null, rightChild: null };
                activeNode[childSlot] = freshNode;
                nodeStack.push(activeNode);
                activeNode = freshNode;
                childSlot = 'leftChild';
            } else if (char === ',') {
                childSlot = 'rightChild';
            } else if (char === ')') {
                if (nodeStack.length > 0) {
                    activeNode = nodeStack.pop();
                }
            }
        }
        return sentinelRoot.leftChild;
    }

    function combineTreesIterative(firstTree, secondTree) {
        if (firstTree === null) return secondTree;
        if (secondTree === null) return firstTree;

        const finalResult = { leftChild: null, rightChild: null };
        const traversalStack = [{
            a: firstTree,
            b: secondTree,
            resParent: finalResult,
            resKey: 'leftChild'
        }];

        while (traversalStack.length > 0) {
            const { a, b, resParent, resKey } = traversalStack.pop();

            let currentResultNode = null;
            if (a === null) {
                currentResultNode = b;
            } else if (b === null) {
                currentResultNode = a;
            } else {
                currentResultNode = { leftChild: null, rightChild: null };
                traversalStack.push({
                    a: a.rightChild,
                    b: b.rightChild,
                    resParent: currentResultNode,
                    resKey: 'rightChild'
                });
                traversalStack.push({
                    a: a.leftChild,
                    b: b.leftChild,
                    resParent: currentResultNode,
                    resKey: 'leftChild'
                });
            }
            resParent[resKey] = currentResultNode;
        }
        return finalResult.leftChild;
    }

    function findCommonTreesIterative(firstTree, secondTree) {
        if (firstTree === null || secondTree === null) return null;

        const finalResult = { leftChild: null, rightChild: null };
        const traversalStack = [{
            a: firstTree,
            b: secondTree,
            resParent: finalResult,
            resKey: 'leftChild'
        }];

        while (traversalStack.length > 0) {
            const { a, b, resParent, resKey } = traversalStack.pop();

            let currentResultNode = null;
            if (a === null || b === null) {
                currentResultNode = null;
            } else {
                currentResultNode = { leftChild: null, rightChild: null };
                traversalStack.push({
                    a: a.rightChild,
                    b: b.rightChild,
                    resParent: currentResultNode,
                    resKey: 'rightChild'
                });
                traversalStack.push({
                    a: a.leftChild,
                    b: b.leftChild,
                    resParent: currentResultNode,
                    resKey: 'leftChild'
                });
            }
            resParent[resKey] = currentResultNode;
        }
        return finalResult.leftChild;
    }

    // This function is defined but not used in the main loop, just like original Node.toString()
    function serializeTree(treeObject) {
        if (treeObject === null) {
            return '';
        }
        const leftPart = treeObject.leftChild === null ? '' : serializeTree(treeObject.leftChild);
        const rightPart = treeObject.rightChild === null ? '' : serializeTree(treeObject.rightChild);
        return `(${leftPart},${rightPart})`;
    }

    for (const currentInput of inputLines) {
        const [operationType, treeStringA, treeStringB] = currentInput.split(' ');
        const parsedTreeA = parseTreeString(treeStringA);
        const parsedTreeB = parseTreeString(treeStringB);
        let operationResult;
        if (operationType === "u") {
            operationResult = combineTreesIterative(parsedTreeA, parsedTreeB);
        } else if (operationType === "i") {
            operationResult = findCommonTreesIterative(parsedTreeA, parsedTreeB);
        }
        // No output, preserving original behavior.
    }
});
