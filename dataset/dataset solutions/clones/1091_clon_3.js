function retrieveNodeById(nodeIdentifier) {
    for (const item of treeNodes) {
        if (item.id === nodeIdentifier) {
            return item;
        }
    }
    return undefined;
}

function assignParentLinks(childNodeId, parentNodeId) {
	const currentNode = retrieveNodeById(childNodeId);
    if (!currentNode) {
        return;
    }
	currentNode.parent = parentNodeId;

	if (currentNode.left !== -1) {
		assignParentLinks(currentNode.left, currentNode.id);
	}
	if (currentNode.right !== -1) {
		assignParentLinks(currentNode.right, currentNode.id);
	}
}

function traversePreOrder(currentId, resultArray) {
	if (currentId === -1) {
		return;
    }
	const currentNode = retrieveNodeById(currentId);
    if (!currentNode) {
        return;
    }
	resultArray.push(currentId);
	traversePreOrder(currentNode.left, resultArray);
	traversePreOrder(currentNode.right, resultArray);
}

function traverseInOrder(currentId, resultArray) {
	if (currentId === -1) {
		return;
    }
	const currentNode = retrieveNodeById(currentId);
    if (!currentNode) {
        return;
    }
	traverseInOrder(currentNode.left, resultArray);
	resultArray.push(currentId);
	traverseInOrder(currentNode.right, resultArray);
}

function traversePostOrder(currentId, resultArray) {
	if (currentId === -1) {
		return;
    }
	const currentNode = retrieveNodeById(currentId);
    if (!currentNode) {
        return;
    }
	traversePostOrder(currentNode.left, resultArray);
	traversePostOrder(currentNode.right, resultArray);
	resultArray.push(currentId);
}

const rawData = require('fs').readFileSync('/dev/stdin', 'utf8');
const inputLines = rawData.trim().split('\n');

const nodeCount = parseInt(inputLines.shift(), 10);

const treeNodes = [];
for (let idx = 0; idx < nodeCount; idx++) {
	const nodeDataParts = inputLines.shift().split(' ');
	const [idStr, leftStr, rightStr] = nodeDataParts;

	const parsedId = parseInt(idStr, 10);
	const leftChildId = parseInt(leftStr, 10);
	const rightChildId = parseInt(rightStr, 10);

	treeNodes.push({id: parsedId, left: leftChildId, right: rightChildId, parent: -1});
}

treeNodes.sort((a, b) => a.id - b.id);

treeNodes.forEach(nodeItem => {
    const currentProcessingNode = nodeItem;
	if (currentProcessingNode.left !== -1) {
		assignParentLinks(currentProcessingNode.left, currentProcessingNode.id);
	}
	if (currentProcessingNode.right !== -1) {
		assignParentLinks(currentProcessingNode.right, currentProcessingNode.id);
	}
});

const treeRootNode = treeNodes.find(nodeItem => nodeItem.parent === -1);

let traversalResult = [];
const PREORDER_LABEL = 'Preorder';
const INORDER_LABEL = 'Inorder';
const POSTORDER_LABEL = 'Postorder';
const SPACE_SEPARATOR = ' ';

traversePreOrder(treeRootNode.id, traversalResult);
console.log(PREORDER_LABEL);
console.log(SPACE_SEPARATOR + traversalResult.join(SPACE_SEPARATOR));

traversalResult = [];
traverseInOrder(treeRootNode.id, traversalResult);
console.log(INORDER_LABEL);
console.log(SPACE_SEPARATOR + traversalResult.join(SPACE_SEPARATOR));

traversalResult = [];
traversePostOrder(treeRootNode.id, traversalResult);
console.log(POSTORDER_LABEL);
console.log(SPACE_SEPARATOR + traversalResult.join(SPACE_SEPARATOR));
