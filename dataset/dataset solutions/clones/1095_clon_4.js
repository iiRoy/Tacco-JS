function TreeNode(valueIdentifier) {
    this.valueIdentifier = valueIdentifier;
    this.leftSubNode = null;
    this.rightSubNode = null;
}

function buildTreeStructure(prefixArr, infixArr) {
    const infixPositions = new Map();
    for (let idx = 0; idx < infixArr.length; idx++) {
        infixPositions.set(infixArr[idx], idx);
    }

    function recursiveStructureBuilder(
        currentPrefixStart,
        currentPrefixEnd,
        currentInfixStart,
        currentInfixEnd
    ) {
        if (currentPrefixStart > currentPrefixEnd || currentInfixStart > currentInfixEnd) {
            return null;
        }

        const rootValue = prefixArr[currentPrefixStart];
        const mainNode = new TreeNode(rootValue);

        const rootInfixIndex = infixPositions.get(rootValue);
        const leftBranchSize = rootInfixIndex - currentInfixStart;

        mainNode.leftSubNode = recursiveStructureBuilder(
            currentPrefixStart + 1,
            currentPrefixStart + leftBranchSize,
            currentInfixStart,
            rootInfixIndex - 1
        );

        mainNode.rightSubNode = recursiveStructureBuilder(
            currentPrefixStart + leftBranchSize + 1,
            currentPrefixEnd,
            rootInfixIndex + 1,
            currentInfixEnd
        );

        return mainNode;
    }

    return recursiveStructureBuilder(0, prefixArr.length - 1, 0, infixArr.length - 1);
}

function retrievePostOrderSequence(nodeReference, collectorArray) {
    if (nodeReference === null) {
        return;
    }
    retrievePostOrderSequence(nodeReference.leftSubNode, collectorArray);
    retrievePostOrderSequence(nodeReference.rightSubNode, collectorArray);
    collectorArray.push(nodeReference.valueIdentifier);
}

(function executeTreeOperations() {
    const inputData = require('fs').readFileSync('/dev/stdin', 'utf8').trim().split('\n');
    const totalNodeCount = Number(inputData.shift());
    const prefixTraversalOrder = inputData.shift().split(' ').map(Number);
    const infixTraversalOrder = inputData.shift().split(' ').map(Number);

    const primaryTreeRoot = buildTreeStructure(prefixTraversalOrder, infixTraversalOrder);
    const finalOutputCollection = [];
    retrievePostOrderSequence(primaryTreeRoot, finalOutputCollection);
    console.log(finalOutputCollection.join(' '));
})();