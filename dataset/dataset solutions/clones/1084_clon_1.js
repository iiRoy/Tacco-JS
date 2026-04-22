/*
 * This JavaScript file processes tree data from standard input.
 * It defines a tree structure, calculates node depths, and formats
 * the output for each node.
 */

// Read the entire input from standard in, decode it as UTF-8,
// and split it into an array of lines.
const line = require('fs') . readFileSync ( '/dev/stdin' , 'utf-8' ) . split ( '\n' ) ;


/**
 * Creates a new node object for the tree.
 * @param {number} id - The unique identifier for the node.
 * @param {number[]} arr - An array of child node IDs.
 * @returns {object} A new node object with default properties.
 */
const newNode = ( id , arr ) => {

    return {
        id        : id ,                     // The node's unique ID.
        children  : [ ... arr ] ,            // A spread copy of the children array.
        parentNode: -1 ,                     // Default parent ID, -1 indicates no parent yet.
        depth     : null                     // Depth will be calculated later.
    } ;

} ;


/**
 * Converts a node object into a human-readable string representation.
 * @param {object} node - The node object to convert.
 * @returns {string} A formatted string describing the node.
 */
const nodeToString = node => {

    // Determine the type of node: root, internal, or leaf.
    const type = node . parentNode === -1
               ? 'root'
               : node . children . length > 0
               ? 'internal node'
               : 'leaf' ;

    // Format the children array into a string.
    const arr = `[${ node . children . join ( ', ' ) }]` ;

    // Construct the final output string.
    return `node ${ node . id }: parent = ${ node . parentNode }, depth = ${ node . depth }, ${ type }, ${ arr }` ;

} ;


/**
 * Recursively sets the depth for all nodes in the tree.
 * @param {object[]} tree - The array representing the tree structure.
 */
const setDepth = tree => {

    // Find the root node, which has a parent ID of -1.
    const root = tree . filter ( x => x . parentNode === -1 ) [ 0 ] ;

    /**
     * Helper function to traverse the tree and assign depths.
     * @param {object} node - The current node being processed.
     * @param {number} n - The current depth level.
     */
    const helper = ( node , n ) => {

        node . depth = n ; // Assign the current depth to the node.

        // Recursively call helper for each child, incrementing depth.
        node . children . forEach ( x => {
            helper ( tree [ x ] , n + 1 ) ;
        } ) ;

    } ;

    // Start the recursive depth calculation from the root at depth 0.
    helper ( root , 0 ) ;

} ;


// Parse the number of nodes from the first line of input.
const n = parseInt ( line [ 0 ] ) ;


// Extract node data from subsequent lines, parse it, and convert to numbers.
const data = line . slice ( 1 , n + 1 )
                 . map ( x => x . split ( ' ' ) . map ( Number ) ) ;


// Create tree node objects from the parsed data.
const tree = data . map ( x => {

    const id = x [ 0 ] ;              // Node ID is the first element.
    const children = x . slice ( 2 ) ; // Children IDs start from the third element.

    return newNode ( id , children ) ;

} ) ;


// Sort the tree array by node ID for easier access (e.g., tree[id]).
tree . sort ( ( a , b ) => a . id - b . id ) ;


// Iterate through the tree to set parentNode for each child.
tree . forEach ( ( x , _ , arr ) => {

    x . children . forEach ( y => {

        // For each child 'y' of node 'x', set its parentNode to 'x.id'.
        arr [ y ] . parentNode = x . id ;

    } ) ;

} ) ;


// Calculate and assign the depth for all nodes in the tree.
setDepth ( tree ) ;


// Format each node into a string and print them, separated by newlines.
console . log ( tree . map ( x => nodeToString ( x ) ) . join ( '\n' ) ) ;