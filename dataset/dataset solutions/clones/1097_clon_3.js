process.stdin.resume();
process.stdin.setEncoding("utf8");
let rawData = "";
process.stdin.on("data", function(dataChunk) {
    rawData += dataChunk;
});
process.stdin.on("end", function() {
    processInput(rawData.split("\n"));
});

function createNode(nodeValue) {
    const newNode = {};
    newNode.value = nodeValue;
    newNode.left = null;
    newNode.right = null;
    return newNode;
}

function addNode(currentNode, newNode) {
    if (currentNode === null) {
        return newNode;
    }
    const targetValue = newNode.value;
    if (targetValue < currentNode.value) {
        currentNode.left = addNode(currentNode.left, newNode);
    } else {
        currentNode.right = addNode(currentNode.right, newNode);
    }
    return currentNode;
}

function inorderTraversal(currentNode, collectedKeys) {
    if (currentNode === null) {
        return;
    }
    inorderTraversal(currentNode.left, collectedKeys);
    const currentKeyValue = currentNode.value;
    collectedKeys.push(currentKeyValue);
    inorderTraversal(currentNode.right, collectedKeys);
}

function preorderTraversal(currentNode, collectedKeys) {
    if (currentNode === null) {
        return;
    }
    const currentKeyValue = currentNode.value;
    collectedKeys.push(currentKeyValue);
    preorderTraversal(currentNode.left, collectedKeys);
    preorderTraversal(currentNode.right, collectedKeys);
}

function printTraversal(nodeRef, traversalFunction) {
    const collectedValues = [];
    traversalFunction(nodeRef, collectedValues);
    const outputString = collectedValues.join(" ");
    console.log(outputString);
}

function processInput(inputLines) {
    const numOperations = Number(inputLines[0]);
    let bstRoot = null;

    for (let opIndex = 0; opIndex < numOperations; opIndex++) {
        const currentCommand = inputLines[opIndex + 1].split(" ");
        const commandType = currentCommand[0][0];

        if (commandType === "i") {
            const nodeValue = Number(currentCommand[1]);
            const newNode = createNode(nodeValue);
            bstRoot = addNode(bstRoot, newNode);
        } else if (commandType === "p") {
            printTraversal(bstRoot, inorderTraversal);
            printTraversal(bstRoot, preorderTraversal);
        }
    }
}
