const input = require('fs') . readFileSync ( '/dev/stdin' , 'utf8' ) ;


const inputs = input . trim ( ) . split ( '\n' ) ;


const n = Number ( inputs . shift ( ) ) ;


const adj = inputs . map ( ( s ) => s . split ( ' ' ) . map ( Number ) ) ;


/**
 * Represents a single node in a tree structure.
 * Each node maintains references to its parent and children,
 * along with its unique identifier and calculated depth.
 */
class Node
{
    /**
     * Initializes a new Node instance.
     * @param {number} id - The unique numerical identifier for this node.
     */
    constructor ( id )
    {
        this . id = id ;
        this . children = [ ] ;
        // this.parent and this.depth are initialized later.
    }

    /**
     * Adds another node as a child of the current node.
     * This also sets the parent property of the child node to this node.
     * @param {Node} node - The node to be added as a child.
     */
    add ( node )
    {
        node . parent = this ;
        this . children . push ( node ) ;
    }

    /**
     * Checks if this node has a parent.
     * @returns {boolean} True if the node has a parent, false otherwise.
     */
    hasParent ( )
    {
        return !! this . parent ;
    }

    /**
     * Checks if this node has any children.
     * @returns {boolean} True if the node has at least one child, false otherwise.
     */
    hasChild ( )
    {
        return !! this . children . length ;
    }

    /**
     * Determines the type of the node based on its parent and children status.
     * @returns {string} 'root', 'internal node', or 'leaf'.
     */
    getType ( )
    {
        return ! this . hasParent ( ) ? 'root' : ( this . hasChild ( ) ? 'internal node' : 'leaf' ) ;
    }

    /**
     * Recursively calculates and assigns the depth for this node and all its descendants.
     * The depth of the root node is typically 0.
     * @param {number} depth - The current depth level of this node.
     */
    calc ( depth )
    {
        this . depth = depth ++ ;
        this . children . forEach ( child => child . calc ( depth ) ) ;
    }

    /**
     * Generates a string representation of the node, including its ID, parent ID,
     * depth, type, and the IDs of its children.
     * @returns {string} A formatted string describing the node.
     */
    toString ( )
    {
        return 'node ' + this . id + ': ' + [
            'parent = ' + ( this . hasParent ( ) ? this . parent . id : -1 ) ,
            'depth = ' + this . depth ,
            this . getType ( ) ,
            '[' + this . children . map ( child => child . id ) . join ( ', ' ) + ']' ,
        ] . join ( ', ' ) ;
    }
}


/**
 * Manages a collection of nodes to form a tree structure.
 * Provides methods for node retrieval, root identification,
 * depth calculation, and printing the tree.
 */
class Tree
{
    /**
     * Initializes a new Tree instance with an empty map to store nodes.
     */
    constructor ( )
    {
        this . map = new Map ( ) ;
    }

    /**
     * Retrieves a node by its ID. If the node does not exist in the tree,
     * a new Node instance is created and added to the map.
     * @param {number} id - The ID of the node to retrieve or create.
     * @returns {Node} The Node object corresponding to the given ID.
     */
    getNode ( id )
    {
        this . map . has ( id ) || this . map . set ( id , new Node ( id ) ) ;
        return this . map . get ( id ) ;
    }

    /**
     * Identifies and returns the root node of the tree.
     * The root node is defined as the node that has no parent.
     * @returns {Node|undefined} The root node, or undefined if no such node is found.
     */
    getRoot ( )
    {
        return Array . from ( this . map . values ( ) ) . find ( node => ! node . hasParent ( ) ) ;
    }

    /**
     * Initiates the depth calculation for all nodes in the tree,
     * starting from the root node with a depth of 0.
     */
    calc ( )
    {
        const root = this . getRoot ( ) ;
        root . calc ( 0 ) ;
    }

    /**
     * Prints the string representation of each node in the tree to the console.
     * Nodes are printed in order of their IDs (assuming IDs are contiguous from 0).
     */
    print ( )
    {
        for ( let i = 0 ; i < this . map . size ; i ++ )
        {
            const node = this . map . get ( i ) ;
            console . log ( node . toString ( ) ) ;
        }
    }
}


// --- Main execution flow begins here ---

// Create an instance of the Tree class.
const tree = new Tree ( ) ;

// Process the adjacency list input to build the tree structure.
// Each element in 'adj' represents a parent node 'u' and its children 'vk'.
adj . forEach ( ( [ u , k , ... vk ] ) =>
{
    // Get or create the parent node 'u'.
    const parent = tree . getNode ( u ) ;

    // Iterate through the children 'vk' and add them to the parent.
    vk . forEach ( v =>
    {
        // Get or create the child node 'v'.
        const node = tree . getNode ( v ) ;
        // Establish the parent-child relationship.
        parent . add ( node ) ;
    } ) ;
} ) ;

// Once the tree structure is built, calculate the depth of all nodes.
tree . calc ( ) ;

// Finally, print the details of all nodes in the tree.
tree . print ( ) ;