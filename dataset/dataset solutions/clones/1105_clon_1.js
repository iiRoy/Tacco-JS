class _Node { /* This class defines a node structure for a binary tree.
  * Each node stores a key, and references to its parent, left child, and right child.
  */
  constructor( key, parent = null, left = null, right = null ) {
    // The value stored in this node.
    this.key    = key;
    // A reference to the parent node. Null if this node is the root.
    this.parent = parent;
    // A reference to the left child node. Null if no left child.
    this.left   = left;
    // A reference to the right child node. Null if no right child.
    this.right  = right;
  }


  // Helper method to count the number of children this node has.
  // Returns 0, 1, or 2.
  getChildrenNumber() { return Number(this.left !== null) + Number(this.right !== null); }


  /**
   * Checks if this node is the left child of its parent.
   *
   * @returns {boolean|null} True if it's a left child, false if a right child.
   *                         Returns null if the node has no parent (i.e., it's the root).
   */
  isLeftChild() {
    if ( this.parent === null ) {
      return null;
    }
    return this.parent.left === this;
  }


  // Determines whether the node is a 'left' or 'right' child based on its parent.
  // If no parent, it defaults to 'right' due to the ternary operator.
  getLeftOrRight() { return this.isLeftChild() ? 'left' : 'right'; }


  /*
   * Locates the in-order successor of the current node.
   *
   * The successor is the node with the next largest key value.
   * If a right subtree exists, it's the leftmost node in that subtree.
   * Otherwise, it's the lowest ancestor for which the current node is in its left subtree.
   */
  getSuccessor() {
    let n; // Variable to hold the successor node.

    if ( this.right !== null ) { // Case 1: Node has a right child.
      n = this.right;
      while ( n.left !== null ) { // Traverse down to the leftmost node in the right subtree.
        n = n.left;
      }
    } else { // Case 2: Node has no right child.
      n = this.parent;
      // Traverse up through parents until 'n' is a left child of its parent, or 'n' becomes null (root's successor is null).
      while ( !n.isLeftChild && n.parent != null ) {
        n = n.parent;
      }
    }
    return n;
  }
} // End of _Node class


class BinaryTree { // This class implements a Binary Search Tree (BST) data structure.

  constructor() {
    this.root = null; // The root node of the tree, initially empty.
  }


  // A static getter to provide access to the internal _Node class.
  static get Node() { return _Node; }


  /**
   * Inserts a new key into the binary tree, maintaining BST properties.
   * Duplicate keys are typically not handled in simple BSTs, but this
   * implementation places them on the right side.
   *
   * @param {*} key - The value to be inserted into the tree.
   */
  insert(key) {
    // If the tree is currently empty, the new key becomes the root.
    if ( this.root === null ) {
      this.root = new BinaryTree.Node(key);
      return;
    }

    let x = this.root; // Start traversal from the root.
    let y;             // 'y' will track the parent of 'x'.

    // Create the new node to be inserted.
    let newNode = new BinaryTree.Node(key);

    // Traverse the tree to find the appropriate insertion point.
    while ( x !== null ) {
      y = x; // Update 'y' to be the current node 'x'.
      // Move 'x' to either its left or right child based on the key comparison.
      x = x[key < x.key ? 'left' : 'right'];
    }

    // Set the parent of the new node.
    newNode.parent = y;
    // Link the new node as either the left or right child of its parent 'y'.
    y[key < y.key ? 'left' : 'right'] = newNode;
  }


  /**
   * Searches for a node with the given key within the tree.
   * This is a recursive search implementation.
   *
   * @param {*} key - The key value to search for.
   * @param {Node} [n=this.root] - The current node in the recursive search (defaults to the tree's root).
   * @returns {Node|null} The node containing the key, or null if the key is not found.
   */
  find(key, n = this.root) {
    // Base cases for recursion: node found, or end of a branch reached.
    if ( n === null || n.key === key ) {
      return n;
    }

    // Recursively search in the left or right subtree.
    return this.find(key, n[key < n.key ? 'left' : 'right']);
  }


