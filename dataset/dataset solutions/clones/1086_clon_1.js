/*
   * This module provides utilities for working with binary trees.
   * It includes a memoization helper, a Node class, and a BinaryTree class.
   */

// Helper function for memoization.
// It takes a function 'f' and returns a memoized version of it.
function   memoization ( f )
{
    // The cache stores the results of function calls.
    const   cache   =   {   }   ;

    // Return a new function that will use the cache.
    return   (   ...param   )   =>
    {
        // Check if the result for the given parameters is already in the cache.
        const   c   =   cache[   param   ]   ;

        // If 'c' is undefined, it means the result is not cached.
        // In that case, call the original function 'f', store its result in the cache, and return it.
        // Otherwise, return the cached result 'c'.
        return   typeof   c   ===   'undefined'
            ?   (   cache[   param   ]   =   f   (   ...param   )   )
            :   c   ;
    }   ;

}   // End of memoization function definition.


/*
 *  Represents a single node within a binary tree structure.
 *  Each node has an ID, parent ID, and IDs for its left and right children.
 */
class   _Node
{
    // Constructor for creating a new node instance.
    constructor   (   id,   parentId,   leftId,   rightId   )
    {
        this.id         =   id   ;         // Unique identifier for this node.
        this.parentId   =   parentId   ;   // ID of the parent node; -1 for root.
        this.leftId     =   leftId   ;     // ID of the left child node; -1 if no left child.
        this.rightId    =   rightId   ;    // ID of the right child node; -1 if no right child.
    }


    // Getter property to determine the type of the node (root, leaf, or internal).
    get   type   (   )
    {
        // Check if it's the root node (parent ID is -1).
        return   this.parentId   ===   -1
            ?   'root'   // This node is the root of the tree.
            :   this.leftId   ===   -1   &&   this.rightId   ===   -1
                ?   'leaf'   // This node is a leaf (no children).
                :   'internal node'   ;   // This node is an internal node (has children and a parent).
    }

}   // End of _Node class definition.


/*
 *  Manages a collection of _Node objects to form a binary tree.
 *  Provides methods for adding nodes, connecting them, calculating depth/height, and printing information.
 */
class   BinaryTree
{
    // Constructor for the BinaryTree class.
    constructor   (   )
    {
        this.nodes          =   [   ]   ;   // Array to store _Node objects, indexed by their ID.
        this._nodeInfo      =   [   ]   ;   // Auxiliary array to store computed info like sibling, degree, etc.

        // Memoize the getDepth method to improve performance for repeated depth calculations.
        this.getDepth       =   memoization   (   this.getDepth.bind   (   this   )   )   ;
    }


    // Static getter to expose the _Node class.
    static   get   Node   (   )
    {
        return   _Node   ;
    }


    // Adds a new node to the tree.
    // The parentId is initially set to -1; it will be updated during the connect phase.
    add   (   id,   leftId,   rightId   )
    {
        this.nodes[   id   ]   =   new   BinaryTree.Node   (   id,   -1,   leftId,   rightId   )   ;
    }


    // Establishes parent-child relationships and computes auxiliary node information.
    connect   (   )
    {
        // Initialize _nodeInfo array for each potential node.
        for   (   let   i   =   0   ;   i   <   this.nodes.length   ;   i++   )
        {
            this._nodeInfo[   i   ]   =   {   node   :   null,   sibling   :   -1,   degree   :   0   }   ;
        }

        // First pass: set parent IDs and sibling IDs.
        this.nodes.forEach   (   n   =>
        {
            if   (   n.leftId   !==   -1   )
            {
                this.nodes[   n.leftId   ]  .  parentId   =   n.id   ;
                this._nodeInfo[   n.leftId   ]  .  sibling   =   n.rightId   ;
            }

            if   (   n.rightId   !==   -1   )
            {
                this.nodes[   n.rightId   ]  .  parentId   =   n.id   ;
                this._nodeInfo[   n.rightId   ]  .  sibling   =   n.leftId   ;
            }
        }   )   ;

        // Second pass: populate _nodeInfo with node objects and calculate degrees.
        this.nodes.forEach   (   n   =>
        {
            this._nodeInfo[   n.id   ]   =   {
                sibling   :   this._nodeInfo[   n.id   ]  .  sibling,
                node      :   n,
                degree    :   (   n.leftId   !==   -1   )   +   (   n.rightId   !==   -1   )
            }   ;
        }   )   ;
    }


    // Recursively calculates the depth of a given node.
    // 'i' keeps track of the current depth level.
    getDepth   (   id,   i   =   0   )
    {
        let   pid   =   this.find   (   id   )  .  parentId   ;

        // If parentId is -1, it's the root, so return current depth 'i'.
        // Otherwise, recursively call getDepth for the parent, incrementing 'i'.
        return   pid   ===   -1   ?   i   :   this.getDepth   (   pid,   i   +   1   )   ;
    }


    // Recursively calculates the height of a given node.
    // 'i' keeps track of the current depth level during traversal (not directly height).
    getHeight   (   id,   i   =   0   )
    {
        // Base case: if node ID is -1 (null child), return i - 1 to adjust for the extra increment.
        if   (   id   ===   -1   )
        {
            return   i   -   1   ;
        }

        let   n   =   this.find   (   id   )   ;                 // Get the node object.
        let   [   lid,   rid   ]   =   [   n.leftId,   n.rightId   ]   ;   // Get IDs of left and right children.

        // The height of a node is 1 + the maximum height of its children.
        // We pass i+1 to the recursive calls to simulate moving down a level.
        return   Math.max   (   this.getHeight   (   lid,   i   +   1   )   ,   this.getHeight   (   rid,   i   +   1   )   )   ;
    }


    // Finds and returns a node object by its ID.
    find   (   id   )
    {
        return   this.nodes[   id   ]   ;
    }


    // Prints the information for each node in the tree.
    print   (   )
    {
        console.log   (
            this._nodeInfo.map   (   o   =>
                `node: ${o.node.id}: parent = ${o.node.parentId}, sibling = ${o.sibling}, degree = ${o.degree}, depth = ${this.getDepth(o.node.id)}, height = ${this.getHeight(o.node.id)}, ${o.node.type}`
            )  .  join   (   '\n'   )
        )   ;
    }

}   // End of BinaryTree class definition.


// Immediately Invoked Function Expression (IIFE) for the main program logic.
(   function   main   (   )
{
    // Read input from stdin, trim whitespace, and split into lines.
    const   lines   =   require   (   'fs'   )  .  readFileSync   (   '/dev/stdin'   ,   'utf8'   )  .  trim   (   )  .  split   (   '\n'   )   ;

    // The first line usually contains the number of nodes, but it's not used in this specific logic.
    const   n   =   Number   (   lines.shift   (   )   )   ;

    // Create a new BinaryTree instance.
    let   tree   =   new   BinaryTree   (   )   ;

    // Declare variables (though not explicitly used in the loop, kept for structural similarity).
    let   id,   l,   r   ;

    // Process each line to add nodes to the tree.
    lines.map   (   l   =>   l.split   (   ' '   )  .  map   (   Number   )   )  .  forEach   (   function   (   line   )
    {
        tree.add   (   ...line   )   ;   // Use spread operator to pass id, leftId, rightId.
    }   )   ;

    // Connect the nodes to establish relationships.
    tree.connect   (   )   ;

    // Print the final tree information.
    tree.print   (   )   ;

}   )   (   )   ;   // Call the main function immediately.