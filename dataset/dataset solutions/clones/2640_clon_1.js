'use strict'
// This file contains the main logic for processing input and calculating results.

function main ( inp ) {
  // Trim leading/trailing whitespace and split the input into lines.
  inp = inp . trim ( ) . split ( '\n' ) ;

  // Extract N and Q values from the first line.
  const NQ = inp . shift ( ) . split ( ' ' ) . map ( n => Number ( n ) ) ;

  // Initialize an adjacency list for the tree-like structure.
  let ab = { } ;
  // Populate the adjacency list with empty arrays for each node.
  for ( let i = 1 ; i <= NQ [ 0 ] ; i ++ ) {
    ab [ i ] = [ ] ;
  }

  // Initialize an array to store answers, with NQ[0]+1 elements, all set to 0.
  let ans = new Array ( NQ [ 0 ] + 1 ) . fill ( 0 ) ;

  // Process the remaining input lines.
  for ( let i = 0 ; i < inp . length ; i ++ ) {
    // Parse each line into an array of numbers.
    const arr = inp [ i ] . split ( ' ' ) . map ( n => Number ( n ) ) ;
    let j = arr [ 0 ] ; // The first number in the array.

    // If it's part of the initial N-1 connections, build the adjacency list.
    if ( i < NQ [ 0 ] - 1 ) {
      ab [ j ] . push ( arr [ 1 ] ) ; // Add the connected node.
    }
    // Otherwise, it's a query to add value to a node.
    else {
      ans [ j ] += arr [ 1 ] ; // Add the value to the answer array.
    }
  }

  // Initialize a queue for a breadth-first-like traversal.
  let queue = [ 1 ] ; // Start with node 1.

  // Define a helper function to propagate values down the tree.
  const countup = n => {
    // Iterate through all children of the current node 'n'.
    for ( let i = 0 ; i < ab [ n ] . length ; i ++ ) {
      let j = ab [ n ] [ i ] ; // Get the child node.
      ans [ j ] += ans [ n ] ; // Add the parent's value to the child's value.
      queue . push ( j ) ; // Add the child to the queue for further processing.
    }
  } ;

  // Process the queue until it's empty.
  while ( queue . length ) {
    countup ( queue . shift ( ) ) ; // Dequeue a node and propagate its value.
  }

  // Remove the first element (index 0) from the 'ans' array, as nodes are 1-indexed.
  ans . shift ( ) ;

  // Print the final answer, joined by spaces.
  console . log ( ans . join ( ' ' ) ) ;
}

// Read input from stdin and pass it to the main function.
main ( require ( 'fs' ) . readFileSync ( '/dev/stdin' , 'utf8' ) ) ;