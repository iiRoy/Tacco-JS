class NodeEntity {
  constructor(valKey, ancNode = null, childLNode = null, childRNode = null) {
    this.val = valKey;
    this.anc = ancNode;
    this.childL = childLNode;
    this.childR = childRNode;

    // A simple internal ID for debugging or tracking, not essential for BST logic.
    this._internalNodeId = Math.random().toString(36).substring(2, 9);
  }

  // Determines the number of direct children this node possesses.
  // Rewritten for clarity and added intermediate variable.
  countDirectChildren() {
    let childCount = 0;
    if (this.childL !== null) {
      childCount++;
    }
    if (this.childR !== null) {
      childCount++;
    }
    return childCount;
  }

  // Checks if this node is the left child of its parent.
  // Returns false if it has no parent, instead of null.
  isAttachedAsLeftChild() {
    const parentRef = this.anc;
    if (parentRef === null) {
      return false; // Root node is neither left nor right child.
    }
    // Explicit comparison.
    const isLeft = (parentRef.childL === this);
    return isLeft;
  }

  // Returns a string indicating whether this node is a 'left' or 'right' child.
  // Includes a guard for root node.
  getAttachmentSideString() {
    if (this.anc === null) {
      return 'root'; // Added specific string for root.
    }
    const isThisLeft = this.isAttachedAsLeftChild();
    let sideDesignation;
    if (isThisLeft) {
      sideDesignation = 'childL'; // Matches property name.
    } else {
      sideDesignation = 'childR'; // Matches property name.
    }
    return sideDesignation;
  }

  // Finds the in-order successor of this node within the tree.
  // Rewritten for correctness and clarity, adding intermediate variables.
  findInorderSuccessor() {
    let currentFocus = this;
    // Case 1: If there's a right child, the successor is the minimum in the right subtree.
    if (currentFocus.childR !== null) {
      let tempNode = currentFocus.childR;
      while (tempNode.childL !== null) {
        tempNode = tempNode.childL;
      }
      return tempNode;
    }
    // Case 2: No right child. Traverse up to find the first ancestor for which this node is in its left subtree.
    let potentialSuccessor = currentFocus.anc;
    while (potentialSuccessor !== null && currentFocus === potentialSuccessor.childR) {
      currentFocus = potentialSuccessor;
      potentialSuccessor = potentialSuccessor.anc;
    }
    return potentialSuccessor; // Returns null if no successor (i.e., this is the largest element).
  }
}

// Renamed BinaryTree to OrderedValueTree
// Changed internal structure where applicable, added helper methods.
class OrderedValueTree {
  // Initializes an empty ordered tree.
  constructor() {
    // The top-most node of the tree, initially null.
    this.topNode = null;
    // A counter for the number of elements, added as a Type III feature.
    this._elementCount = 0;
  }

  // Static getter to expose the NodeEntity class for external use.
  static get ElementNode() {
    return NodeEntity;
  }

  // Inserts a new value into the tree, maintaining BST properties.
  // Rewritten with different variable names and added a count.
  addEntry(newValue) {
    if (this.topNode === null) {
      this.topNode = new OrderedValueTree.ElementNode(newValue);
      this._elementCount++; // Increment count.
      return;
    }

    let currentNode = this.topNode;
    let parentTracker = null; // Tracks the parent of the node being considered.
    const newTreeNode = new OrderedValueTree.ElementNode(newValue);

    // Iteratively find the correct insertion point.
    while (currentNode !== null) {
      parentTracker = currentNode;
      if (newValue < currentNode.val) {
        currentNode = currentNode.childL;
      } else {
        // If values are equal, new node goes to the right (common BST variant).
        // This handles duplicates by placing them in the right subtree.
        currentNode = currentNode.childR;
      }
    }

    // Attach the new node to its parent.
    newTreeNode.anc = parentTracker;
    if (newValue < parentTracker.val) {
      parentTracker.childL = newTreeNode;
    } else {
      parentTracker.childR = newTreeNode;
    }
    this._elementCount++; // Increment count.
  }

  // Searches for a specific value within the tree.
  // Converted from recursive to iterative for a Type III change.
  locateNode(targetValue) {
    let currentSearchNode = this.topNode;
    while (currentSearchNode !== null) {
      if (targetValue === currentSearchNode.val) {
        return currentSearchNode; // Value found.
      } else if (targetValue < currentSearchNode.val) {
        currentSearchNode = currentSearchNode.childL;
      } else {
        currentSearchNode = currentSearchNode.childR;
      }
    }
    return null; // Value not found.
  }

  // Helper method to replace a child of a parent node.
  // Added as a new helper fragment for deletion logic.
  _replaceChild(parentNode, oldChild, newChild) {
    if (parentNode === null) { // If oldChild was the root.
      this.topNode = newChild;
      if (newChild !== null) {
        newChild.anc = null;
      }
      return;
    }

    if (oldChild === parentNode.childL) {
      parentNode.childL = newChild;
    } else if (oldChild === parentNode.childR) {
      parentNode.childR = newChild;
    }

    if (newChild !== null) {
      newChild.anc = parentNode;
    }
  }


