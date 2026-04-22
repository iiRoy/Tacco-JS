// Represents an individual element within the ordered tree structure.
class TreeNode {
  /**
   * Initializes a new tree node.
   * @param {*} nodeValue - The value stored in this node.
   * @param {TreeNode|null} leftChild - Reference to the left child node.
   * @param {TreeNode|null} rightChild - Reference to the right child node.
   */
  constructor(nodeValue, leftChild = null, rightChild = null) {
    this.nodeValue = nodeValue; // The actual data key for this node
    this.leftChild = leftChild;     // Pointer to the left subtree
    this.rightChild = rightChild;   // Pointer to the right subtree
    this.parentRef = null;      // Reference to the parent node, null for root (added for Type III)
    this.nodeDepth = 0;         // Depth of this node in the tree (added for Type III)
  }
}

// Manages a binary search tree, ensuring elements are kept in order.
class OrderedTree {
  constructor() {
    this.treeRoot = null;        // The starting point of the tree
    this.nodeCount = 0;          // Total number of elements in the tree (Type III addition)
    this.maxTreeDepth = -1;      // Maximum depth reached by any node (Type III addition)
  }

  /**
   * Adds a new value to the ordered tree, maintaining its sorted property.
   * @param {*} val - The value to be inserted.
   * @returns {boolean} True if insertion was successful, false otherwise.
   */
  addValue(val) {
    // Type III: Guard clause for invalid input
    if (val === null || typeof val !== 'number' || isNaN(val)) {
      // console.warn(`Attempted to add an invalid value: ${val}. Skipping.`);
      return false;
    }

    const freshNode = new TreeNode(val);
    freshNode.nodeDepth = 0; // Initial depth for a new node

    // Type III: Explicitly handle the very first insertion
    if (this.treeRoot === null) {
      this.treeRoot = freshNode;
      this.nodeCount = 1;
      this.maxTreeDepth = 0;
      return true;
    }

    let currentNode = this.treeRoot;
    let parentNode = null;
    let currentDepth = 0; // Track depth during insertion (Type III addition)

    // Iterate to find the correct insertion point
    while (currentNode !== null) {
      parentNode = currentNode;
      currentDepth++; // Increment depth for the next level

      if (val < currentNode.nodeValue) {
        currentNode = currentNode.leftChild;
      } else {
        // If values are equal, original code effectively places to the right.
        // We'll maintain that behavior, but could be modified to ignore/update.
        currentNode = currentNode.rightChild;
      }
    }

    // Link the new node to its parent
    freshNode.parentRef = parentNode; // Type III: Set parent reference
    freshNode.nodeDepth = currentDepth; // Type III: Set node's depth

    if (val < parentNode.nodeValue) {
      parentNode.leftChild = freshNode;
    } else {
      parentNode.rightChild = freshNode;
    }

    // Type III: Update tree metrics
    this.nodeCount++;
    if (currentDepth > this.maxTreeDepth) {
      this.maxTreeDepth = currentDepth;
    }
    return true;
  }

  /**
   * Searches for a specific value within the tree.
   * @param {*} targetVal - The value to search for.
   * @param {TreeNode|null} [currentRef=this.treeRoot] - The node to start the search from (defaults to root).
   * @returns {TreeNode|null} The node containing the value if found, otherwise null.
   */
  locateValue(targetVal, currentRef = this.treeRoot) {
    // Type III: Guard clause for invalid input
    if (targetVal === null || typeof targetVal !== 'number' || isNaN(targetVal)) {
      return null;
    }

    // Base case: If current node is null, value not found along this path
    if (currentRef === null) {
      return null;
    }

    // Base case: Value found
    if (currentRef.nodeValue === targetVal) {
      return currentRef;
    }

    // Recursive step: Traverse left or right based on comparison
    if (targetVal < currentRef.nodeValue) {
      return this.locateValue(targetVal, currentRef.leftChild);
    } else {
      return this.locateValue(targetVal, currentRef.rightChild);
    }
  }

