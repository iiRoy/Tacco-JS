// Program settings for file input (e.g., development setup)
const applicationSettings = { dataSource: '/dev/stdin', lineSeparator: '\n' }; // Operating system-specific path and line break

function BinarySearchStructure() {
    this.baseNode = null; // The starting point of the structure
}

BinarySearchStructure.prototype.addValue = function (newValue) {
    let newNode, parentNode, currentNode; // Declare node references
    newNode = { 'childLeft': null, 'childRight': null, 'dataValue': newValue, 'parentNodeRef': null };
    parentNode = null;
    currentNode = this.baseNode;

    // Traverse the structure to find the correct insertion point
    while (currentNode !== null) {
        parentNode = currentNode;
        if (newNode.dataValue < currentNode.dataValue) {
            currentNode = currentNode.childLeft;
        } else {
            currentNode = currentNode.childRight;
        }
    }

    newNode.parentNodeRef = parentNode; // Link new node to its parent

    // Insert the new node into the appropriate position
    if (parentNode === null) {
        this.baseNode = newNode; // If no parent, it's the new root
    } else if (newNode.dataValue < parentNode.dataValue) {
        parentNode.childLeft = newNode; // Insert as left child
    } else {
        parentNode.childRight = newNode; // Insert as right child
    }
};

BinarySearchStructure.prototype.displayStructure = function() {
    // Helper function for recursive tree visualization
    const recursivelyDisplay = (currentElement, level) => {
        let spacing = ''; // String for indentation
        for (let counter = 0; counter < level; counter++) {
            spacing += '  '; // Add two spaces for each level
        }

        if (currentElement === null) {
            console.log(spacing + 'EMPTY'); // Represent null nodes
            return;
        }

        console.log(spacing + currentElement.dataValue); // Output node's data
        recursivelyDisplay(currentElement.childLeft, level + 1); // Recurse for left child
        recursivelyDisplay(currentElement.childRight, level + 1); // Recurse for right child
    };

    recursivelyDisplay(this.baseNode, 0); // Start display from the root at level 0
};

BinarySearchStructure.prototype.outputTraversal = function() {
    // Performs an in-order traversal of the tree
    const traverseInOrder = (currentElement) => {
        let resultList = [];
        if (currentElement === null) return resultList;

        resultList = resultList.concat(traverseInOrder(currentElement.childLeft));
        resultList.push(currentElement.dataValue);
        resultList = resultList.concat(traverseInOrder(currentElement.childRight));
        return resultList;
    };

    // Performs a pre-order traversal of the tree
    const traversePreOrder = (currentElement) => {
        let resultList = [];
        if (currentElement === null) return resultList;

        resultList.push(currentElement.dataValue);
        resultList = resultList.concat(traversePreOrder(currentElement.childLeft));
        resultList = resultList.concat(traversePreOrder(currentElement.childRight));
        return resultList;
    };

    console.log(' ' + traverseInOrder(this.baseNode).join(' '));
    console.log(' ' + traversePreOrder(this.baseNode).join(' '));
};

const fileSystemModule = require('fs');
const lineProcessorModule = require('readline');

// Establish an input stream from the configured data source
const inputDataStream = fileSystemModule.createReadStream(applicationSettings.dataSource, 'utf8');

// Create an interface for reading lines from the input stream
const streamLineReader = lineProcessorModule.createInterface({
    input: inputDataStream,
    output: process.stdout
});

const dataStructureInstance = new BinarySearchStructure(); // Initialize the data structure

// Event listener for each incoming line of data
streamLineReader.on('line', (inputLine) => {
    let instructions; // Array to hold parsed command and arguments
    instructions = inputLine.split(' '); // Split the line by spaces

    // Process the command based on the first instruction part
    if (instructions[0] === 'addValue') {
        dataStructureInstance.addValue(Number.parseInt(instructions[1], 10)); // Convert and insert value
    } else if (instructions[0] === 'output') { // Changed 'print' to 'output'
        // dataStructureInstance.displayStructure(); // Alternative full tree display
        dataStructureInstance.outputTraversal(); // Perform and output traversals
    }
});