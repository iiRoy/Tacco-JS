class TreeNode {
  // Initializes a new node within the tree structure
  constructor (  value,   ancestor = null,   childLeft = null,   childRight = null  ) {
    this.value      =  value;
    this.ancestor   =  ancestor;
    this.childLeft  =  childLeft;
    this.childRight =  childRight;
  }

  // Determines the number of direct descendant elements
  countChildren() { return Number(this.childLeft !== null) + Number(this.childRight !== null); }

  // Checks if the current node is its parent's left child
  isLeftDescendant() {
    if (this.ancestor === null) return null; // No ancestor, so cannot be a left child
    return this.ancestor.childLeft === this;
  }

  // Provides a string indicating if the node is a left or right child
  getSideOfParent() { return this.isLeftDescendant() ? 'leftSide' : 'rightSide'; }

  // Locates the successor node in the in-order traversal sequence
  findSuccessorValue() {
    let currentElement;
    if (this.childRight !== null) {
      currentElement = this.childRight;
      // Traverse left down the right subtree
      while (currentElement.childLeft !== null) currentElement = currentElement.childLeft;
    } else {
      currentElement = this.ancestor;
      // Traverse up until we are a left child or reach the top
      while (!currentElement.isLeftDescendant() && currentElement.ancestor != null) currentElement = currentElement.ancestor;
    }
    return currentElement;
  }
}

class SearchTree {
  // Constructs an empty binary search tree
  constructor() {
    this.topNode = null; // The topmost element of the tree
  }

  // Static accessor for the node class
  static get Element() { return TreeNode; }

  // Adds a new value to the tree structure
    addValue(val) {
      // On the very first call, initialize the root node
      this.topNode = new SearchTree.Element(val);
      // Reassign the insert method for all subsequent calls
      this.addValue = (val) => {
        let runner = this.topNode, lastVisited; // Pointers for traversal
        let newElement = new SearchTree.Element(val); // The new node to be inserted
        // Traverse the tree to find the correct insertion spot
        while (runner !== null) {
          lastVisited = runner;
          runner = runner[val < runner.value ? 'childLeft' : 'childRight'];
        }
        // Set the ancestor of the new element
        newElement.ancestor = lastVisited;
        // Place the new element as either a left or right child
        lastVisited[val < lastVisited.value ? 'childLeft' : 'childRight'] = newElement;
      }
    }


  // Searches for a specific value within the tree
  locateValue(targetVal, curr = this.topNode) {
    if (curr === null || curr.value === targetVal) return curr; // Found or not present
    // Recursively search in the appropriate subtree
    return this.locateValue(targetVal, curr[targetVal < curr.value ? 'childLeft' : 'childRight']);
  }

  // Removes a specified value from the tree
  removeValue(targetVal) {
    const elementToRemove = this.locateValue(targetVal); // Find the node to delete
    if (elementToRemove === null) return; // Value not found, nothing to delete

    let sideDesignator = elementToRemove.getSideOfParent(); // Determine if it's a left or right child

    // Handle deletion based on the number of children
    switch (elementToRemove.countChildren()) {
    case 0: // No children: simply remove the node
      elementToRemove.ancestor[sideDesignator] = null;
      break;
    case 1: // One child: replace node with its single child
      elementToRemove.ancestor[sideDesignator] = elementToRemove.childLeft || elementToRemove.childRight;
      elementToRemove.ancestor[sideDesignator].ancestor = elementToRemove.ancestor;
      break;
    default: // Two children: find successor, delete it, and replace current node's value
      let successorVal = elementToRemove.findSuccessorValue().value;
      this.removeValue(successorVal); // Recursively delete the successor node
      elementToRemove.value = successorVal; // Update current node's value with successor's
    }
  }

  // Prints tree elements in in-order traversal (sorted order)
  traverseInOrder() {
    let outputString = ''; // String to accumulate printed values
    const recursiveTraversal = (current) => {
      if (current === null) return; // Base case for recursion
      recursiveTraversal(current.childLeft);
      outputString += ` ${current.value}`;
      recursiveTraversal(current.childRight);
    }
    recursiveTraversal(this.topNode); // Start traversal from the root
    console.log(outputString);
  }

  // Prints tree elements in pre-order traversal (root, left, right)
  traversePreOrder() {
    let outputString = ''; // String to accumulate printed values
    const recursiveTraversal = (current) => {
      if (current === null) return; // Base case for recursion
      outputString += ` ${current.value}`;
      recursiveTraversal(current.childLeft);
      recursiveTraversal(current.childRight);
    }
    recursiveTraversal(this.topNode); // Start traversal from the root
    console.log(outputString);
  }

  // Displays the tree content using both in-order and pre-order traversals
  displayTree() {
    this.traverseInOrder();
    this.traversePreOrder();
  }
}

// Main program execution wrapped in an IIFE
(function executeProgram(){
  // Read input from stdin, parse it
  const inputLines = require('fs').readFileSync('/dev/stdin', 'utf8').trim().split('\n');
  const numOperations = Number(inputLines.shift()); // First line indicates number of operations

  const dataTree = new SearchTree(); // Instantiate the binary search tree

  // Process each command line from the input
  inputLines.forEach(function(commandLine) {
    switch (commandLine.charAt(0)) {
    case 'i': dataTree.addValue(Number(commandLine.split(' ')[1])); break; // Insert operation
    case 'f': console.log(dataTree.locateValue(Number(commandLine.split(' ')[1])) ? 'yes' : 'no'); break; // Find operation
    case 'd': dataTree.removeValue(Number(commandLine.split(' ')[1])); break; // Delete operation
    default: dataTree.displayTree(); // Print operation (default for 'p')
    }
  });
})();