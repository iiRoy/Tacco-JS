class BinaryTree
{
    // Constructor: Initializes a new BinaryTree with 'n' nodes.
    // Each node is given a unique ID and default parent/child pointers.
    constructor( n )
    {
        this.nodes = []; // Array to store all node objects in the tree.

        // Loop to create 'n' node objects.
        for ( let i = 0; i < n; i++ )
        {
            // Each node is an object with an ID, parentId, leftChildId, and rightChildId.
            // -1 indicates no parent or child.
            this.nodes[ i ] = {
                id       : i + 1,    // Node ID (1-based for easier human understanding).
                parentId : -1,       // Default: no parent.
                leftId   : -1,       // Default: no left child.
                rightId  : -1        // Default: no right child.
            };
        }
    }


    // Getter property to find the root node of the tree.
    // The root node is defined as the node whose parentId is -1.
    get root()
    {
        return this.nodes.find( ( n ) => n.parentId === -1 );
    }


    // Method to retrieve a node object by its ID.
    // Assumes node IDs are 1-based, while the 'nodes' array is 0-indexed.
    find( id )
    {
        return this.nodes[ id - 1 ];
    }


    // Method to perform a postorder traversal of the tree.
    // Returns an array of node IDs in postorder sequence.
    getByPostorder()
    {
        let res = []; // Array to accumulate the postorder traversal result.

        // Inner recursive function to perform the postorder traversal.
        // It takes the current node's ID as an argument.
        const postorder = ( id ) =>
        {
            // Base case: If the node ID is -1, it means there's no child (null node), so return.
            if ( id === -1 )
            {
                return;
            }

            // Find the current node object using its ID.
            let n = this.find( id );

            // Recursively visit the left subtree.
            postorder( n.leftId );

            // Recursively visit the right subtree.
            postorder( n.rightId );

            // After visiting both left and right children, add the current node's ID to the result.
            res.push( id );
        };

        // Initiate the postorder traversal starting from the root of the tree.
        postorder( this.root.id );

        // Return the final array containing node IDs in postorder.
        return res;
    }
}


// Immediately Invoked Function Expression (IIFE) to encapsulate the main program logic.
( function main()
{
    // Read all input from standard input (/dev/stdin).
    // - readFileSync: Reads the entire file synchronously.
    // - 'utf8': Specifies the encoding.
    // - trim(): Removes leading/trailing whitespace.
    // - split('\n'): Splits the input string into an array of lines.
    const lines = require( 'fs' ).readFileSync( '/dev/stdin', 'utf8' ).trim().split( '\n' );

    // The first line contains the total number of nodes 'n'.
    // - shift(): Removes the first element from the array and returns it.
    // - Number(): Converts the string to a number.
    const n = Number( lines.shift() );

    // The second line contains the preorder traversal sequence.
    // - split(' '): Splits the line into an array of strings by space.
    // - map(Number): Converts each string element to a number.
    const preOrder = lines.shift().split( ' ' ).map( Number );

    // The third line contains the inorder traversal sequence.
    // - split(' '): Splits the line into an array of strings by space.
    // - map(Number): Converts each string element to a number.
    const inOrder = lines.shift().split( ' ' ).map( Number );


    // Call the makeTree function to construct the binary tree from the given traversals.
    let tree = makeTree( preOrder, inOrder );

    // Get the postorder traversal of the constructed tree.
    // - join(' '): Joins the array elements into a single string, separated by spaces.
    // - console.log(): Prints the result to standard output.
    console.log( tree.getByPostorder().join( ' ' ) );

} )();


// Function to reconstruct a binary tree given its preorder and inorder traversals.
// It returns a BinaryTree object.
function makeTree( preOrder, inOrder )
{
    // Initialize a new BinaryTree with the number of nodes determined by the preorder length.
    let tree = new BinaryTree( preOrder.length );

    // This is a recursive helper function that constructs subtrees.
    // 'p' represents the current segment of the preorder array for the subtree.
    // 'i' represents the current segment of the inorder array for the subtree.
    const innerMakeTree = ( p, i ) =>
    {
        // In preorder traversal, the first element is always the root of the current subtree.
        let midId = p[ 0 ];

        // Find the index of this root (midId) within the current inorder segment.
        // Elements to the left of midId in inorder belong to the left subtree.
        // Elements to the right of midId in inorder belong to the right subtree.
        let midIdx = i.indexOf( midId );

        // Check if there's a left subtree (i.e., elements to the left of midId in inorder).
        if ( midIdx > 0 )
        {
            // In preorder, the element immediately after the root (p[1]) is the root of its left child.
            tree.find( midId ).leftId = p[ 1 ];

            // Set the parent of this left child node.
            tree.find( p[ 1 ] ).parentId = midId;

            // Recursively call innerMakeTree for the left subtree:
            // - Preorder segment for left child: from index 1 up to (midIdx + 1) in current 'p'.
            // - Inorder segment for left child: from index 0 up to (midIdx) in current 'i'.
            innerMakeTree( p.slice( 1, midIdx + 1 ), i.slice( 0, midIdx ) );
        }

        // Check if there's a right subtree (i.e., elements to the right of midId in inorder).
        if ( midIdx < i.length - 1 )
        {
            // In preorder, the element at index (midIdx + 1) in current 'p' is the root of the right child.
            tree.find( midId ).rightId = p[ midIdx + 1 ];

            // Set the parent of this right child node.
            tree.find( p[ midIdx + 1 ] ).parentId = midId;

            // Recursively call innerMakeTree for the right subtree:
            // - Preorder segment for right child: from index (midIdx + 1) to the end of current 'p'.
            // - Inorder segment for right child: from index (midIdx + 1) to the end of current 'i'.
            innerMakeTree( p.slice( midIdx + 1 ), i.slice( midIdx + 1 ) );
        }
    };

    // Start the tree construction process with the full initial preorder and inorder arrays.
    innerMakeTree( preOrder, inOrder );

    // Return the fully constructed BinaryTree object.
    return tree;
}