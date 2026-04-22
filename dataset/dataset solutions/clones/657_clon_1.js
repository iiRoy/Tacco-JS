/*
 * This is a Type I clone of the original JavaScript code.
 * All functional aspects, identifiers, and expressions remain identical.
 * Only whitespace and comments have been altered significantly
 * to create a visually distinct, yet functionally equivalent, file.
 */

// Initialize an empty string to accumulate input data.
let input = '';

// Ensure the standard input stream continues to run.
process . stdin . resume ( ) ;

// Set the encoding for the standard input stream to UTF-8.
process . stdin . setEncoding ( 'utf8' ) ;

/*
 * Event listener for 'data' chunks received from stdin.
 * Appends each chunk to the 'input' string.
 */
process . stdin . on ( 'data' , function ( chunk ) {
  input += chunk ; // Concatenate the incoming data chunk.
} ) ;

/*
 * Event listener for the 'end' of the standard input stream.
 * This is where the main processing logic begins after all input is received.
 */
process . stdin . on ( 'end' , function ( ) {
  // Split the accumulated input string into an array of lines.
  const inputs = input . split ( '\n' ) ;

  // Remove the last element, which is typically an empty string due to the trailing newline.
  inputs . pop ( ) ;

  /**
   * Represents a node in a binary tree structure.
   * Each node can have a left child, a right child, and a reference to its parent.
   */
  class Node {
    /*
     * Constructor for the Node class.
     * Initializes left, right, and parent pointers to null.
     */
    constructor ( ) {
      this . left = null ;   // Pointer to the left child node.
      this . right = null ;  // Pointer to the right child node.
      this . parent = null ; // Pointer to the parent node.
    }

    /**
     * Inserts a given node as the left child of the current node.
     * Also sets the parent of the inserted node to the current node.
     * @param {Node} node - The node to be inserted as the left child.
     */
    insertLeft ( node ) {
      this . left = node ;     // Assign the new node as the left child.
      node . parent = this ;   // Set the parent of the new node.
    }

    /**
     * Inserts a given node as the right child of the current node.
     * Also sets the parent of the inserted node to the current node.
     * @param {Node} node - The node to be inserted as the right child.
     */
    insertRight ( node ) {
      this . right = node ;    // Assign the new node as the right child.
      node . parent = this ;   // Set the parent of the new node.
    }

    /**
     * Returns a string representation of the node and its children.
     * Uses a recursive approach to build the string in a parenthesized format.
     * Example: ( (A,B), (C,D) )
     * @returns {string} The string representation of the tree rooted at this node.
     */
    toString ( ) {
      return `(${this.left == null ? '' : this.left.toString()},${this.right == null ? '' : this.right.toString()})` ;
    }
  }

  /*
   * Creates a binary tree structure from a string representation.
   * The string format uses parentheses and commas to denote tree structure.
   * Example: "((),())" represents a tree with a root and two empty children.
   * @param {string} str - The string representation of the tree.
   * @returns {Node} The root node of the created tree (specifically its left child, based on problem spec).
   */
  const createTree = str => {
    const root = new Node ( ) ; // Create a dummy root node.
    let tree = root ;            // Current node being processed.
    let comma = 0 ;              // Flag to indicate if a comma has been encountered (0 for left child, 1 for right).

    // Iterate over each character in the input string.
    for ( const s of str ) {
      if ( s == "(" ) {
        const child = new Node ( ) ; // Create a new child node.
        if ( comma == 0 ) {
          tree . insertLeft ( child ) ; // Insert as left child if no comma.
        } else {
          tree . insertRight ( child ) ; // Insert as right child if comma seen.
        }
        tree = child ; // Move current tree pointer to the newly inserted child.
      }
      if ( s == "," ) {
        comma = 1 ; // Set comma flag.
      }
      if ( s == ")" ) {
        tree = tree . parent ; // Move current tree pointer up to its parent.
        comma = 0 ;            // Reset comma flag for the parent's next child.
      }
    }
    return tree . left ; // Return the actual root of the tree (left child of the dummy root).
  } ;

  /*
   * Computes the union of two binary trees.
   * The union creates a new node if either input node exists.
   * If both are null, it returns null.
   * @param {Node} a - The first tree node.
   * @param {Node} b - The second tree node.
   * @returns {Node|null} The root of the resulting union tree.
   */
  const union = ( a , b ) => {
    const node = new Node ( ) ; // Create a new node for the result.
    if ( a == null ) {
      return b ; // If 'a' is null, return 'b'.
    }
    if ( b == null ) {
      return a ; // If 'b' is null, return 'a'.
    }

    let _res = union ( a . left , b . left ) ; // Recursively compute union for left children.
    if ( _res != null ) {
      node . insertLeft ( _res ) ; // If a result exists, insert it as left child.
    }

    _res = union ( a . right , b . right ) ; // Recursively compute union for right children.
    if ( _res != null ) {
      node . insertRight ( _res ) ; // If a result exists, insert it as right child.
    }
    return node ; // Return the constructed union node.
  } ;

  /*
   * Computes the intersection of two binary trees.
   * The intersection creates a new node only if both input nodes exist.
   * If either input node is null, it returns null.
   * @param {Node} a - The first tree node.
   * @param {Node} b - The second tree node.
   * @returns {Node|null} The root of the resulting intersection tree.
   */
  const intersection = ( a , b ) => {
    const node = new Node ( ) ; // Create a new node for the result.
    if ( a == null || b == null ) {
      return null ; // If either 'a' or 'b' is null, their intersection is null.
    }

    let _res = intersection ( a . left , b . left ) ; // Recursively compute intersection for left children.
    if ( _res != null ) {
      node . insertLeft ( _res ) ; // If a result exists, insert it as left child.
    }

    _res = intersection ( a . right , b . right ) ; // Recursively compute intersection for right children.
    if ( _res != null ) {
      node . insertRight ( _res ) ; // If a result exists, insert it as right child.
    }
    return node ; // Return the constructed intersection node.
  } ;

  // Process each input line to perform union or intersection operations.
  for ( const input of inputs ) {
    // Destructure the input line into operation type, tree string 1, and tree string 2.
    const [ type , treeStr , treeStr2 ] = input . split ( ' ' ) ;

    // Create the first tree from its string representation.
    const tree = createTree ( treeStr ) ;

    // Create the second tree from its string representation.
    const tree2 = createTree ( treeStr2 ) ;

    let res ; // Variable to store the result of the operation.

    // Perform union or intersection based on the 'type' flag.
    if ( type == "u" ) {
      res = union ( tree , tree2 ) ; // Call the union function.
    } else if ( type == "i" ) {
      res = intersection ( tree , tree2 ) ; // Call the intersection function.
    }

    // Print the string representation of the resulting tree.
    console . log ( res . toString ( ) ) ;
  }
} ) ;