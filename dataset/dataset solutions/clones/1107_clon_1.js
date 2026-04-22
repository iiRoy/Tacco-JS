/*
 * This file defines a Node class for a Binary Search Tree
 * and a BinaryTree class that uses these nodes.
 */

class _Node { // Represents a single node in the binary tree.
    /*
     * Constructor for the _Node class.
     * Initializes a new node with a key and optional parent, left, and right children.
     */
    constructor ( key, parent = null, left = null, right = null ) {
        // Assign the provided key to the node.
        this.key = key;

        // Assign the parent node. Defaults to null if not provided.
        this.parent = parent;

        // Assign the left child node. Defaults to null.
        this.left = left;

        // Assign the right child node. Defaults to null.
        this.right = right;
    }


    /**
     *  Calculates the number of children this node has.
     *  Returns 0, 1, or 2.
     */
    getChildrenNumber ( ) {
        return Number ( this.left !== null ) + Number ( this.right !== null ) ;
    }


    // Determines if this node is the left child of its parent.
    isLeftChild ( ) {
        if ( this.parent === null ) { // If there's no parent, it can't be a left child.
            return null;
        }

        // Compare this node with its parent's left child.
        return this.parent.left === this;
    }


    /*
     *  Returns a string indicating whether the node is a 'left' or 'right' child.
     *  Assumes the node has a parent.
     */
    getLeftOrRight ( ) {
        return this.isLeftChild ( ) ? 'left' : 'right' ;
    }


    // Finds the in-order successor of this node.
    getSuccessor ( ) {
        let n; // Declare a variable to hold the successor node.

        if ( this.right !== null ) {
            // If the node has a right child, the successor is the leftmost node in the right subtree.
            n = this.right;
            while ( n.left !== null ) {
                n = n.left;
            }
        } else {
            // If no right child, traverse up until a parent is found for which this node is in its left subtree.
            n = this.parent;
            /*
             * The original code uses `!n.isLeftChild` which is a property access, not a method call.
             * This means `n.isLeftChild` (the function reference) is truthy, so `!n.isLeftChild` is `false`.
             * The loop `while (!n.isLeftChild && n.parent != null)` will only iterate if `n.parent != null`
             * and `!n.isLeftChild` is true, which it never will be with `isLeftChild` being a method.
             * This implies a potential logical quirk in the original code, but as a Type I clone,
             * the exact expression must be preserved.
             */
            while ( ! n.isLeftChild && n.parent != null ) {
                n = n.parent;
            }
        }

        return n; // Return the found successor node.
    }
}


// Defines the BinaryTree class.
class BinaryTree {

    /*
     *  Constructor for the BinaryTree.
     *  Initializes the tree with a null root.
     */
    constructor ( ) {
        this.root = null; // The root of the binary tree.
    }


    /*
     *  Static getter to expose the internal _Node class.
     *  Allows external access to BinaryTree.Node.
     */
    static get Node ( ) {
        return _Node;
    }


    // Inserts a new key into the binary tree.
    insert ( key ) {
        // If the tree is empty, the new node becomes the root.
        if ( this.root === null ) {
            this.root = new BinaryTree.Node ( key ) ;
            return; // Insertion complete.
        }

        let x = this.root, y; // x starts at root, y will track the parent of x.
        let newNode = new BinaryTree.Node ( key ) ; // Create the new node to be inserted.

        // Traverse the tree to find the correct insertion point.
        while ( x !== null ) {
            y = x; // y becomes the current node.
            // Move x to the left or right child based on the key comparison.
            x = x [ key < x.key ? 'left' : 'right' ] ;
        }

        newNode.parent = y; // Set the parent of the new node.
        // Link the parent (y) to the new node (newNode) as its left or right child.
        y [ key < y.key ? 'left' : 'right' ] = newNode;
    }


    /**
     *  Finds a node with the given key in the tree.
     *  @param {any} key - The key to search for.
     *  @param {_Node} n - The current node to start searching from (defaults to root).
     *  @returns {_Node|null} The node if found, otherwise null.
     */
    find ( key, n = this.root ) {
        // Base case: if node is null or key is found.
        if ( n === null || n.key === key ) {
            return n;
        }

        // Recursively search in the left or right subtree.
        return this.find ( key, n [ key < n.key ? 'left' : 'right' ] ) ;
    }


