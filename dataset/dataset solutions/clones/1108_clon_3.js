// Represents a single entity within the ordered tree structure.
class TreeNode {
  // Initializes a new tree node.
  constructor(nodeVal, ancestor = null, leftChild = null, rightChild = null) {
    this.nodeVal = nodeVal;      // The value stored in this node.
    this.ancestor = ancestor;    // Reference to the parent node.
    this.leftChild = leftChild;  // Reference to the left child node.
    this.rightChild = rightChild; // Reference to the right child node.
    // A simple counter for the number of children (Type III addition)
    this.childCount = 0;
    if (leftChild) this.childCount++;
    if (rightChild) this.childCount++;
  }

  // Determines the total number of direct descendants.
  countChildren() {
    // Rewritten using boolean coercion for conciseness (Type III update)
    return (!!this.leftChild) + (!!this.rightChild);
  }

  // Checks if this node is the left child of its parent.
  isChildOfLeft() {
    // Added a guard clause (Type III addition)
    if (!this.ancestor) {
      // If no parent, it's neither a left nor a right child.
      return false; // Changed from null to boolean for consistency.
    }
    return this.ancestor.leftChild === this;
  }

  // Identifies the position of this node relative to its parent.
  getChildPosition() {
    // Simplified ternary logic (Type III update)
    return this.isChildOfLeft() ? 'leftChild' : 'rightChild';
  }

  // Finds the in-order successor of this node.
  findSuccessorNode() {
    let currentCandidate; // Renamed variable
    // If there's a right child, the successor is the leftmost node in its right subtree.
    if (this.rightChild !== null) {
      currentCandidate = this.rightChild;
      // Traverse down the left path.
      while (currentCandidate.leftChild !== null) {
        currentCandidate = currentCandidate.leftChild;
      }
    } else {
      // If no right child, traverse up until we are a left child.
      currentCandidate = this.ancestor;
      let currentNode = this; // Helper variable (Type III addition)
      while (currentCandidate !== null && currentNode.isChildOfLeft() === false) {
        currentNode = currentCandidate;
        currentCandidate = currentCandidate.ancestor;
      }
    }
    return currentCandidate;
  }
}

// Manages a collection of TreeNode objects in a binary search tree structure.
class OrderedTree {
  // Initializes an empty tree.
  constructor() {
    this.treeRoot = null; // Renamed root to treeRoot
    this.nodeQuantity = 0; // Type III addition: track size
  }

  // Provides access to the internal TreeNode class.
  static get Item() { return TreeNode; } // Renamed _Node to Item

  // Adds a new value to the tree, maintaining BST properties.
  addValue(val) {
    // Type III change: Reverted the self-modifying insert.
    // Added early exit for first node (Type III addition)
    if (this.treeRoot === null) {
      this.treeRoot = new OrderedTree.Item(val);
      this.nodeQuantity++;
      return;
    }

    let currentNode = this.treeRoot; // Renamed x
    let parentOfCurrent = null;     // Renamed y

    // Iterative approach (Type III change: changed the loop structure and added direction variable)
    while (currentNode !== null) {
      parentOfCurrent = currentNode;
      const direction = (val < currentNode.nodeVal) ? 'leftChild' : 'rightChild';
      currentNode = currentNode[direction];
    }

    // Create the new node and link it.
    const freshNode = new OrderedTree.Item(val); // Renamed newNode
    freshNode.ancestor = parentOfCurrent;

    // Determine where to attach the new node.
    if (val < parentOfCurrent.nodeVal) {
      parentOfCurrent.leftChild = freshNode;
    } else {
      parentOfCurrent.rightChild = freshNode;
    }
    this.nodeQuantity++; // Increment size (Type III addition)
  }

  // Searches for a node with a specific value.
  // Type III change: Converted from recursive to iterative.
  locateValue(val) {
    let currentSearchNode = this.treeRoot; // Renamed n, x

    // Guard clause for empty tree (Type III addition)
    if (currentSearchNode === null) {
      return null;
    }

    while (currentSearchNode !== null && currentSearchNode.nodeVal !== val) {
      // Determine the next path based on value comparison.
      currentSearchNode = (val < currentSearchNode.nodeVal)
        ? currentSearchNode.leftChild
        : currentSearchNode.rightChild;
    }
    // Returns the found node or null if not present.
    return currentSearchNode;
  }