  /**
   * Performs an in-order traversal of the tree, collecting node values.
   * @returns {Array<*>} An array of values in in-order sequence.
   */
  getInOrderTraversal() {
    const collectedValues = [];
    // Type III: Early exit if tree is empty
    if (this.treeRoot === null) {
      return collectedValues;
    }

    const recursiveCollector = (currNode) => {
      if (currNode === null) {
        return;
      }
      recursiveCollector(currNode.leftChild);
      collectedValues.push(currNode.nodeValue);
      recursiveCollector(currNode.rightChild);
    };

    recursiveCollector(this.treeRoot);
    return collectedValues;
  }

  /**
   * Performs a pre-order traversal of the tree, collecting node values.
   * @returns {Array<*>} An array of values in pre-order sequence.
   */
  getPreOrderTraversal() {
    const collectedValues = [];
    // Type III: Early exit if tree is empty
    if (this.treeRoot === null) {
      return collectedValues;
    }

    const recursiveCollector = (currNode) => {
      if (currNode === null) {
        return;
      }
      collectedValues.push(currNode.nodeValue);
      recursiveCollector(currNode.leftChild);
      recursiveCollector(currNode.rightChild);
    };

    recursiveCollector(this.treeRoot);
    return collectedValues;
  }

  /**
   * Outputs the tree structure using different traversal methods.
   * Type III: Added more detail to output, removed original print() method's behavior.
   */
  outputTreeStructure() {
    // Type III: Added contextual information
    console.log(`--- Tree Summary ---`);
    console.log(`Node Count: ${this.nodeCount}`);
    console.log(`Max Depth: ${this.maxTreeDepth}`);

    // Using the new traversal methods that return arrays
    const inOrderResult = this.getInOrderTraversal();
    const preOrderResult = this.getPreOrderTraversal();

    // Type III: Enhanced output formatting
    if (inOrderResult.length > 0) {
      console.log(`In-Order Traversal: ${inOrderResult.map(v => ` ${v}`).join('')}`);
    } else {
      console.log(`In-Order Traversal: (Tree is empty)`);
    }

    if (preOrderResult.length > 0) {
      console.log(`Pre-Order Traversal: ${preOrderResult.map(v => ` ${v}`).join('')}`);
    } else {
      console.log(`Pre-Order Traversal: (Tree is empty)`);
    }
    console.log(`--------------------`);
  }
}

// Self-executing function to handle tree operations from standard input.
(function processTreeOperations() {
  let commandLines;
  try {
    // Type III: Added more robust file reading and error handling
    const fs = require('fs');
    commandLines = fs.readFileSync('/dev/stdin', 'utf8').trim().split('\n');
  } catch (error) {
    console.error("Error reading input from /dev/stdin:", error.message);
    // Provide some default commands for local testing if file read fails
    commandLines = [
      '5',
      'i 8', 'i 3', 'i 10', 'i 1', 'i 6', 'i 4', 'i 7', 'i 14', 'i 13',
      'f 6', 'f 9',
      'p'
    ];
    console.warn("Using default test commands due to input error.");
  }


  // Type III: Renamed variables and added more explicit parsing
  const totalCommands = Number(commandLines.shift()); // First line is number of commands, can be ignored for dynamic input

  const dataStructure = new OrderedTree(); // Instantiate the new tree class

  // Type III: Changed loop type from forEach to for...of for variety
  for (const cmdLine of commandLines) {
    try {
      const parts = cmdLine.split(' ');
      const commandType = parts[0];
      const commandArgString = parts[1];
      let numericArg = null;

      if (commandArgString) {
        numericArg = Number(commandArgString);
        // Type III: Added a guard for invalid numeric arguments
        if (isNaN(numericArg)) {
          console.warn(`Skipping command '${cmdLine}' due to invalid numeric argument.`);
          continue;
        }
      }

      // Type III: Changed switch to if/else if for structural difference
      if (commandType === 'i') {
        dataStructure.addValue(numericArg);
      } else if (commandType === 'f') {
        const foundNode = dataStructure.locateValue(numericArg);
        console.log(foundNode !== null ? 'yes' : 'no'); // Type III: Checks for node reference
      } else if (commandType === 'p') {
        dataStructure.outputTreeStructure(); // Calls the new display method
      } else {
        // Type III: Added a warning for unrecognized commands
        console.warn(`Unrecognized command: '${commandType}'. Skipping.`);
      }
    } catch (operationError) {
      // Type III: Generic error handling for individual command processing
      console.error(`Error processing command '${cmdLine}':`, operationError.message);
    }
  }
})();