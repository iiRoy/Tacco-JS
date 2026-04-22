/*
 * This file defines a BinaryTree class and demonstrates its usage
 * for tree traversals (preorder, inorder, postorder).
 *
 * It processes input from stdin to construct the tree.
 */

class BinaryTree
{
    // Constructor initializes the tree with a given number of nodes.
    constructor( n )
    {
        // Array to hold all node objects.
        this.nodes = [];

        /*
         * Initialize each node with default values:
         * id, parentId, leftId, rightId are all set to -1 initially.
         */
        for ( let i = 0; i < n; i++ )
            this.nodes[i] = { id: -1, parentId: -1, leftId: -1, rightId: -1 };
    }


    // Getter for the root node.
    // The root node is identified as the node with no parent (parentId === -1).
    get root( )
    {
        return this.nodes.find( n => n.parentId === -1 );
    }


    /*
     * Adds a node's details to the tree.
     * Links child nodes back to their parent.
     */
    add( id, leftId, rightId )
    {
        let n = this.nodes[id]; // Retrieve the node object by its ID.

        // Destructure assignment to set the node's properties.
        [ n.id, n.leftId, n.rightId ] = [ id, leftId, rightId ];


        // If a left child exists, set its parentId to the current node's id.
        if ( leftId !== -1 )
        {
            this.find( leftId ).parentId = id;
        }


        // If a right child exists, set its parentId to the current node's id.
        if ( rightId !== -1 )
        {
            this.find( rightId ).parentId = id;
        }
    }


    // Finds and returns a node by its ID.
    // Returns an empty object if the node is not found (though it should always be found if ID is valid).
    find( id )
    {
        return this.nodes[id] || {};
    }


    // Performs a preorder traversal of the tree starting from the given ID.
    // Default start ID is the root's ID.
    preorder( id = this.root.id )
    {
        // Base case: if the node ID is -1, it's a null node, so return.
        if ( id === -1 )
        {
            return;
        }

        // Get the current node object.
        let n = this.find( id );

        // Print the current node's ID.
        process.stdout.write( ` ${id}` );

        // Recursively traverse the left subtree.
        this.preorder( n.leftId );

        // Recursively traverse the right subtree.
        this.preorder( n.rightId );
    }


    // Performs an inorder traversal of the tree.
    // Default start ID is the root's ID.
    inorder( id = this.root.id )
    {
        // Base case for recursion.
        if ( id === -1 )
        {
            return;
        }

        let n = this.find( id );

        // Traverse left.
        this.inorder( n.leftId );

        // Visit current node.
        process.stdout.write( ` ${id}` );

        // Traverse right.
        this.inorder( n.rightId );
    }


    // Performs a postorder traversal of the tree.
    // Default start ID is the root's ID.
    postorder( id = this.root.id )
    {
        // Base case.
        if ( id === -1 )
        {
            return;
        }

        let n = this.find( id );

        // Traverse left subtree.
        this.postorder( n.leftId );

        // Traverse right subtree.
        this.postorder( n.rightId );

        // Visit current node after children.
        process.stdout.write( ` ${id}` );
    }
}


/*
 * Main execution block using an Immediately Invoked Function Expression (IIFE).
 * This ensures variables declared here don't pollute the global scope.
 */
( function main( )
{
    // Read all input lines from stdin.
    const lines = require( 'fs' ).readFileSync( '/dev/stdin', 'utf8' ).trim( ).split( '\n' );

    // The first line contains the number of nodes.
    const n = Number( lines.shift( ) );

    // Create a new BinaryTree instance.
    let tree = new BinaryTree( n );

    /*
     * Process remaining lines to add nodes to the tree.
     * Each line represents a node's ID, left child ID, and right child ID.
     */
    lines.map( l => l.split( ' ' ).map( Number ) ).forEach( line => tree.add( ...line ) );

    // Perform and print preorder traversal.
    console.log( 'Preorder' );
    tree.preorder( );

    // Perform and print inorder traversal.
    console.log( '\nInorder' );
    tree.inorder( );

    // Perform and print postorder traversal.
    console.log( '\nPostorder' );
    tree.postorder( );

    // Add a final newline for clean output.
    console.log( );
} ) ( );