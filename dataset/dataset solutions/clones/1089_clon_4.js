class BinaryTreeNode {
    constructor(idValue, leftId, rightId) {
        this.id = idValue;
        this.leftChild = leftId;
        this.rightChild = rightId;
        this.isRootCandidate = true;
    }
}

const sourceSystem = require('fs');
const inputSettings = {
    sourcePath: '/dev/stdin',
    lineBreak: '\n'
};

let rawData = sourceSystem.readFileSync(inputSettings.sourcePath, 'ascii')
    .trim()
    .split(inputSettings.lineBreak);

rawData.shift();

const nodeRegistry = new Map();

rawData.forEach(entry => {
    const parts = entry.split(' ');
    const currentId = parts[0];
    const leftRef = parts[1];
    const rightRef = parts[2];

    if (!nodeRegistry.has(currentId)) {
        nodeRegistry.set(currentId, new BinaryTreeNode(currentId, leftRef, rightRef));
    } else {
        const existingNode = nodeRegistry.get(currentId);
        existingNode.leftChild = leftRef;
        existingNode.rightChild = rightRef;
    }

    if (leftRef !== '-1') {
        if (!nodeRegistry.has(leftRef)) {
            nodeRegistry.set(leftRef, new BinaryTreeNode(leftRef, '-1', '-1'));
        }
        nodeRegistry.get(leftRef).isRootCandidate = false;
    }
    if (rightRef !== '-1') {
        if (!nodeRegistry.has(rightRef)) {
            nodeRegistry.set(rightRef, new BinaryTreeNode(rightRef, '-1', '-1'));
        }
        nodeRegistry.get(rightRef).isRootCandidate = false;
    }
});

let mainRootIdentifier = null;
for (const [identifier, nodeObj] of nodeRegistry.entries()) {
    if (nodeObj.isRootCandidate) {
        mainRootIdentifier = identifier;
        break;
    }
}

function retrievePreorder(startNodeId) {
    const sequence = [];
    const processingStack = [];
    if (startNodeId === '-1') return sequence;

    processingStack.push(startNodeId);

    while (processingStack.length > 0) {
        const currentId = processingStack.pop();
        if (currentId === '-1') continue;

        sequence.push(currentId);
        const currentNode = nodeRegistry.get(currentId);

        if (currentNode.rightChild !== '-1') {
            processingStack.push(currentNode.rightChild);
        }
        if (currentNode.leftChild !== '-1') {
            processingStack.push(currentNode.leftChild);
        }
    }
    return sequence;
}

function retrieveInorder(startNodeId) {
    const sequence = [];
    const processingStack = [];
    let currentPointerId = startNodeId;

    while (currentPointerId !== '-1' || processingStack.length > 0) {
        while (currentPointerId !== '-1') {
            processingStack.push(currentPointerId);
            const node = nodeRegistry.get(currentPointerId);
            currentPointerId = node.leftChild;
        }

        const processedId = processingStack.pop();
        sequence.push(processedId);
        const processedNode = nodeRegistry.get(processedId);
        currentPointerId = processedNode.rightChild;
    }
    return sequence;
}

function retrievePostorder(startNodeId) {
    const sequence = [];
    const stackOne = [];
    const stackTwo = [];
    if (startNodeId === '-1') return sequence;

    stackOne.push(startNodeId);

    while (stackOne.length > 0) {
        const currentId = stackOne.pop();
        if (currentId === '-1') continue;

        stackTwo.push(currentId);
        const currentNode = nodeRegistry.get(currentId);

        if (currentNode.leftChild !== '-1') {
            stackOne.push(currentNode.leftChild);
        }
        if (currentNode.rightChild !== '-1') {
            stackOne.push(currentNode.rightChild);
        }
    }

    while (stackTwo.length > 0) {
        sequence.push(stackTwo.pop());
    }
    return sequence;
}

const outputChannel = console;

outputChannel.log('Preorder');
outputChannel.log(retrievePreorder(mainRootIdentifier).join(' '));

outputChannel.log('Inorder');
outputChannel.log(retrieveInorder(mainRootIdentifier).join(' '));

outputChannel.log('Postorder');
outputChannel.log(retrievePostorder(mainRootIdentifier).join(' '));