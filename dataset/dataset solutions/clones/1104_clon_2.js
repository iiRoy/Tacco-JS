/* This file defines a binary search tree implementation. */
class TreeNode {
  // Initializes a new tree node with a given data item.
  constructor (  datum,   childLeft = null,   childRight = null  )
  {
    this.datum = datum; /* The data value stored in this node. */
    this.childLeft = childLeft; // Reference to the left child node.
    this.childRight = childRight; /* Reference to the right child node. */
  }
}

class DualBranchTree
{
  /* Constructs a new empty binary tree. */
  constructor() {
    this.baseNode = null;
  }

  /* Static getter to provide access to the internal TreeNode class. */
  static get Element() {
    return TreeNode;
  }

  // Method to incorporate a new value into the tree.
  addValue(  dataPoint  ) {
    this.baseNode = new DualBranchTree.Element(dataPoint);
    // Overwrite the insert method for subsequent calls to use the iterative approach.
    this.addValue = (dataPoint) => {
      let traversalNode = this.baseNode; // Start at the root.
      let ancestorNode; // Keep track of the parent node.
      let freshElement = new DualBranchTree.Element(dataPoint); // Create the new node.

      while (traversalNode !== null) {
        ancestorNode = traversalNode;
        // Move left or right based on the data point's value.
        traversalNode = traversalNode[dataPoint < traversalNode.datum ? 'childLeft' : 'childRight'];
      }
      // Attach the new node to its parent.
      ancestorNode[dataPoint < ancestorNode.datum ? 'childLeft' : 'childRight'] = freshElement;
    };
  }

  /* Locates a specific data item within the tree. */
  locateValue (  targetDatum,   currentNode = this.baseNode  ) {
    if (currentNode === null) return false; // Not found.
    if (currentNode.datum === targetDatum) return true; // Found!
    // Recursively search in the appropriate subtree.
    return this.locateValue(targetDatum, currentNode[targetDatum < currentNode.datum ? 'childLeft' : 'childRight']);
  }

  // Displays tree elements in in-order traversal.
  displayInOrder ( ) {
    let outputBuffer = '';
    /* Helper function for recursive in-order traversal. */
    const processNode = ( currentElement ) => {
      if (currentElement === null) return;
      processNode(currentElement.childLeft); // Visit left child.
      outputBuffer += ` ${currentElement.datum}`; // Visit node itself.
      processNode(currentElement.childRight); // Visit right child.
    };
    processNode(this.baseNode);
    console.log(outputBuffer);
  }

  // Displays tree elements in pre-order traversal.
  displayPreOrder ( ) {
    let outputBuffer = '';
    /* Internal function for pre-order traversal. */
    const processNode = ( currentElement ) => {
      if (currentElement === null) return;
      outputBuffer += ` ${currentElement.datum}`; // Visit node itself.
      processNode(currentElement.childLeft); // Visit left child.
      processNode(currentElement.childRight); // Visit right child.
    };
    processNode(this.baseNode);
    console.log(outputBuffer);
  }

  // Outputs both in-order and pre-order traversals.
  outputAll (  ) {
    this.displayInOrder();
    this.displayPreOrder();
  }
}

// Main execution block, wrapped in an Immediately Invoked Function Expression (IIFE).
( function executeProgram(  ) {
  const dataRows = require('fs').readFileSync('/dev/stdin', 'utf8').trim().split('\n');
  // The first line indicates the number of operations, but it's shifted off and not used later.
  const totalOperations = Number(dataRows.shift());

  const branchSystem = new DualBranchTree(); // Instantiate our tree.
  dataRows.forEach( function(instructionLine) {
    // Process each command from the input.
    switch(instructionLine.charAt(0)) {
    case 'a': // 'a' for add (originally 'i' for insert)
      branchSystem.addValue( Number(instructionLine.split(' ')[1]) );
      break;
    case 's': // 's' for search (originally 'f' for find)
      console.log(branchSystem.locateValue( Number(instructionLine.split(' ')[1]) ) ? 'yes' : 'no');
      break;
    default: // Any other command triggers printing.
      branchSystem.outputAll();
    }
  });
} )();