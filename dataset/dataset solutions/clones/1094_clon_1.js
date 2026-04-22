/*
 * This file defines a BinaryTree class and related functions
 * to construct a binary tree from its preorder and inorder traversals
 * and then output its postorder traversal.
 */

// Define the BinaryTree class.
class BinaryTree {
  /**
   * Constructs a new BinaryTree instance with 'n' nodes.
   * Each node is initialized with a unique ID, no parent, and no children.
   * @param {number} n - The number of nodes in the tree.
   */
  constructor (  n   ) {
    this.nodes = [ ]; // Initialize an empty array to store tree nodes.

    // Populate the nodes array with initial node objects.
    for ( let i = 0 ; i < n ; i++ ) {
      this.nodes [ i ] = {
        id:        i + 1,      // Node ID (1-based index)
        parentId:  -1,         // No parent initially
        leftId:    -1,         // No left child initially
        rightId:   -1          // No right child initially
      };
    }
  }

  /**
   * Retrieves the root node of the tree.
   * The root node is identified by having a parentId of -1.
   * @returns {object} The root node object.
   */
  get root (   ) {
    // Find the node whose parentId is -1.
    return this.nodes.find(  n => n.parentId === -1  );
  }

  /**
   * Adds left and right children to a specified node.
   * It also updates the parentId for the new children.
   * @param {number} id      - The ID of the parent node.
   * @param {number} leftId  - The ID of the left child, or -1 if no left child.
   * @param {number} rightId - The ID of the right child, or -1 if no right child.
   */
  add (  id,   leftId,   rightId  ) {
    let   n = this.find(  id  ); // Get the node by its ID.

    // Assign left and right child IDs using array destructuring.
    [ n.leftId, n.rightId ] = [ leftId, rightId ];

    // If a left child exists, set its parentId to the current node's ID.
    if ( leftId !== -1 ) {
      this.find(  leftId  ).parentId = id;
    }

    // If a right child exists, set its parentId to the current node's ID.
    if ( rightId !== -1 ) {
      this.find(  rightId  ).parentId = id;
    }
  }

  /**
   * Finds a node in the tree by its ID.
   * Node IDs are 1-based, so array index is ID - 1.
   * @param {number} id - The ID of the node to find.
   * @returns {object} The node object.
   */
  find (  id  ) {
    return this.nodes [ id - 1 ];
  }

  /**
   * Performs a postorder traversal of the tree and returns the node IDs.
   * Postorder traversal: Left -> Right -> Root.
   * @returns {Array<number>} An array of node IDs in postorder.
   */
  getByPostorder (   ) {
    let res = [ ]; // Initialize an empty array to store the result.

    /**
     * Recursive helper function for postorder traversal.
     * @param {number} id - The ID of the current node to visit.
     */
    const postorder = (  id  ) => {
      // Base case: if the node ID is -1 (null), return.
      if ( id === -1 ) return;

      let n = this.find(  id  ); // Get the current node.

      // Recursively traverse the left subtree.
      postorder(  n.leftId  );
      // Recursively traverse the right subtree.
      postorder(  n.rightId  );

      // Add the current node's ID to the result after visiting children.
      res.push(  id  );
    };

    // Start the postorder traversal from the root node.
    postorder(  this.root.id  );

    return res;
  }
}

// Main execution block: an Immediately Invoked Function Expression (IIFE).
( function main (   ) {
  // Read input from stdin, decode as UTF-8, trim whitespace, and split into lines.
  const lines = require( 'fs' )
    .readFileSync( '/dev/stdin',   'utf8'   )
    .trim(   )
    .split(   '\n'   );

  // The first line contains the number of nodes 'n'.
  const n = Number(  lines.shift(   )  );

  // The second line contains the preorder traversal sequence.
  const preOrder = lines.shift(   )
    .split(   ' '   )
    .map(   Number   );

  // The third line contains the inorder traversal sequence.
  const inOrder = lines.shift(   )
    .split(   ' '   )
    .map(   Number   );

  // Construct the binary tree using the preorder and inorder sequences.
  let tree = makeTree(  preOrder,   inOrder  );

  // Get the postorder traversal, join node IDs with spaces, and print to console.
  console.log(  tree.getByPostorder(   ).join(   ' '   )  );
} ) (   ); // Invoke the main function.

/**
 * Constructs a binary tree from its preorder and inorder traversals.
 * This function uses a recursive approach to build the tree structure.
 * @param {Array<number>} preOrder - The preorder traversal sequence.
 * @param {Array<number>} inOrder  - The inorder traversal sequence.
 * @returns {BinaryTree} The constructed BinaryTree object.
 */
function makeTree (  preOrder,   inOrder  ) {
  // Initialize a new BinaryTree with the total number of nodes.
  let tree = new BinaryTree(  preOrder.length  );

  /**
   * Recursive helper function to build the tree.
   * It takes slices of preorder and inorder arrays representing subtrees.
   * @param {Array<number>} p - Current preorder slice.
   * @param {Array<number>} i - Current inorder slice.
   * @returns {number} The ID of the root of the current subtree, or -1 if empty.
   */
  const func = (  p,   i  ) => {
    // If either traversal is empty, there's no subtree.
    if ( p.length === 0 || i.length === 0 ) {
      return -1;
    }

    // The first element in preorder is always the root of the current subtree.
    let rootId = p [ 0 ];
    let idx, rootIdx;

    // Find the rootId in the inorder traversal to determine left/right subtrees.
    for ( idx = 0; idx < p.length; idx++ ) {
      if ( ( rootIdx = i.indexOf(  rootId  ) ) !== -1 ) {
        break; // Found the root in inorder.
      }
    }

    // If root is not found or it's a leaf/single node, handle base cases.
    if ( rootIdx === -1 && i.length <= 1 ) {
      return i [ 0 ] || -1; // Return the node if it exists, otherwise -1.
    }

    // Split the inorder traversal into left and right subtrees.
    let leftIds = i.slice(  0,   rootIdx  );
    let rightIds = i.slice(  rootIdx + 1  );

    // Recursively build the left and right subtrees.
    // The preorder for the left subtree starts from the second element of 'p'
    // and corresponds to the length of 'leftIds'.
    // The preorder for the right subtree follows the left subtree's preorder.
    tree.add(
      rootId,
      func(  p.slice(  1,   1 + leftIds.length  ),   leftIds  ),
      func(  p.slice(  1 + leftIds.length  ),   rightIds  )
    );

    return rootId; // Return the ID of the current subtree's root.
  };

  // Start the recursive tree construction with the full preorder and inorder arrays.
  func(  preOrder,   inOrder  );

  return tree; // Return the fully constructed BinaryTree.
}