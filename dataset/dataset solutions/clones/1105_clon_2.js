class TreeNode { // Represents a single node within the ordered data structure
  constructor(
    val, // The data value held by this node
    anc = null, // Reference to the parent node
    child1 = null, // Reference to the first (left) child
    child2 = null // Reference to the second (right) child
  ) {
    this.val = val;
    this.anc = anc;
    this.child1 = child1;
    this.child2 = child2;
  }

  // Determines the number of direct children this node possesses
  countConnectedChildren() {
    return (this.child1 !== null ? 1 : 0) + (this.child2 !== null ? 1 : 0);
  }

  // Checks if this node is the first child of its parent
  isFirstChildLink() {
    if (this.anc === null) return null; // Root node has no parent, thus no child status
    return this.anc.child1 === this;
  }

  // Provides a string indicating whether the node is a 'first' or 'second' child
  getSideIndicator() {
    return this.isFirstChildLink() ? 'child1' : 'child2';
  }

  // Locates the in-order successor node
  retrieveNextInOrder() {
    let currentElement;
    // If there's a right child, the successor is the leftmost node in its subtree
    if (this.child2 !== null) {
      currentElement = this.child2;
      while (currentElement.child1 !== null) currentElement = currentElement.child1;
    }
    // Otherwise, traverse up until a parent is reached from its left child
    else {
      currentElement = this.anc;
      while (currentElement && !currentElement.isFirstChildLink()) {
        currentElement = currentElement.anc;
      }
    }
    return currentElement; // Returns null if no successor (e.g., largest element)
  }
}

class OrderedCollection { // Manages a collection of ordered nodes (a Binary Search Tree)
  constructor() {
    this.topElem = null; // The topmost element of the tree
  }

  // Static getter to expose the internal node structure
  static get Branch() {
    return TreeNode;
  }

  // Inserts a new value into the tree, maintaining order
  addEntry(itemValue) {
    // If the tree is empty, the new value becomes the root
    if (this.topElem === null) {
      this.topElem = new OrderedCollection.Branch(itemValue);
      return;
    }

    let currentPlace = this.topElem; // Start search from the root
    let previousPlace; // Keep track of the parent for attachment
    let newLeaf = new OrderedCollection.Branch(itemValue); // Create the new node

    // Traverse the tree to find the correct insertion point
    while (currentPlace !== null) {
      previousPlace = currentPlace;
      currentPlace = currentPlace[itemValue < currentPlace.val ? 'child1' : 'child2'];
    }

    // Attach the new node as a child of the `previousPlace`
    newLeaf.anc = previousPlace;
    previousPlace[itemValue < previousPlace.val ? 'child1' : 'child2'] = newLeaf;
  }

  // Searches for a specific value within the tree
  locateEntry(targetVal, currentSearchNode = this.topElem) {
    // Base cases: node not found or value matches
    if (currentSearchNode === null || currentSearchNode.val === targetVal) {
      return currentSearchNode;
    }
    // Recursively search in the appropriate subtree
    return this.locateEntry(targetVal, currentSearchNode[targetVal < currentSearchNode.val ? 'child1' : 'child2']);
  }

  // Removes a node with a specified value from the tree
  removeEntry(valToRemove) {
    const nodeToDelete = this.locateEntry(valToRemove); // Find the node to be removed
    if (nodeToDelete === null) return; // If node not found, do nothing

    // Determine if the node is a 'child1' or 'child2' of its parent
    let sideOfParent = nodeToDelete.getSideIndicator();

    // Handle deletion based on the number of children the node has
    switch (nodeToDelete.countConnectedChildren()) {
      case 0: // Node has no children (leaf node)
        // If it's not the root, detach it from its parent
        if (nodeToDelete.anc) {
          nodeToDelete.anc[sideOfParent] = null;
        } else { // If it's the root and has no children, the tree becomes empty
          this.topElem = null;
        }
        break;
      case 1: // Node has one child
        // Replace the node with its single child
        let childToPromote = nodeToDelete.child1 || nodeToDelete.child2;
        if (nodeToDelete.anc) {
          nodeToDelete.anc[sideOfParent] = childToPromote;
          childToPromote.anc = nodeToDelete.anc;
        } else { // If it's the root with one child, the child becomes the new root
          this.topElem = childToPromote;
          childToPromote.anc = null;
        }
        break;
      default: // Node has two children
        // Find the in-order successor, replace the node's value with successor's value,
        // then delete the successor (which will have at most one child)
        let successorVal = nodeToDelete.retrieveNextInOrder().val;
        this.removeEntry(successorVal); // Recursively remove the successor node
        nodeToDelete.val = successorVal; // Update the current node's value
    }
  }

  // Performs an in-order traversal and prints the values
  showInOrderTraversal() {
    let outputBuffer = ''; // Buffer to accumulate output
    const recursiveInOrder = (currentDisplayNode) => {
      if (currentDisplayNode === null) return;
      recursiveInOrder(currentDisplayNode.child1); // Traverse left subtree
      outputBuffer += ` ${currentDisplayNode.val}`; // Visit current node
      recursiveInOrder(currentDisplayNode.child2); // Traverse right subtree
    };
    recursiveInOrder(this.topElem); // Start traversal from the root
    console.log(outputBuffer); // Print the accumulated string
  }

  // Performs a pre-order traversal and prints the values
  showPreOrderTraversal() {
    let resultBuffer = ''; // Buffer for pre-order output
    const recursivePreOrder = (currentDisplayNode) => {
      if (currentDisplayNode === null) return;
      resultBuffer += ` ${currentDisplayNode.val}`; // Visit current node
      recursivePreOrder(currentDisplayNode.child1); // Traverse left subtree
      recursivePreOrder(currentDisplayNode.child2); // Traverse right subtree
    };
    recursivePreOrder(this.topElem); // Begin traversal
    console.log(resultBuffer); // Output the result
  }

  // Displays both in-order and pre-order traversals
  displayAllTraversals() {
    this.showInOrderTraversal();
    this.showPreOrderTraversal();
  }
}

(function appEntryPoint() { // Main execution block for processing commands
  // Read input from stdin, clean it, and split into lines
  const inputLines = require('fs').readFileSync('/dev/stdin', 'utf8').trim().split('\n');
  // Get the number of commands from the first line
  const countOfOperations = Number(inputLines.shift());

  const myTree = new OrderedCollection(); // Instantiate the tree structure
  inputLines.forEach(function (currentCommand) { // Process each command line
    const firstCharacter = currentCommand.charAt(0);
    const valueString = currentCommand.split(' ')[1]; // Extract the value if present

    switch (firstCharacter) {
      case 'i':
        myTree.addEntry(Number(valueString)); // Insert command
        break;
      case 'f':
        console.log(myTree.locateEntry(Number(valueString)) ? 'yes' : 'no'); // Find command
        break;
      case 'd':
        myTree.removeEntry(Number(valueString)); // Delete command
        break;
      default:
        myTree.displayAllTraversals(); // Print command (implicit from default)
    }
  });
})();