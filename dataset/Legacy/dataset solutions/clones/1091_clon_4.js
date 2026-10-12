function* obtainPreorderSequence(startIdentifier, nodeMap) {
    if (startIdentifier === -1) return;
    const processingStack = [startIdentifier];
    while (processingStack.length > 0) {
        const currentIdentifier = processingStack.pop();
        yield currentIdentifier;
        const currentObject = nodeMap.get(currentIdentifier);
        if (currentObject.rightChildIdentifier !== -1) {
            processingStack.push(currentObject.rightChildIdentifier);
        }
        if (currentObject.leftChildIdentifier !== -1) {
            processingStack.push(currentObject.leftChildIdentifier);
        }
    }
}

function* obtainInorderSequence(startIdentifier, nodeMap) {
    const processingStack = [];
    let currentIdentifier = startIdentifier;
    while (currentIdentifier !== -1 || processingStack.length > 0) {
        while (currentIdentifier !== -1) {
            processingStack.push(currentIdentifier);
            currentIdentifier = nodeMap.get(currentIdentifier).leftChildIdentifier;
        }
        currentIdentifier = processingStack.pop();
        yield currentIdentifier;
        currentIdentifier = nodeMap.get(currentIdentifier).rightChildIdentifier;
    }
}

function* obtainPostorderSequence(startIdentifier, nodeMap) {
    if (startIdentifier === -1) return;
    const stackOne = [startIdentifier];
    const stackTwo = [];
    while (stackOne.length > 0) {
        const currentIdentifier = stackOne.pop();
        stackTwo.push(currentIdentifier);
        const currentObject = nodeMap.get(currentIdentifier);
        if (currentObject.leftChildIdentifier !== -1) {
            stackOne.push(currentObject.leftChildIdentifier);
        }
        if (currentObject.rightChildIdentifier !== -1) {
            stackOne.push(currentObject.rightChildIdentifier);
        }
    }
    while (stackTwo.length > 0) {
        yield stackTwo.pop();
    }
}

var inputData = require('fs').readFileSync('/dev/stdin', 'utf8');
var dataLines = inputData.trim().split('\n');

var nodeCount = +dataLines.shift();

var nodeRegistry = new Map();

for (var i = 0; i < nodeCount; i++) {
    var parts = dataLines.shift().split(' ');
    var identifier = +parts[0];
    var leftId = +parts[1];
    var rightId = +parts[2];

    nodeRegistry.set(identifier, {
        nodeIdentifier: identifier,
        leftChildIdentifier: leftId,
        rightChildIdentifier: rightId,
        parentIdentifier: -1
    });
}

for (const nodeObject of nodeRegistry.values()) {
    if (nodeObject.leftChildIdentifier !== -1) {
        nodeRegistry.get(nodeObject.leftChildIdentifier).parentIdentifier = nodeObject.nodeIdentifier;
    }
    if (nodeObject.rightChildIdentifier !== -1) {
        nodeRegistry.get(nodeObject.rightChildIdentifier).parentIdentifier = nodeObject.nodeIdentifier;
    }
}

var treeRootNode = null;
for (const nodeObject of nodeRegistry.values()) {
    if (nodeObject.parentIdentifier === -1) {
        treeRootNode = nodeObject;
        break;
    }
}

var traversalResult;

traversalResult = [...obtainPreorderSequence(treeRootNode.nodeIdentifier, nodeRegistry)];
console.log('Preorder');
console.log(' ' + traversalResult.join(' '));

traversalResult = [...obtainInorderSequence(treeRootNode.nodeIdentifier, nodeRegistry)];
console.log('Inorder');
console.log(' ' + traversalResult.join(' '));

traversalResult = [...obtainPostorderSequence(treeRootNode.nodeIdentifier, nodeRegistry)];
console.log('Postorder');
console.log(' ' + traversalResult.join(' '));
