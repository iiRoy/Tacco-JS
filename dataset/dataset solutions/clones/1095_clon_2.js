// Defines a fundamental data structure for organizing elements.
class NodeStructure {

  // Sets up the initial collection of elements.
  constructor(nodeQuantity) {
    this.memberNodes = []; // Stores all the individual elements.

    // Populate the memberNodes array with default element configurations.
    for (let k = 0; k < nodeQuantity; k++) {
      this.memberNodes[k] = {
        uniqueKey: k + 1,       // A distinct identifier for each element.
        ancestorKey: -1,        // Identifier of the parent element, -1 for root.
        leftChildLink: -1,      // Identifier of the left child element.
        rightChildLink: -1      // Identifier of the right child element.
      };
    }
  }


  // Property to retrieve the primary element (root) of the structure.
  get principalElement() {
    return this.memberNodes.find(elem => elem.ancestorKey === -1);
  }


  // Locates and returns an element based on its unique key.
  locateNode(keyVal) {
    // Keys are 1-based, array indices are 0-based.
    return this.memberNodes[keyVal - 1] || {};
  }


  // Generates a sequence of element unique keys using post-order traversal.
  traversePostOrder() {
    let traversalOutput = []; // Collection to store the ordered unique keys.

    // Recursive helper function for post-order traversal logic.
    const visitInPostOrder = (currentKey) => {
      // Base case: if the key is invalid (-1), stop recursion.
      if (currentKey === -1) {
        return;
      }

      // Retrieve the current element's data from the collection.
      let currentElement = this.locateNode(currentKey);

      // Recursively visit the left descendant element.
      visitInPostOrder(currentElement.leftChildLink);

      // Recursively visit the right descendant element.
      visitInPostOrder(currentElement.rightChildLink);

      // After visiting all children, add the current element's key to the output.
      traversalOutput.push(currentKey);
    };

    // Initiate the traversal starting from the root element's unique key.
    visitInPostOrder(this.principalElement.uniqueKey);

    return traversalOutput; // Return the final ordered sequence of keys.
  }
}


// Self-executing anonymous function to manage overall program execution.
(function runApplication() {

  // Load raw input from standard input, process it into an array of lines.
  const inputLines = require('node:fs')
    .readFileSync('/dev/stdin', 'utf-8')
    .trim()
    .split('\n');

  // Extract the total number of elements from the first line and convert to an integer.
  const totalElements = parseInt(inputLines.shift(), 10);

  // Parse the pre-order traversal sequence from the next line, converting values to numbers.
  const prefixTraversal = inputLines.shift()
    .split(' ')
    .map(val => Number(val));

  // Parse the in-order traversal sequence from the subsequent line, converting values to numbers.
  const infixTraversal = inputLines.shift()
    .split(' ')
    .map(val => Number(val));

  // Construct the tree structure using the provided traversal sequences.
  let constructedStructure = buildTreeFromTraversals(prefixTraversal, infixTraversal);

  // Perform a post-order traversal on the constructed structure and print the result.
  // The unique keys are joined by spaces for the final output.
  console.log(constructedStructure.traversePostOrder().join(' '));

})();


// Function to reconstruct a binary tree given its pre-order and in-order traversals.
function buildTreeFromTraversals(prefixTraverse, infixTraverse) {
  // Initialize a new tree structure with the determined number of nodes.
  let structureInstance = new NodeStructure(prefixTraverse.length);

  // Inner recursive function to perform the actual tree construction.
  const recursiveBuilder = (prefixArr, infixArr) => {
    // Base case for recursion: if the prefix array is empty, there are no more nodes to process.
    if (prefixArr.length === 0) {
      return;
    }

    // The first element in the pre-order traversal is always the root of the current subtree.
    let centralKey = prefixArr[0];

    // Find the index of this root element within the in-order traversal.
    let centralIndex = infixArr.indexOf(centralKey);

    // If the central key isn't found in the in-order array, it's an invalid state or empty subtree.
    if (centralIndex === -1) {
      return;
    }

    // Process the left subtree if it contains elements.
    if (centralIndex > 0) {
      // The left child of the current root is the second element in the current prefix array.
      structureInstance.locateNode(centralKey).leftChildLink = prefixArr[1];
      // Set the parent link for this newly identified left child.
      structureInstance.locateNode(prefixArr[1]).parentLink = centralKey;
      // Recursively build the left subtree using its respective traversal parts.
      recursiveBuilder(
        prefixArr.slice(1, centralIndex + 1), // Elements for left subtree in pre-order.
        infixArr.slice(0, centralIndex)        // Elements for left subtree in in-order.
      );
    }

    // Process the right subtree if it contains elements.
    if (centralIndex < infixArr.length - 1) {
      // The right child of the current root is located at `centralIndex + 1` in the current prefix array.
      structureInstance.locateNode(centralKey).rightChildLink = prefixArr[centralIndex + 1];
      // Set the parent link for this newly identified right child.
      structureInstance.locateNode(prefixArr[centralIndex + 1]).parentLink = centralKey;
      // Recursively build the right subtree using its respective traversal parts.
      recursiveBuilder(
        prefixArr.slice(centralIndex + 1), // Elements for right subtree in pre-order.
        infixArr.slice(centralIndex + 1)   // Elements for right subtree in in-order.
      );
    }
  };

  // Start the recursive building process with the full traversal arrays.
  recursiveBuilder(prefixTraverse, infixTraverse);

  return structureInstance; // Return the fully constructed tree structure.
}