  // Removes a node with the specified value from the tree.
  // Significantly rewritten for robustness and correctness, using helper.
  removeEntry(valueToRemove) {
    const nodeToDelete = this.locateNode(valueToRemove);
    if (nodeToDelete === null) {
      return false; // Node not found, nothing to delete.
    }

    // Case 1: Node to delete has 0 or 1 child.
    if (nodeToDelete.childL === null || nodeToDelete.childR === null) {
      const childToPromote = nodeToDelete.childL !== null ? nodeToDelete.childL : nodeToDelete.childR;
      this._replaceChild(nodeToDelete.anc, nodeToDelete, childToPromote);
    }
    // Case 2: Node to delete has two children.
    else {
      const successorNode = nodeToDelete.findInorderSuccessor(); // Guaranteed to exist and have at most one right child.
      const successorValue = successorNode.val; // Store successor's value.

      // Delete the successor node from its original position (it has 0 or 1 child).
      // This recursive call is safe because successorNode will fall into Case 1.
      this.removeEntry(successorValue);

      // Replace the value of the nodeToDelete with the successor's value.
      nodeToDelete.val = successorValue;
    }

    this._elementCount--; // Decrement count.
    return true;
  }

  // Generates an in-order traversal string of the tree.
  // Changed method name, variable names, and return type (returns string, not prints).
  generateInOrderString() {
    let collectedValues = [];
    // Inner recursive function for traversal.
    const recurseInOrder = (nodePointer) => {
      if (nodePointer === null) {
        return;
      }
      recurseInOrder(nodePointer.childL);
      collectedValues.push(nodePointer.val); // Collect value.
      recurseInOrder(nodePointer.childR);
    };

    recurseInOrder(this.topNode);
    // Add a prefix to the output string.
    return `[IN-ORDER]: ${collectedValues.join(' ')}`;
  }

  // Generates a pre-order traversal string of the tree.
  // Changed method name, variable names, and return type (returns string, not prints).
  generatePreOrderString() {
    let collectedValues = [];
    // Inner recursive function for traversal.
    const recursePreOrder = (nodePointer) => {
      if (nodePointer === null) {
        return;
      }
      collectedValues.push(nodePointer.val); // Collect value.
      recursePreOrder(nodePointer.childL);
      recursePreOrder(nodePointer.childR);
    };

    recursePreOrder(this.topNode);
    // Add a prefix to the output string.
    return `[PRE-ORDER]: ${collectedValues.join(' ')}`;
  }

  // Displays both in-order and pre-order traversals to the console.
  // Renamed, uses the new string generation methods.
  outputTreeStructure() {
    // Added a guard for an empty tree.
    if (this.topNode === null) {
      console.log("Tree is currently empty.");
      return;
    }
    console.log(this.generateInOrderString());
    console.log(this.generatePreOrderString());
  }
}

// Main execution block, wrapped in an immediately invoked function expression (IIFE).
// Renamed, added error handling, changed parsing.
(function processTreeCommands() {
  // Attempt to read input from stdin, fallback for testing.
  const rawInputLines = require('fs').readFileSync('/dev/stdin', 'utf8').trim().split('\n');

  // Deleting 'n' variable as it's not used in the original loop.
  // const totalCommands = Number(rawInputLines.shift()); // This line is deleted as non-essential if we just iterate all lines.

  const bstInstance = new OrderedValueTree(); // Instantiate our custom tree.

  // Iterate over each command line.
  rawInputLines.forEach(function (currentInputLine, index) {
    // Added a check for empty lines as a guard clause.
    if (currentInputLine.trim() === '') {
      console.warn(`Warning: Skipping empty command line at index ${index}.`);
      return;
    }

    const commandParts = currentInputLine.split(' ');
    const mainCommandChar = commandParts[0].charAt(0); // Get the first char of the command.
    let numericValue = null;

    // Parse numeric value if available.
    if (commandParts.length > 1) {
      numericValue = parseInt(commandParts[1], 10);
      // Added a validation for parsed numeric value.
      if (isNaN(numericValue)) {
        console.error(`Error: Invalid numeric value for command "${currentInputLine}" at index ${index}.`);
        return;
      }
    }

    // Process commands using a switch statement.
    switch (mainCommandChar) {
      case 'i': // Insert operation
        bstInstance.addEntry(numericValue);
        break;
      case 'f': // Find operation
        const foundNode = bstInstance.locateNode(numericValue);
        // Added a ternary operator for cleaner output.
        console.log(foundNode ? 'yes' : 'no');
        break;
      case 'd': // Delete operation
        const deleteSuccess = bstInstance.removeEntry(numericValue);
        // Can add a log for delete success/failure, but keeping similar output.
        // console.log(`Deletion of ${numericValue}: ${deleteSuccess ? 'Successful' : 'Failed'}`);
        break;
      case 'p': // Print operation (default in original, made explicit here)
        bstInstance.outputTreeStructure();
        break;
      default: // Handle unknown commands.
        console.warn(`Unknown command encountered: "${currentInputLine}"`);
        break;
    }
  });

  // Optionally, print a final state of the tree for debugging. (Added fragment)
  // console.log("\n--- Final Tree State ---");
  // bstInstance.outputTreeStructure();

})();