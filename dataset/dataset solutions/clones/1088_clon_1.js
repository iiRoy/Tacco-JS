function memoization(f)
{
    // This function creates a memoized version of another function 'f'.
    // It stores the results of function calls in a cache to avoid
    // recomputing them for the same arguments.
    const cache = {};

    // Return a new function that acts as the memoized version of 'f'.
    return ( ...param ) =>
    {
        // Check if the result for the current parameters is already in the cache.
        const c = cache[ param ];

        // If the result is not in the cache (i.e., 'c' is undefined),
        // compute it using the original function 'f', store it in the cache,
        // and then return it. Otherwise, return the cached result.
        return typeof c === 'undefined'
            ?   cache[ param ] = f( ...param )
            :   c;
    };
}


// Defines a class representing a single node within a binary tree structure.
class _Node
{
    // The constructor initializes a new node with its unique identifier
    // and references to its parent, left child, and right child.
    constructor( id, parentId, leftId, rightId )
    {
        this.id       = id;         // Unique identifier for this node.
        this.parentId = parentId;   // ID of the parent node; -1 if root.
        this.leftId   = leftId;     // ID of the left child; -1 if no left child.
        this.rightId  = rightId;    // ID of the right child; -1 if no right child.
    }


    // A getter property that determines the type of the node (root, leaf, or internal).
    get type()
    {
        // If parentId is -1, it's the root of the tree.
        return  this.parentId === -1
                ?   'root'
                :   // Otherwise, check if it's a leaf node.
                    this.leftId === -1 && this.rightId === -1
                    ?   'leaf'
                    :   // If not root and not leaf, it must be an internal node.
                        'internal node';
    }
}


// Manages a collection of nodes to form a binary tree structure.
class BinaryTree
{
    // Initializes a new binary tree instance.
    constructor()
    {
        // An array to store all _Node instances, indexed by their ID.
        this.nodes    = [];

        // An array to store additional computed information about each node,
        // such as sibling, degree, etc.
        this._nodeInfo = [];

        // Memoize the getDepth method to optimize recursive calls.
        // The 'bind(this)' ensures 'this' context is correctly maintained.
        this.getDepth = memoization( this.getDepth.bind(this) );
    }


    // Static getter to expose the _Node class directly through BinaryTree.
    static get Node()
    {
        return _Node;
    }


    // Adds a new node to the tree.
    // Initially, the parentId is set to -1; it will be updated during the 'connect' phase.
    add( id, leftId, rightId )
    {
        this.nodes[ id ] = new BinaryTree.Node( id, -1, leftId, rightId );
    }


    // Establishes the parent-child relationships and computes initial node information.
    connect()
    {
        // Initialize _nodeInfo array for all possible node IDs.
        // Each entry starts with a null node, no sibling, and zero degree.
        for ( let i = 0; i < this.nodes.length; i++ )
        {
            this._nodeInfo[ i ] = { node: null, sibling: -1, degree: 0 };
        }

        // First pass: Iterate through all existing nodes to set parent IDs and sibling IDs.
        this.nodes.forEach( n =>
        {
            // If the current node has a left child...
            if ( n.leftId !== -1 )
            {
                // Set the parent of the left child to the current node's ID.
                this.nodes[ n.leftId ].parentId = n.id;
                // Record the sibling of the left child (which is the right child).
                this._nodeInfo[ n.leftId ].sibling = n.rightId;
            }

            // If the current node has a right child...
            if ( n.rightId !== -1 )
            {
                // Set the parent of the right child to the current node's ID.
                this.nodes[ n.rightId ].parentId = n.id;
                // Record the sibling of the right child (which is the left child).
                this._nodeInfo[ n.rightId ].sibling = n.leftId;
            }
        } );

        // Second pass: Populate the _nodeInfo with actual node references and compute degrees.
        this.nodes.forEach( n =>
        {
            // Update the _nodeInfo entry for the current node 'n'.
            this._nodeInfo[ n.id ] =
            {
                sibling: this._nodeInfo[ n.id ].sibling, // Keep the sibling info from the first pass.
                node:    n,                               // Store a reference to the actual node object.
                // Calculate degree: 1 if left child exists, 1 if right child exists.
                degree:  ( n.leftId !== -1 ) + ( n.rightId !== -1 )
            };
        } );
    }


    // Recursively calculates the depth of a given node.
    // The depth of the root is 0.
    getDepth( id, i = 0 )
    {
        // Find the parent ID of the current node.
        let pid = this.find( id ).parentId;

        // If the parent ID is -1, this node is the root, so return the current depth 'i'.
        // Otherwise, recursively call getDepth for the parent, incrementing 'i'.
        return  pid === -1
                ?   i
                :   this.getDepth( pid, i + 1 );
    }


    // Recursively calculates the height of a given node.
    // The height of a leaf node is 0.
    getHeight( id, i = 0 )
    {
        // Base case: If the ID is -1 (null child), return i - 1 to correctly
        // calculate height from the last valid node.
        if ( id === -1 )
        {
            return i - 1;
        }

        // Get the node object for the current ID.
        let n = this.find( id );

        // Destructure left and right child IDs.
        let [ lid, rid ] = [ n.leftId, n.rightId ];

        // Recursively calculate the height of the left and right subtrees,
        // incrementing 'i' for each level down.
        // The height of the current node is 1 + the maximum height of its children.
        return Math.max( this.getHeight( lid, i + 1 ), this.getHeight( rid, i + 1 ) );
    }


    // Finds and returns a node object by its ID.
    find( id )
    {
        return this.nodes[ id ];
    }


    // Prints detailed information for each node in the tree to the console.
    print()
    {
        console.log(
            this._nodeInfo.map( o =>
                // Format each node's information into a string.
                // Includes node ID, parent, sibling, degree, depth, height, and type.
                `node: ${o.node.id}: parent = ${o.node.parentId}, sibling = ${o.sibling}, ` +
                `degree = ${o.degree}, depth = ${this.getDepth( o.node.id )}, ` +
                `height = ${this.getHeight( o.node.id )}, ${o.node.type}`
            ).join( '\n' ) // Join all formatted strings with newline characters.
        );
    }
}


// Immediately Invoked Function Expression (IIFE) to encapsulate the main logic.
( function main()
{
    // Read input from standard input, decode as UTF-8, trim whitespace, and split into lines.
    const lines = require( 'fs' )
                    .readFileSync( '/dev/stdin', 'utf8' )
                    .trim()
                    .split( '\n' );

    // The first line contains 'n', which is the total number of nodes.
    // Although 'n' is read, it's not explicitly used later in this specific code.
    const n = Number( lines.shift() );

    // Create a new instance of the BinaryTree.
    let tree = new BinaryTree();

    // Declare variables for node ID, left child, and right child.
    // These are reused in the map/forEach loop, though primarily the 'line' array is spread.
    let id, l, r;

    // Process each remaining line to add nodes to the tree.
    // Each line represents a node and its children IDs.
    lines.map( l => l.split( ' ' ).map( Number ) ) // Parse each line into an array of numbers.
         .forEach( function( line )
         {
            // Add the node to the tree using the spread operator for the array elements.
            tree.add( ...line );
         } );

    // Establish connections and compute derived node properties within the tree.
    tree.connect();

    // Print the detailed information of all nodes in the tree.
    tree.print();
} )();