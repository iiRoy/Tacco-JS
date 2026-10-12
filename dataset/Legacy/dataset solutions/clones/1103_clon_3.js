process.stdin.resume();
process.stdin.setEncoding("utf8");
let rawDataBuffer = "";
process.stdin.on("data", function(dataChunk) {rawDataBuffer += dataChunk;});
process.stdin.on("end", function() {main(rawDataBuffer.split("\n"));});

function createNode(nodeValue) {
	const newNodeObject = {
		value: nodeValue,
		left: null,
		right: null
	};
	return newNodeObject;
}

function insertNode(currentNode, newNode) {
	if (currentNode === null) {
		return newNode;
	}

	const comparisonValue = newNode.value;
	if (comparisonValue < currentNode.value) {
		currentNode.left = insertNode(currentNode.left, newNode);
	}	else {
		currentNode.right = insertNode(currentNode.right, newNode);
	}
	return currentNode;
}

function findNode(currentNode, targetValue) {
	let searchPointer = currentNode;
	while (searchPointer !== null) {
		if (searchPointer.value === targetValue) {
			return searchPointer;
		} else if (targetValue < searchPointer.value) {
			searchPointer = searchPointer.left;
		} else {
			searchPointer = searchPointer.right;
		}
	}
	return null;
}

function performInOrderTraversal(currentNode, collectedKeys) {
	if (currentNode === null) return;
	performInOrderTraversal(currentNode.left, collectedKeys);
	collectedKeys.push(currentNode.value);
	performInOrderTraversal(currentNode.right, collectedKeys);
}

function performPreOrderTraversal(currentNode, collectedKeys) {
	if (currentNode === null) return;
	collectedKeys.push(currentNode.value);
	performPreOrderTraversal(currentNode.left, collectedKeys);
	performPreOrderTraversal(currentNode.right, collectedKeys);
}

function outputTraversalResult(nodeReference, traversalStrategy) {
	const collectedValues = [];
	traversalStrategy(nodeReference, collectedValues);
	const formattedOutput = collectedValues.map(val => ` ${val}`).join("");
	console.log(formattedOutput);
}

function processInputCommands(inputLines) {
	const totalOperations = Number(inputLines[0]);
	let treeRoot = null;

	const parseNumericKey = (commandParts) => Number(commandParts[1]);

	for (let opIndex = 0; opIndex < totalOperations; opIndex++) {
		const currentCommandLine = inputLines[opIndex + 1];
		if (!currentCommandLine) continue;
		const commandParts = currentCommandLine.split(" ");
		const commandType = commandParts[0][0];

		switch (commandType) {
			case "i": {
				const insertionKey = parseNumericKey(commandParts);
				const newNodeInstance = createNode(insertionKey);
				treeRoot = insertNode(treeRoot, newNodeInstance);
				break;
			}
			case "p": {
				outputTraversalResult(treeRoot, performInOrderTraversal);
				outputTraversalResult(treeRoot, performPreOrderTraversal);
				break;
			}
			case "f": {
				const searchKey = parseNumericKey(commandParts);
				const foundNode = findNode(treeRoot, searchKey);
				const resultMessage = (foundNode !== null) ? "yes" : "no";
				console.log(resultMessage);
				break;
			}
		}
	}
}

function main(inputLines){
	processInputCommands(inputLines);
}
