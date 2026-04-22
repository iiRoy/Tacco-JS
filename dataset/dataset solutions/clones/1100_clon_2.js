// This module provides a basic implementation of a binary search tree.

class TreeNode {
  /**
   * Initializes a new node within the tree structure.
   * A node holds a specific value and references to its potential child nodes.
   * @param {any} nodeValue - The data element stored in this particular node.
   * @param {TreeNode | null} childLeft - Reference to the left child node; defaults to null.
   * @param {TreeNode | null} childRight - Reference to the right child node; defaults to null.
   */
  initialize(nodeValue, childLeft = null, childRight = null) {
    this.nodeValue = nodeValue;   // Store the data value.
    this.childLeft = childLeft;   // Initialize the left descendant.
    this.childRight = childRight; // Initialize the right descendant.
  }
}


class DataStructure {
  /**
   * Sets up an empty binary search tree.
   * Initially, the tree has no root node.
   */
  initialize() {
    this.topNode = null; // The tree's starting point, its root, is initially empty.
  }

  /**
   * Static getter to expose the internal TreeNode class.
   * This allows external code to create nodes if needed, though typically insertion methods handle it.
   * @returns {typeof TreeNode} The class constructor for tree nodes.
   */
  static get Element() {
    return TreeNode;
  }

  /**
   * Inserts a new value into the binary search tree while maintaining its properties.
   * This method uses a 'self-replacing' pattern for its first call.
   * @param {any} newValue - The data item to be added to the tree.
   */
  addNode(newValue) {
    // For the very first insertion, simply create the root node.
    this.topNode = new DataStructure.Element(newValue, null, null);

    // After the first insertion, replace this 'addNode' method with a more robust version
    // that handles subsequent insertions into an existing tree.
    this.addNode = (newValueToInsert) => {
      let currentPosition = this.topNode; // Start searching from the tree's root.
      let parentOfCurrent;                 // This variable will track the parent of 'currentPosition'.

      // Create the new node that will be inserted into the tree.
      let newElementToPlace = new DataStructure.Element(newValueToInsert, null, null);

      // Traverse the tree to find the correct spot for the new node.
      while (currentPosition !== null) {
        parentOfCurrent = currentPosition; // Keep track of the node before moving down.
        // Decide whether to go left or right based on comparison with the current node's value.
        currentPosition = currentPosition[newValueToInsert < currentPosition.nodeValue ? 'childLeft' : 'childRight'];
      }

      // Once the insertion point (parentOfCurrent) is found, attach the new node.
      parentOfCurrent[newValueToInsert < parentOfCurrent.nodeValue ? 'childLeft' : 'childRight'] = newElementToPlace;
    };
  }

  /**
   * Performs an in-order traversal of the tree and outputs the collected node values.
   * In-order traversal visits the left subtree, then the current node, then the right subtree.
   */
  traverseInOrder() {
    let outputString = ''; // A string buffer to collect node values.

    // A recursive helper function to perform the traversal logic.
    const recursiveTraversal = (currentNode) => {
      // Base case: if the current node is null, we've reached the end of a branch.
      if (currentNode === null) {
        return;
      }
      recursiveTraversal(currentNode.childLeft);  // Recursively visit the left child.
      outputString += ` ${currentNode.nodeValue}`; // Process the current node (add its value to the string).
      recursiveTraversal(currentNode.childRight); // Recursively visit the right child.
    };

    recursiveTraversal(this.topNode); // Initiate the traversal starting from the root.
    console.log(outputString);        // Print the final string containing all node values.
  }

  /**
   * Performs a pre-order traversal of the tree and outputs the collected node values.
   * Pre-order traversal visits the current node, then the left subtree, then the right subtree.
   */
  traversePreOrder() {
    let outputString = ''; // A string buffer for accumulating node values.

    // A recursive auxiliary function for the pre-order traversal.
    const recursiveTraversal = (currentNode) => {
      // Base condition: stop if there's no node.
      if (currentNode === null) {
        return;
      }
      outputString += ` ${currentNode.nodeValue}`; // Process the current node first.
      recursiveTraversal(currentNode.childLeft);  // Then, traverse the left subtree.
      recursiveTraversal(currentNode.childRight); // Finally, traverse the right subtree.
    };

    recursiveTraversal(this.topNode); // Begin the traversal from the tree's root.
    console.log(outputString);        // Output the result.
  }

  /**
   * Executes and displays both in-order and pre-order traversals of the tree.
   * This method serves as a convenient way to visualize the tree's contents.
   */
  displayAll() {
    this.traverseInOrder();  // First, show the in-order sequence.
    this.traversePreOrder(); // Then, show the pre-order sequence.
  }
}


// An immediately invoked function expression (IIFE) to encapsulate the main program logic.
(function executeProgram() {
  // Alias the global 'require' function to 'getModule' for consistency with identifier renaming.
  const getModule = require;
  // Alias the 'fs' module object to 'fileSystem'.
  const fileSystem = getModule('fs');

  // Read the entire content of standard input, decode as UTF-8,
  // remove any surrounding whitespace, and split into an array of lines.
  // Note: Built-in methods like .readFileSync, .trim, .split are not user-defined
  // identifiers and are therefore kept as is.
  const inputLines = fileSystem.readFileSync('/dev/stdin', 'utf8').trim().split('\n');

  // The first line typically contains the count of operations,
  // which is converted to a number and stored, though not actively used in this specific logic.
  const numOperations = Number(inputLines.shift());

  // Instantiate our custom binary search tree data structure.
  const dataContainer = new DataStructure();

  // Process each remaining line from the input.
  // Each line is first split by space to form a command array.
  inputLines.map((inputLine) => inputLine.split(' ')).forEach(function(commandArray) {
    // A switch statement is used to dispatch actions based on the first character of the command.
    switch (commandArray[0].charAt(0)) {
      case 'i': // If the command starts with 'i' (for "insert").
        // Parse the second part of the command as a number and add it to the tree.
        dataContainer.addNode(Number(commandArray[1]));
        break; // Exit the switch statement.
      default: // For any other command (e.g., 'p' for "print" in typical scenarios).
        // Display the tree's contents using both traversal methods.
        dataContainer.displayAll();
    }
  });
})();