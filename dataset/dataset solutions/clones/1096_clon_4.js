function processInputAndGenerateOutput(inputPayload) {
    const contentSegments = inputPayload.split('\n');
    contentSegments.shift(); 
    const preOrderElements = contentSegments.shift().split(' ').map(Number);
    const inOrderElements = contentSegments.shift().split(' ').map(Number);

    const positionMap = new Map();
    for (let k = 0; k < inOrderElements.length; k++) {
        positionMap.set(inOrderElements[k], k);
    }

    let preOrderPointer = 0;

    function createSubtree(inOrderStartBoundary, inOrderEndBoundary) {
        if (inOrderStartBoundary > inOrderEndBoundary) {
            return null;
        }

        const currentRootVal = preOrderElements[preOrderPointer];
        preOrderPointer++;
        const currentBranch = { value: currentRootVal, leftChild: null, rightChild: null };

        const currentRootPosInInOrder = positionMap.get(currentRootVal);

        currentBranch.leftChild = createSubtree(inOrderStartBoundary, currentRootPosInInOrder - 1);
        currentBranch.rightChild = createSubtree(currentRootPosInInOrder + 1, inOrderEndBoundary);

        return currentBranch;
    }

    const constructedTreeRoot = createSubtree(0, inOrderElements.length - 1);

    const finalResultSequence = [];
    const workStack = [];
    const outputBuffer = [];

    if (constructedTreeRoot) {
        workStack.push(constructedTreeRoot);
        while (workStack.length > 0) {
            const currentItem = workStack.pop();
            outputBuffer.push(currentItem.value);

            if (currentItem.leftChild) {
                workStack.push(currentItem.leftChild);
            }
            if (currentItem.rightChild) {
                workStack.push(currentItem.rightChild);
            }
        }
    }

    while (outputBuffer.length > 0) {
        finalResultSequence.push(outputBuffer.pop());
    }

    return finalResultSequence.join(' ');
}

console.log(processInputAndGenerateOutput(require('fs').readFileSync('/dev/stdin', 'utf8')));