    // Deletes a node with the specified key from the tree.
    delete ( key ) {
        const n = this.find ( key ) ; // Find the node to be deleted.
        let leftOrRight = n.getLeftOrRight ( ) ; // Determine if n is a left or right child of its parent.

        // Handle different cases based on the number of children the node has.
        switch ( n.getChildrenNumber ( ) ) {
            case 0 : // Case 0: Node has no children.
                n.parent [ leftOrRight ] = null ; // Simply remove the reference from its parent.
                break;
            case 1 : // Case 1: Node has one child.
                // Replace the node with its single child.
                n.parent [ leftOrRight ] = n.left || n.right ;
                // Update the parent reference of the child.
                n.parent [ leftOrRight ] . parent = n.parent ;
                break;
            default : // Case 2: Node has two children.
                // Find the in-order successor.
                let s = n.getSuccessor ( ) ;
                // Replace the key of the node to be deleted with the successor's key.
                n.key = s.key;
                // Recursively delete the successor node (which now has at most one child).
                this.delete ( s ) ;
        }
    }


    /*
     *  Prints the tree elements in in-order traversal.
     *  (Left -> Root -> Right)
     */
    printByIneorder ( ) {
        let str = ''; // Accumulator for the string representation.

        // Inner recursive function for in-order traversal.
        const innerFunc = ( n ) => {
            if ( n === null ) {
                return; // Base case: end of branch.
            }
            innerFunc ( n.left ) ; // Traverse left subtree.
            str += ` ${ n.key }` ; // Append current node's key.
            innerFunc ( n.right ) ; // Traverse right subtree.
        }

        innerFunc ( this.root ) ; // Start traversal from the root.
        console.log ( str ) ; // Print the accumulated string.
    }


    /*
     *  Prints the tree elements in pre-order traversal.
     *  (Root -> Left -> Right)
     */
    printByPreorder ( ) {
        let str = ''; // Accumulator for the string representation.

        // Inner recursive function for pre-order traversal.
        const innerFunc = ( n ) => {
            if ( n === null ) {
                return; // Base case: end of branch.
            }
            str += ` ${ n.key }` ; // Append current node's key.
            innerFunc ( n.left ) ; // Traverse left subtree.
            innerFunc ( n.right ) ; // Traverse right subtree.
        }

        innerFunc ( this.root ) ; // Start traversal from the root.
        console.log ( str ) ; // Print the accumulated string.
    }


    // Prints both in-order and pre-order traversals of the tree.
    print ( ) {
        this.printByIneorder ( ) ; // Call in-order print.
        this.printByPreorder ( ) ; // Call pre-order print.
    }
}


/*
 *  Self-invoking function to run the main program logic.
 *  Reads commands from standard input, processes them, and manipulates the BinaryTree.
 */
( function main ( ) {
    // Read input from stdin, trim whitespace, and split into lines.
    const lines = require ( 'fs' ) . readFileSync ( '/dev/stdin', 'utf8' ) . trim ( ) . split ( '\n' ) ;
    // The first line is typically 'n', though its usage is not explicit in the provided code snippet.
    const n = Number ( lines.shift ( ) ) ;

    // Create a new BinaryTree instance.
    const tree = new BinaryTree ( ) ;

    // Process each command line.
    lines.forEach ( function ( cmd ) {
        // Use a switch statement to handle different command types.
        switch ( cmd.charAt ( 0 ) ) {
            case 'i' : // 'i' for insert
                tree.insert ( Number ( cmd.split ( ' ' ) [ 1 ] ) ) ;
                break;
            case 'f' : // 'f' for find
                console.log ( tree.find ( Number ( cmd.split ( ' ' ) [ 1 ] ) ) ? 'yes' : 'no' ) ;
                break;
            case 'd' : // 'd' for delete
                tree.delete ( Number ( cmd.split ( ' ' ) [ 1 ] ) ) ;
                break;
            default : // Any other command (e.g., 'p' for print)
                tree.print ( ) ;
        }
    } ) ;
} ) ( ) ; // Immediately invoke the main function.