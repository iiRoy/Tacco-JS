const fileSystemModule = require('node:fs');

const inputSourceDetails = { pathString: '/dev/stdin', lineEnd: '\n' };

const rawContent = fileSystemModule.readFileSync(inputSourceDetails.pathString, 'ascii');
const processedLines = rawContent.split(inputSourceDetails.lineEnd).filter(Boolean).slice(1);

const graphMap = new Map();
const descendantRegistry = new Set();
let primaryVertex = null;

for (const currentLine of processedLines) {
    const parts = currentLine.split(' ');
    const centralIdentifier = parts[0];
    const leftSuccessor = parts[1];
    const rightSuccessor = parts[2];

    graphMap.set(centralIdentifier, {
        leftBranch: leftSuccessor === '-1' ? null : leftSuccessor,
        rightBranch: rightSuccessor === '-1' ? null : rightSuccessor
    });

    if (leftSuccessor !== '-1') {
        descendantRegistry.add(leftSuccessor);
    }
    if (rightSuccessor !== '-1') {
        descendantRegistry.add(rightSuccessor);
    }
}

for (const key of graphMap.keys()) {
    if (!descendantRegistry.has(key)) {
        primaryVertex = key;
        break;
    }
}

function traverseFront(initialNodeId, structureMap) {
    const outputSequence = [];
    const workingStack = [];

    if (initialNodeId === null) {
        return outputSequence;
    }

    workingStack.push(initialNodeId);

    while (workingStack.length > 0) {
        const currentId = workingStack.pop();
        outputSequence.push(currentId);

        const currentChildren = structureMap.get(currentId);
        if (currentChildren.rightBranch !== null) {
            workingStack.push(currentChildren.rightBranch);
        }
        if (currentChildren.leftBranch !== null) {
            workingStack.push(currentChildren.leftBranch);
        }
    }
    return outputSequence;
}

function traverseMiddle(initialNodeId, structureMap) {
    const outputSequence = [];
    const workingStack = [];
    let currentId = initialNodeId;

    while (currentId !== null || workingStack.length > 0) {
        while (currentId !== null) {
            workingStack.push(currentId);
            const nodeData = structureMap.get(currentId);
            currentId = nodeData ? nodeData.leftBranch : null;
        }

        currentId = workingStack.pop();
        outputSequence.push(currentId);

        const nodeData = structureMap.get(currentId);
        currentId = nodeData ? nodeData.rightBranch : null;
    }
    return outputSequence;
}

function traverseBack(initialNodeId, structureMap) {
    const outputSequence = [];
    const stackOne = [];
    const stackTwo = [];

    if (initialNodeId === null) {
        return outputSequence;
    }

    stackOne.push(initialNodeId);

    while (stackOne.length > 0) {
        const currentId = stackOne.pop();
        stackTwo.push(currentId);

        const currentChildren = structureMap.get(currentId);
        if (currentChildren.leftBranch !== null) {
            stackOne.push(currentChildren.leftBranch);
        }
        if (currentChildren.rightBranch !== null) {
            stackOne.push(currentChildren.rightBranch);
        }
    }

    while (stackTwo.length > 0) {
        outputSequence.push(stackTwo.pop());
    }
    return outputSequence;
}

console.log('Path A');
console.log(' ' + traverseFront(primaryVertex, graphMap).join(' '));

console.log('Path B');
console.log(' ' + traverseMiddle(primaryVertex, graphMap).join(' '));

console.log('Path C');
console.log(' ' + traverseBack(primaryVertex, graphMap).join(' '));