  /**
   * Deletes a node with the specified key from the tree.
   *
   * IMPORTANT NOTE: This implementation has a known limitation.
   * If the node to be deleted is the root node and it has 0 or 1 child,
   * the code will attempt to access `null.parent` or `null[property]`,
   * leading to a TypeError (runtime error).
   * This behavior is preserved as per Type I clone requirements.
   *
   * @param {*} key - The key of the node to delete.
   */
  delete(key) {
    const n = this.find(key); // First, locate the node to be deleted.

    // If the node with the given key is not found, there's nothing to delete.
    if ( n === null ) return;

    // Determine if the node 'n' is a left or right child of its parent.
    // If 'n' is the root, getLeftOrRight() will return 'right'.
    let leftOrRight = n.getLeftOrRight();

    // Handle the deletion based on the number of children the node 'n' has.
    switch ( n.getChildrenNumber() ) {

    case 0: // Case 0: The node 'n' is a leaf node (has no children).
      // Attempt to remove the parent's reference to 'n'.
      // This will cause a TypeError if 'n' is the root node because n.parent would be null.
      n.parent[leftOrRight] = null;
      break;

    case 1: // Case 1: The node 'n' has exactly one child.
      // Replace 'n' with its single child.
      // This will cause a TypeError if 'n' is the root node because n.parent would be null.
      n.parent[leftOrRight] = n.left || n.right;
      // Update the child's parent reference to point to 'n's original parent.
      n.parent[leftOrRight].parent = n.parent;
      break;

    default: // Case 2: The node 'n' has two children.
      // Find the in-order successor of 'n'.
      let skey = n.getSuccessor().key;
      // Recursively delete the successor (which will always have 0 or 1 child).
      this.delete(skey);
      // Replace 'n's key with the successor's key.
      n.key = skey;
    }
  }


  // Performs an in-order traversal of the tree and prints the keys.
  // In-order traversal visits nodes in ascending order of their keys.
  printByIneorder() {
    let str = ''; // String to accumulate the keys.

    // Inner recursive function for the in-order traversal.
    const innerFunc = (n) => {
      if ( n === null ) return; // Base case: end of a branch.

      innerFunc(n.left);      // Traverse left subtree.
      str += ` ${n.key}`;     // Visit the current node (append its key).
      innerFunc(n.right);     // Traverse right subtree.
    }

    innerFunc(this.root); // Start the traversal from the root.
    console.log(str);     // Print the accumulated string.
  }


  // Performs a pre-order traversal of the tree and prints the keys.
  // Pre-order traversal visits the current node, then its left child, then its right child.
  printByPreorder() {
    let str = ''; // String to accumulate the keys.

    // Inner recursive function for the pre-order traversal.
    const innerFunc = (n) => {
      if ( n === null ) return; // Base case: end of a branch.

      str += ` ${n.key}`;     // Visit the current node (append its key).
      innerFunc(n.left);      // Traverse left subtree.
      innerFunc(n.right);     // Traverse right subtree.
    }

    innerFunc(this.root); // Start the traversal from the root.
    console.log(str);     // Print the accumulated string.
  }


  // Convenience method to print both in-order and pre-order traversals.
  print() {
    this.printByIneorder();
    this.printByPreorder();
  }
} // End of BinaryTree class definition.


// Main execution block: a self-invoking anonymous function.
(function main() {
  // Read all input lines from standard input, trim whitespace, and split into an array.
  const lines = require('fs').readFileSync('/dev/stdin', 'utf8').trim().split('\n');

  // The first line often contains the number of operations, which is parsed but not used later.
  const n = Number(lines.shift());

  const tree = new BinaryTree(); // Instantiate a new BinaryTree.

  // Iterate over each command line received from input.
  lines.forEach(function(cmd) {
    // Use a switch statement to process different types of commands.
    switch ( cmd.charAt(0) ) {
    case 'i': // 'i' for insert.
      tree.insert(Number(cmd.split(' ')[1])); // Parse key and insert.
      break;
    case 'f': // 'f' for find.
      // Find the key and print 'yes' or 'no' based on whether it was found.
      console.log(tree.find(Number(cmd.split(' ')[1])) ? 'yes' : 'no');
      break;
    case 'd': // 'd' for delete.
      tree.delete(Number(cmd.split(' ')[1])); // Parse key and delete.
      break;
    default: // Any other command (e.g., 'p' for print, or unknown commands).
      tree.print(); // Perform tree printing.
    }
  });
})(); // Execute the main function.