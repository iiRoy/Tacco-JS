function adjustDescendants(childIdentifier, parentIdentifier) {
    // Locate the specific node within our tree structure using its unique identifier.
    var currentNode = treeStructure.filter(function(element) {
        return element.id === childIdentifier;
    })[0];

    // Assign the provided parent identifier to this node.
    currentNode.parent = parentIdentifier;

    // Recursively process the left child if it exists (is not -1).
    if (currentNode.left !== -1) {
        adjustDescendants(currentNode.left, currentNode.id);
    }
    // Recursively process the right child if it exists (is not -1).
    if (currentNode.right !== -1) {
        adjustDescendants(currentNode.right, currentNode.id);
    }
}

function traversePreOrder(nodeIdentifier, resultCollection) {
    // If the node identifier indicates an invalid node, terminate this branch.
    if (nodeIdentifier === -1)
        return;

    // Find the node object corresponding to the current identifier.
    var currentNode = treeStructure.filter(function(element) {
        return element.id === nodeIdentifier;
    })[0];

    // Add the current node's identifier to our ordered collection.
    resultCollection.push(nodeIdentifier);
    // Recursively call for the left child.
    traversePreOrder(currentNode.left, resultCollection);
    // Recursively call for the right child.
    traversePreOrder(currentNode.right, resultCollection);
}

function traverseInOrder(nodeIdentifier, resultCollection) {
    // If the node identifier indicates an invalid node, terminate this branch.
    if (nodeIdentifier === -1)
        return;

    // Find the node object corresponding to the current identifier.
    var currentNode = treeStructure.filter(function(element) {
        return element.id === nodeIdentifier;
    })[0];

    // Recursively call for the left child.
    traverseInOrder(currentNode.left, resultCollection);
    // Add the current node's identifier to our ordered collection.
    resultCollection.push(nodeIdentifier);
    // Recursively call for the right child.
    traverseInOrder(currentNode.right, resultCollection);
}

function traversePostOrder(nodeIdentifier, resultCollection) {
    // If the node identifier indicates an invalid node, terminate this branch.
    if (nodeIdentifier === -1)
        return;

    // Find the node object corresponding to the current identifier.
    var currentNode = treeStructure.filter(function(element) {
        return element.id === nodeIdentifier;
    })[0];

    // Recursively call for the left child.
    traversePostOrder(currentNode.left, resultCollection);
    // Recursively call for the right child.
    traversePostOrder(currentNode.right, resultCollection);
    // Add the current node's identifier to our ordered collection.
    resultCollection.push(nodeIdentifier);
}

// Read all input data from standard input.
var rawData = require('fs').readFileSync('/dev/stdin', 'utf8');
// Split the input into individual lines and remove any leading/trailing whitespace.
var dataRows = rawData.trim().split('\n');

// The first line contains the total number of nodes. Convert it to a number.
var totalNodes = +dataRows.shift();

// Initialize an array to store our tree nodes.
var treeStructure = [];
// Loop through the remaining lines to parse node information.
for (var idx = 0; idx < totalNodes; idx++) {
    // Split each line by space to get node ID, left child, and right child.
    var parsedLine = dataRows.shift().split(' ');
    var nodeId = +parsedLine[0];
    var leftChild = +parsedLine[1];
    var rightChild = +parsedLine[2];

    // Create a node object and add it to our tree structure array.
    // Initialize the parent to -1, indicating no parent set yet.
    treeStructure.push({
        id: nodeId,
        left: leftChild,
        right: rightChild,
        parent: -1
    });
}

// Sort the tree structure array by node ID. This is not strictly required for correctness
// but matches the original's behavior and might simplify debugging.
treeStructure.sort(function(firstNode, secondNode) {
    return firstNode.id - secondNode.id;
});

// Iterate over all nodes to establish parent pointers using the recursive helper function.
treeStructure.forEach(function(currentNode) {
    if (currentNode.left !== -1) {
        adjustDescendants(currentNode.left, currentNode.id);
    }
    if (currentNode.right !== -1) {
        adjustDescendants(currentNode.right, currentNode.id);
    }
});

// Identify the root of the tree: the node whose parent remains -1.
var treeRoot = treeStructure.filter(function(element) {
    return element.parent === -1;
})[0];

// Perform and display Preorder traversal.
var outputSequence = [];
traversePreOrder(treeRoot.id, outputSequence);
console.log('Preorder');
console.log(' ' + outputSequence.join(' '));

// Reset the output sequence and perform Inorder traversal.
outputSequence = [];
traverseInOrder(treeRoot.id, outputSequence);
console.log('Inorder');
console.log(' ' + outputSequence.join(' '));

// Reset the output sequence and perform Postorder traversal.
outputSequence = [];
traversePostOrder(treeRoot.id, outputSequence);
console.log('Postorder');
console.log(' ' + outputSequence.join(' '));
