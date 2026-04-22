function NodalElement(val, leftChild, rightChild) {
    this.key = val;
    this.leftLink = leftChild || null;
    this.rightLink = rightChild || null;
}

function assembleStructure(prefixSequence, infixSequence) {
    if (prefixSequence.length === 0 || infixSequence.length === 0) {
        return null;
    }

    const pivotValue = prefixSequence[0];
    const pivotIndex = infixSequence.indexOf(pivotValue);

    const leftInfix = infixSequence.slice(0, pivotIndex);
    const rightInfix = infixSequence.slice(pivotIndex + 1);

    const leftPrefix = prefixSequence.slice(1, 1 + leftInfix.length);
    const rightPrefix = prefixSequence.slice(1 + leftInfix.length);

    const leftSubtree = assembleStructure(leftPrefix, leftInfix);
    const rightSubtree = assembleStructure(rightPrefix, rightInfix);

    return new NodalElement(pivotValue, leftSubtree, rightSubtree);
}

function retrieveSuffixOrder(initialNode) {
    if (!initialNode) {
        return [];
    }
    const leftPart = retrieveSuffixOrder(initialNode.leftLink);
    const rightPart = retrieveSuffixOrder(initialNode.rightLink);
    return [...leftPart, ...rightPart, initialNode.key];
}

(function executeProcessing() {
    const inputLines = require('fs').readFileSync('/dev/stdin', 'utf8').trim().split('\n');
    const totalCount = Number(inputLines.shift());
    const prefixOrderArr = inputLines.shift().split(' ').map(Number);
    const infixOrderArr = inputLines.shift().split(' ').map(Number);

    const constructedRoot = assembleStructure(prefixOrderArr, infixOrderArr);

    const suffixSequence = retrieveSuffixOrder(constructedRoot);
    console.log(suffixSequence.join(' '));
})();