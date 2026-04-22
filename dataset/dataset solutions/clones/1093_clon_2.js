/*
 * This file contains a JavaScript implementation for constructing and traversing
 * a binary tree data structure based on preorder and inorder traversals.
 * It demonstrates how to build a tree and then retrieve its postorder traversal.
 */

class NodeStructure
{
  // Constructor to initialize the collection of elements.
  constructor (totalElements)
  {
    this.elementCollection = []; // Array to store all individual node elements.
    for ( let idx = 0;   idx < totalElements;   idx++ )
    {
      this.elementCollection[idx] = { key: idx + 1, supraKey: -1, leftLink: -1, rightLink: -1 };
    }
  }

  // Getter method to retrieve the primary (root) element of the structure.
  get baseNode ()
  {
    return this.elementCollection.find(  elem => elem.supraKey === -1  );
  }

  // Locates an element within the collection by its unique key.
  locate (elementKey)
  {
    return this.elementCollection[elementKey - 1];
  }

  // Performs a postorder traversal of the tree and returns the sequence of keys.
  retrieveInPostTraversal ()
  {
    let resultSequence = []; // Stores the keys in postorder.

    // Inner recursive function to perform the postorder traversal.
    const traversePostOrder = (currentKey) =>
    {
      if ( currentKey === -1 ) {
        return; // Base case: end of a branch.
      }
      let currentNode = this.locate(currentKey); // Get the current node element.
      traversePostOrder(currentNode.leftLink);   // Recursively visit left child.
      traversePostOrder(currentNode.rightLink);  // Recursively visit right child.
      resultSequence.push(currentKey);           // Add current node's key to result.
    };

    traversePostOrder(this.baseNode.key); // Start traversal from the root node.
    return resultSequence;                // Return the collected sequence.
  }
}

// Self-invoking function to kick off the main program execution.
( function executeProgram ()
{
  // Acquire input data from standard input.
  const inputLines = require('fs').readFileSync('/dev/stdin', 'utf8').trim().split('\n');

  // Parse the number of items (not directly used for tree construction in this specific logic, but often present).
  const numItems = Number(inputLines.shift());

  // Extract and parse the preorder traversal sequence.
  const prefixedTraversal = inputLines.shift().split(' ').map(Number);

  // Extract and parse the inorder traversal sequence.
  const infixTraversal = inputLines.shift().split(' ').map(Number);

  // Construct the binary tree using the provided traversals.
  let structureInstance = constructStructure(prefixedTraversal, infixTraversal);

  // Output the postorder traversal of the constructed tree, joined by spaces.
  console.log(structureInstance.retrieveInPostTraversal().join(' '));

} )();


/*
 * Function to build a binary tree from its preorder and inorder traversal sequences.
 * This is a common algorithm for binary tree reconstruction.
 */
function constructStructure (prefixSeq, infixSeq)
{
  // Initialize a new tree structure with the total number of elements.
  let currentStructure = new NodeStructure(prefixSeq.length);

  // Recursive helper function to build subtrees.
  const recursiveBuilder = (prefixSubArray, infixSubArray) =>
  {
    // The first element in preorder traversal is always the root of the current subtree.
    let middleKey = prefixSubArray[0];
    // Find the position of this root in the inorder traversal to determine left and right subtrees.
    let middleIndex = infixSubArray.indexOf(middleKey);

    // If there's a left subtree (elements before middleKey in inorder).
    if ( middleIndex > 0 )
    {
      // Link the current middle node to its left child.
      currentStructure.locate(middleKey).leftLink = prefixSubArray[1];
      // Set the parent of the left child.
      currentStructure.locate(prefixSubArray[1]).supraKey = middleKey;
      // Recursively build the left subtree.
      recursiveBuilder(
        prefixSubArray.slice(1, middleIndex + 1),
        infixSubArray.slice(0, middleIndex)
      );
    }

    // If there's a right subtree (elements after middleKey in inorder).
    if ( middleIndex < infixSubArray.length - 1 )
    {
      // Link the current middle node to its right child.
      currentStructure.locate(middleKey).rightLink = prefixSubArray[middleIndex + 1];
      // Set the parent of the right child.
      currentStructure.locate(prefixSubArray[middleIndex + 1]).supraKey = middleKey;
      // Recursively build the right subtree.
      recursiveBuilder(
        prefixSubArray.slice(middleIndex + 1),
        infixSubArray.slice(middleIndex + 1)
      );
    }
  };

  // Start the recursive building process with the full traversal sequences.
  recursiveBuilder(prefixSeq, infixSeq);

  return currentStructure; // Return the fully constructed tree.
}