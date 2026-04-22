class TreeNode {
  // Represents a single node within the binary search tree.
  constructor(nodeVal, leftPtr = null, rightPtr = null) {
    this.dataValue = nodeVal;      // Stores the actual data (key) for this node.
    this.leftChildRef = leftPtr;   // Reference to the left child node.
    this.rightChildRef = rightPtr; // Reference to the right child node.
  }

  // Helper method to check if the node is a leaf node.
  isLeaf() {
    return this.leftChildRef === null && this.rightChildRef === null;
  }
}

class BinarySearchTree {
  // Manages the overall structure and operations of the binary search tree.
  constructor() {
    this.treeRoot = null; // The root node of the tree, initially null.
    this.nodeCount = 0;   // Keeps track of the total number of nodes in the tree.
  }

  // Provides a static way to access the node type for internal use or external instantiation.
  static get NodeType() { return TreeNode; }

  // Inserts a new data value into the binary search tree.
  // This method handles finding the correct position for the new node.
  placeData(valueToInsert) {
    // Create a new node instance with the provided value.
    const freshNode = new BinarySearchTree.NodeType(valueToInsert);

    // If the tree is empty, the new node becomes the root.
    if (this.treeRoot === null) {
      this.treeRoot = freshNode;
      this.nodeCount++;
      // console.log(`Root node set: ${valueToInsert}`); // Optional debug log
      return;
    }

    let currentSpot = this.treeRoot; // Start traversal from the root.
    let parentSpot = null;           // Keep track of the parent node to link the new node.

    // Traverse the tree to find the correct insertion point.
    while (currentSpot !== null) {
      parentSpot = currentSpot; // Update parent before moving to the next level.

      // Decide whether to go left or right based on the value.
      if (valueToInsert < currentSpot.dataValue) {
        currentSpot = currentSpot.leftChildRef; // Move to the left child.
      } else {
        // If value is greater than or equal, move to the right child.
        // This handles duplicates by placing them in the right subtree,
        // mirroring the original implementation's behavior.
        currentSpot = currentSpot.rightChildRef;
      }
    }

    // After the loop, currentSpot is null, and parentSpot is the node
    // where the new node should be attached.
    if (valueToInsert < parentSpot.dataValue) {
      parentSpot.leftChildRef = freshNode; // Attach to the left.
    } else {
      parentSpot.rightChildRef = freshNode; // Attach to the right.
    }
    this.nodeCount++; // Increment the total node count.
    // console.log(`Node inserted: ${valueToInsert}`); // Optional debug log
  }

  // Performs an in-order traversal of the tree and returns the collected values as a string.
  displayInOrder() {
    if (this.treeRoot === null) {
      console.log("In-Order Traversal: Tree is empty.");
      return;
    }

    const collectedValues = []; // Use an array to collect values, then join for efficiency.

    // Recursive helper function for in-order traversal.
    const inOrderWalk = (nodeRef) => {
      if (nodeRef === null) {
        return;
      }
      inOrderWalk(nodeRef.leftChildRef);       // Traverse left subtree.
      collectedValues.push(` ${nodeRef.dataValue}`); // Visit current node.
      inOrderWalk(nodeRef.rightChildRef);      // Traverse right subtree.
    };

    inOrderWalk(this.treeRoot); // Start traversal from the root.
    console.log(`In-Order Traversal:${collectedValues.join('')}`);
  }

  // Performs a pre-order traversal of the tree and returns the collected values as a string.
  displayPreOrder() {
    if (this.treeRoot === null) {
      console.log("Pre-Order Traversal: Tree is empty.");
      return;
    }

    const collectedValues = []; // Use an array to collect values.

    // Recursive helper function for pre-order traversal.
    const preOrderWalk = (nodeRef) => {
      if (nodeRef === null) {
        return;
      }
      collectedValues.push(` ${nodeRef.dataValue}`); // Visit current node.
      preOrderWalk(nodeRef.leftChildRef);        // Traverse left subtree.
      preOrderWalk(nodeRef.rightChildRef);       // Traverse right subtree.
    };

    preOrderWalk(this.treeRoot); // Start traversal from the root.
    console.log(`Pre-Order Traversal:${collectedValues.join('')}`);
  }

  // Outputs both in-order and pre-order traversals to the console.
  outputAllTraversals() {
    console.log("\n--- Beginning Tree Traversal Output ---");
    this.displayInOrder();
    this.displayPreOrder();
    console.log("--- End Tree Traversal Output ---\n");
  }
}

// Immediately Invoked Function Expression (IIFE) to run the application logic.
(function executeProgram() {
  let inputDataRows = [];
  try {
    // Read input from stdin, decode as UTF-8, trim whitespace, and split into lines.
    inputDataRows = require('fs').readFileSync('/dev/stdin', 'utf8').trim().split('\n');
  } catch (error) {
    console.error("Error reading input from /dev/stdin:", error.message);
    return; // Exit if input cannot be read.
  }

  // Remove the first line which typically contains N, but is unused in this implementation.
  // This line is often present in competitive programming contexts but not directly used here.
  if (inputDataRows.length > 0) {
    inputDataRows.shift();
  } else {
    console.log("No input lines provided. Exiting.");
    return;
  }

  const myTree = new BinarySearchTree(); // Create an instance of our binary search tree.

  // Process each command line from the input.
  inputDataRows.forEach(function(instruction) {
    if (!instruction || instruction.trim() === '') {
      // console.log("Skipping empty instruction line."); // Optional: Log skipped lines
      return;
    }

    const commandParts = instruction.split(' '); // Split the command into parts.
    const primaryCommand = commandParts[0].charAt(0); // Get the first character of the command.

    switch(primaryCommand) {
      case 'i': // 'insert' command
        const valueStr = commandParts[1];
        const numericValue = Number(valueStr);

        // Validate if the second part is a valid number.
        if (isNaN(numericValue) || valueStr === undefined) {
          console.warn(`Warning: Invalid value for insert command: '${instruction}'. Skipping.`);
          return;
        }
        myTree.placeData(numericValue); // Insert the number into the tree.
        // console.log(`Successfully processed 'insert' for value: ${numericValue}`); // Optional: confirm insertion
        break;

      case 'p': // 'print' command, or any other command starting with 'p'
        myTree.outputAllTraversals(); // Display both traversals.
        break;

      default: // Handle any other unrecognized commands.
        console.warn(`Warning: Unrecognized command '${instruction}'. Defaulting to tree output.`);
        myTree.outputAllTraversals(); // As per original, default to print.
        break;
    }
  });

  // Optional: Final status report
  // console.log(`\nProgram finished. Total nodes in tree: ${myTree.nodeCount}`);

})();