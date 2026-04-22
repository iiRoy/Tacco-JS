"use strict"; // Enforce strict mode for better error handling and cleaner code.

const main = ( arg ) => { // Main entry point function for processing input.

  arg = arg.trim().split( "\n" ); // Trim whitespace and split input into lines.

  const N = parseInt( arg[0].split( " " )[0] ); // Parse N (number of nodes) from the first line.
  const Q = parseInt( arg[0].split( " " )[1] ); // Parse Q (number of queries) from the first line.

  // Extract 'ab' connections (N-1 lines describing tree edges).
  const ab = arg.slice( 1, N ).map( n => n.split( " " ) );

  // Extract 'px' point updates (Q lines describing point additions).
  const px = arg.slice( N, N + 1 + Q ).map( n => n.split( " " ) );


  const nodes = [ ]; // Initialize an array to hold all Node objects.

  // Populate nodes array with new Node instances, indexed from 0 to N-1.
  for ( let i = 1; i <= N; i++ ) {
    nodes.push( new Node( i ) ); // Each node represents a distinct entity in the tree.
  }

  // Determine parent-child relationships based on input 'ab' array.
  // The input is 1-indexed, so we subtract 1 for 0-indexed array access.
  for ( let i = 0; i < N - 1; i++ ) {
    nodes[ ab[i][0] - 1 ].addChild( nodes[ ab[i][1] - 1 ] ); // Establish directed connections.
  }


  // Apply initial points directly to the specified parent nodes from 'px' queries.
  for ( let i = 0; i < Q; i++ ) {
    nodes[ px[i][0] - 1 ].addPoint( px[i][1] ); // Update points for relevant nodes.
  }


  // Propagate points from parent nodes to their immediate children.
  // This loop ensures that each node's points are passed down once.
  for ( let i = 0; i < N; i++ ) {
    nodes[ i ].addPointToChild( ); // Distribute accumulated points recursively or directly.
  }


  let answer = [ ]; // Initialize an array to store final point totals.

  // Aggregate the final point values from each node into the answer array.
  for ( let i = 0; i < N; i++ ) {
    answer.push( nodes[i].point ); // Collect the accumulated points for output.
  }

  // Output the final answer as a space-separated string.
  console.log( answer.join( " " ) );

} // End of the main function.


class Node { // Defines the structure and behavior of a single node in the tree.

  // Node constructor for initial setup.
  constructor ( nodeName ) {
    this.name          = nodeName;      // Unique identifier for this node.
    this.parent        = null;          // Reference to the parent node, initially null.
    this.childrenArray = [ ];           // Array to hold references to child nodes.
    this.point         = 0;             // Accumulated points for this node, initialized to zero.
  }

  // Method to add a child node to the current node.
  addChild ( childNode ) {
    this.childrenArray.push( childNode ); // Add child to the list of children.
    childNode.parent = this;              // Set this node as the child's parent.
  }

  // Method to add points directly to this node.
  addPoint ( point ) {
    this.point += parseInt( point );      // Convert point value to integer and add to total.
  }

  // Method to distribute this node's accumulated points to its immediate children.
  addPointToChild ( ) {
    for ( let child of this.childrenArray ) {
      child.addPoint( this.point );       // Pass this node's accumulated points to each child.
    }
  }

} // End of the Node class definition.


// Execute the main function with input read from standard input.
main( require( 'fs' ).readFileSync( '/dev/stdin', 'utf8' ) );