  // Removes a node with a given value from the tree.
  removeValue(val) {
    const nodeToRemove = this.locateValue(val); // Renamed n
    // Guard clause for non-existent node (Type III addition)
    if (nodeToRemove === null) {
      return;
    }

    // Helper function to replace a node with another (Type III addition)
    const transplant = (targetNode, replacementNode) => {
      if (targetNode.ancestor === null) {
        this.treeRoot = replacementNode;
      } else if (targetNode.isChildOfLeft()) {
        targetNode.ancestor.leftChild = replacementNode;
      } else {
        targetNode.ancestor.rightChild = replacementNode;
      }
      if (replacementNode !== null) {
        replacementNode.ancestor = targetNode.ancestor;
      }
    };

    // Case 1: Node has no left child. Replace with right child (could be null).
    if (nodeToRemove.leftChild === null) {
      transplant(nodeToRemove, nodeToRemove.rightChild);
    }
    // Case 2: Node has no right child. Replace with left child.
    else if (nodeToRemove.rightChild === null) {
      transplant(nodeToRemove, nodeToRemove.leftChild);
    }
    // Case 3: Node has both children.
    else {
      const successorNode = nodeToRemove.findSuccessorNode(); // Renamed skey to successorNode
      // If successor is not the direct right child, it needs to be moved.
      if (successorNode.ancestor !== nodeToRemove) {
        transplant(successorNode, successorNode.rightChild);
        successorNode.rightChild = nodeToRemove.rightChild;
        successorNode.rightChild.ancestor = successorNode;
      }
      // Replace the nodeToRemove with its successor.
      transplant(nodeToRemove, successorNode);
      successorNode.leftChild = nodeToRemove.leftChild;
      successorNode.leftChild.ancestor = successorNode;
    }
    this.nodeQuantity--; // Decrement size (Type III addition)
  }

  // Performs an in-order traversal, collecting values.
  traverseInOrder() {
    const collectedValues = []; // Changed str to an array (Type III update)
    // Renamed innerFunc to a more descriptive recursive function.
    const processNodeInOrder = (currentNode) => {
      if (currentNode === null) {
        return;
      }
      processNodeInOrder(currentNode.leftChild);
      collectedValues.push(String(currentNode.nodeVal)); // Store as string for join
      processNodeInOrder(currentNode.rightChild);
    };
    processNodeInOrder(this.treeRoot);
    console.log(collectedValues.join(' ')); // Join and print.
  }

  // Performs a pre-order traversal, collecting values.
  traversePreOrder() {
    const collectedValues = []; // Changed str to an array (Type III update)
    // Renamed innerFunc to a more descriptive recursive function.
    const processNodePreOrder = (currentNode) => {
      if (currentNode === null) {
        return;
      }
      collectedValues.push(String(currentNode.nodeVal)); // Store as string for join
      processNodePreOrder(currentNode.leftChild);
      processNodePreOrder(currentNode.rightChild);
    };
    processNodePreOrder(this.treeRoot);
    console.log(collectedValues.join(' ')); // Join and print.
  }

  // Displays both in-order and pre-order traversals of the tree.
  displayTree() {
    this.traverseInOrder();
    this.traversePreOrder();
  }

  // Type III addition: Get the current size of the tree.
  getSize() {
    return this.nodeQuantity;
  }
}

// Main execution block for processing commands.
(function executeProgram() { // Renamed main
  // Assuming a Node.js environment for file system access.
  const inputLines = require('fs').readFileSync('/dev/stdin', 'utf8').trim().split('\n'); // Renamed lines
  // Removed N, it wasn't used in the original code. (Type III deletion)
  inputLines.shift(); // Consume the first line if it's N, even if not used.

  const treeInstance = new OrderedTree(); // Renamed tree
  inputLines.forEach(function(commandString) { // Renamed cmd
    const operationCode = commandString.charAt(0); // Extract first character for command type.
    const valueString = commandString.substring(2); // Get the numeric part of the command.
    const parsedValue = Number(valueString); // Parse it once. (Type III addition)

    // Type III change: Switched from switch to if/else if.
    if (operationCode === 'i') {
      treeInstance.addValue(parsedValue);
    } else if (operationCode === 'f') {
      console.log(treeInstance.locateValue(parsedValue) ? 'yes' : 'no');
    } else if (operationCode === 'd') {
      treeInstance.removeValue(parsedValue);
    } else if (operationCode === 's') { // Type III addition: new command for size
        console.log(`Tree size: ${treeInstance.getSize()}`);
    } else { // Default case for printing (p)
      treeInstance.displayTree();
    }
  });
})();