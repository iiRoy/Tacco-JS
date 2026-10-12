process.stdin.resume();
process.stdin.setEncoding("utf8");
let inputBuffer = "";
process.stdin.on("data", function(chunk) {inputBuffer += chunk;});
process.stdin.on("end", function() {processCommands(inputBuffer.split("\n"));});

function createNode(nodeKey) {
	const newNodeObject = {
		key: nodeKey,
		left: null,
		right: null
	};
	return newNodeObject;
}

function addNode(currentNode, newNode) {
	if (currentNode === null) {
		return newNode;
	}
	if (newNode.key < currentNode.key) {
		const updatedLeft = addNode(currentNode.left, newNode);
		currentNode.left = updatedLeft;
	} else {
		const updatedRight = addNode(currentNode.right, newNode);
		currentNode.right = updatedRight;
	}
	return currentNode;
}

function locateNode(currentNode, targetKey) {
	let searchNode = currentNode;
	while (searchNode !== null && searchNode.key !== targetKey) {
		if (targetKey < searchNode.key) {
			searchNode = searchNode.left;
		} else {
			searchNode = searchNode.right;
		}
	}
	return searchNode;
}

function inorderTraversal(currentNode, resultArray) {
	if (currentNode === null) return;
	inorderTraversal(currentNode.left, resultArray);
	const currentKeyValue = currentNode.key;
	resultArray.push(currentKeyValue);
	inorderTraversal(currentNode.right, resultArray);
}

function preorderTraversal(currentNode, resultArray) {
	if (currentNode === null) return;
	const currentKeyValue = currentNode.key;
	resultArray.push(currentKeyValue);
	preorderTraversal(currentNode.left, resultArray);
	preorderTraversal(currentNode.right, resultArray);
}

function printTraversal(currentNode, traversalFunction) {
	let traversalResult = [];
	traversalFunction(currentNode, traversalResult);
	const SPACE_PREFIX = " ";
	const formattedValues = traversalResult.map(val => SPACE_PREFIX + val);
	console.log(formattedValues.join(""));
}

function handleCommand(commandTypeChar, commandArgs, currentRoot) {
    let updatedRoot = currentRoot;
    const commandKey = Number(commandArgs[1]);

    switch(commandTypeChar) {
        case "i":
            const newNode = createNode(commandKey);
            updatedRoot = addNode(currentRoot, newNode);
            break;
        case "p":
            printTraversal(currentRoot, inorderTraversal);
            printTraversal(currentRoot, preorderTraversal);
            break;
        case "f":
            const foundNode = locateNode(currentRoot, commandKey);
            const isFound = foundNode !== null;
            console.log(isFound ? "yes" : "no");
            break;
    }
    return updatedRoot;
}

function processCommands(inputLines){
	const commandCount = Number(inputLines[0]);
	let treeRoot = null;
	const COMMAND_DELIMITER = " ";

	for (let idx = 0; idx < commandCount; idx++) {
		const currentLineIndex = idx + 1;
		const currentLine = inputLines[currentLineIndex];
		const lineParts = currentLine.split(COMMAND_DELIMITER);
		const commandTypeChar = lineParts[0][0];

		treeRoot = handleCommand(commandTypeChar, lineParts, treeRoot);
	}
}
