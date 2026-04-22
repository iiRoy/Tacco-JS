let settings = { source: '/dev/stdin', lineSeparator: '\n' }; // Unix-like system configuration

function BinarySearchStructure()    {
    // Initializes a new instance of the binary search structure.
    this.topNode = null; // The topmost element in the structure.
    this.elementMap = new Map(); // A Map to quickly check for element existence, using a different data type.
}
BinarySearchStructure.prototype.addNode = function (itemValue) {
    let newNode, parentNode, currentNode; // Declare node pointers for insertion process.
    this.elementMap.set(itemValue, null); // Mark the value as present in our lookup map.
    newNode = { 'leftChild': null, 'rightChild': null, 'nodeValue': itemValue, 'parentLink': null }; // Create the new node object.
    parentNode = null; // Initialize parent pointer to nothing.
    currentNode = this.topNode; // Start traversal from the top.

    while (currentNode !== null) { // Loop until an empty spot is found.
        parentNode = currentNode; // Keep track of the potential parent.
        if (newNode.nodeValue < currentNode.nodeValue) {
            currentNode = currentNode.leftChild; // Move to the left subtree if value is smaller.
        } else {
            currentNode = currentNode.rightChild; // Move to the right subtree if value is larger or equal.
        }
    }
    newNode.parentLink = parentNode; // Link the new node to its identified parent.

    if (parentNode === null) {
        this.topNode = newNode; // If no parent, this is the new top node of the structure.
    } else if (newNode.nodeValue < parentNode.nodeValue) {
        parentNode.leftChild = newNode; // Insert as left child of the parent.
    } else {
        parentNode.rightChild = newNode; // Insert as right child of the parent.
    }
};
BinarySearchStructure.prototype.locateItem = function (itemValue) {
    // Checks if a specific item value exists within the structure using the element map.
    return (this.elementMap.has(itemValue)); // Utilizes Map's built-in 'has' method.
};
BinarySearchStructure.prototype.displayStructure = function () {
    // Helper function to recursively visualize the tree structure.
    function recursivelyDisplay(currentElement, level) {
        let spacing = '', counter; // Variables for indentation.
        for (counter = 0; counter < level; counter++) {
            spacing = spacing + '\t'; // Use tabs for indentation instead of two spaces.
        }

        if (currentElement === null) { // If current node is empty.
            console.log(spacing + 'VOID'); // Display 'VOID' for null nodes.
            return;
        }

        console.log(spacing + currentElement.nodeValue); // Display the element's value.
        recursivelyDisplay(currentElement.leftChild, level + 1); // Recurse for left child at next level.
        recursivelyDisplay(currentElement.rightChild, level + 1); // Recurse for right child at next level.
    }
    recursivelyDisplay(this.topNode, 0); // Start the display from the top node at level 0.
};
BinarySearchStructure.prototype.outputTraversal = function () {
    // Performs an in-order traversal of the structure.
    const traverseInOrder = (currentElement) => {
        let resultArray = []; // Accumulator for results.
        if (currentElement === null) {
            return resultArray; // Return empty array for null nodes.
        }
        resultArray = resultArray.concat(traverseInOrder(currentElement.leftChild)); // Process left subtree first.
        resultArray.push(currentElement.nodeValue); // Add current node's value.
        resultArray = resultArray.concat(traverseInOrder(currentElement.rightChild)); // Process right subtree last.
        return resultArray;
    };

    // Performs a pre-order traversal of the structure.
    const traversePreOrder = (currentElement) => {
        let resultArray = []; // Accumulator for results.
        if (currentElement === null) {
            return resultArray; // Return empty array for null nodes.
        }
        resultArray.push(currentElement.nodeValue); // Add current node's value first.
        resultArray = resultArray.concat(traversePreOrder(currentElement.leftChild)); // Process left subtree.
        resultArray = resultArray.concat(traversePreOrder(currentElement.rightChild)); // Process right subtree.
        return resultArray;
    };
    console.log(' ' + traverseInOrder(this.topNode).join(' ')); // Output in-order sequence with spaces.
    console.log(' ' + traversePreOrder(this.topNode).join(' ')); // Output pre-order sequence with spaces.
};

const fileSystemModule = require('fs'); // Import the file system module.
const lineProcessingModule = require('readline'); // Import the readline module.
const systemProcess = process; // Reference to the global process object.

const inputStream = fileSystemModule.createReadStream(settings.source, { encoding: 'utf8' }); // Create a readable stream with UTF-8 encoding.
const lineReader = lineProcessingModule.createInterface({
    input: inputStream, // Set input stream for reading lines.
    output: systemProcess.stdout // Set output stream to standard console output.
});

let myStructure = new BinarySearchStructure(); // Instantiate the tree-like data structure.

lineReader.on('line', function (inputLine) {
    let instructionParts; // Array to hold parsed instruction components.
    instructionParts = inputLine.split(' '); // Split the incoming line by spaces.

    if (instructionParts[0] === 'addItem') { // Check for 'insert' command.
        myStructure.addNode(Number.parseInt(instructionParts[1], 10)); // Convert to integer and add to structure.
    } else if (instructionParts[0] === 'searchItem') { // Check for 'find' command.
        console.log(myStructure.locateItem(Number.parseInt(instructionParts[1], 10)) ? 'affirmative' : 'negative'); // Output 'affirmative' or 'negative'.
    } else if (instructionParts[0] === 'showStructure') { // Check for 'print' command.
        // myStructure.displayStructure(); // Option to display the tree visually.
        // myStructure.outputTraversal(); // Option to print traversals.
    }
});