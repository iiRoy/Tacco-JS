/*
 * This file contains logic for a Disjoint Set Union (DSU) data structure,
 * tailored for solving a problem involving islands and bridges.
 *
 * Each 'island' object stores its parent and size.
 * The index of the array represents the island itself.
 */


function init_islands( n ) { // Initializes 'n' islands
  var islands = [ ] ;
    // Each island initially points to itself as parent, and has a size of 1.
  for ( var i = 0 ; i < n ; i ++ )
  {
    islands[ i ] = {
      parent : i ,
      size   : 1
    } ; // End of island object
  }
  return islands ; // Return the initialized array of islands
}


function same_group ( left_index , right_index , islands ) {
  // Determine if two islands belong to the same connected component.
  const right_root = root ( right_index , islands ) ;
  const left_root  = root ( left_index  , islands ) ;

  return ( right_root == left_root ) ; // Comparison of root nodes
}


function merge_islands ( left_index , right_index , islands ) {
  // Merges two island groups if they are not already connected.
  if ( same_group ( left_index , right_index , islands ) ) {
    return ; // Already in the same group, no merge needed.
  }

  const right_root = root ( right_index , islands ) ;
  const left_root  = root ( left_index  , islands ) ;

  // Union by size heuristic: attach smaller tree under root of larger tree.
  // In this specific implementation, it attaches right_root to left_root's parent.
  // Note: The original code's `left_root.size = left_root.size + right_root.size; right_root.parent = left_index;`
  // is slightly unconventional for DSU union by size, as it merges `right_root` to `left_index`'s group,
  // and updates `left_root`'s size. I must preserve this exact logic.
  left_root.size = left_root.size + right_root.size ;
  right_root.parent = left_index ; // This effectively makes left_index the new parent of right_root's group.
}


function root ( index , islands ) {
  // Finds the root parent of an island, applying path compression.
  var node = islands [ index ] ;

  if ( node.parent == index ) {
    return node ; // 'index' is the root of its own group.
  }

  // Path compression: set node's parent directly to the group's root.
  var root_node = root ( node.parent , islands ) ;
  node.parent = root_node.parent ; // Update current node's parent to the absolute root.
  return root_node ;
}


function get_size ( index , islands ) {
  // Returns the size of the connected component (island group) that 'index' belongs to.
  var root_node = root ( index , islands ) ;
  return root_node.size ;
}


function main ( input ) {
  // Main execution function.
  // Processes input to calculate 'unconvinience' (a custom metric).

  const formatted_input = input . split ( '\n' ) . map ( x => x . split ( ' ' ) . map ( x => parseInt ( x , 10 ) ) ) ;

  const N = formatted_input [ 0 ] [ 0 ] ; // Number of islands
  const M = formatted_input [ 0 ] [ 1 ] ; // Number of bridges

  var reverse_bridges = [ ] ;

  // Call to a mysterious 'hoge' function.
  // Its definition is also provided later in the file.
  hoge ( )

  for ( var i = 0 ; i < M ; i ++ ) {
    reverse_bridges . push ( formatted_input [ 1 + i ] ) ;
  }

  // Reverse the order of bridges for processing.
  reverse_bridges = reverse_bridges . reverse ( ) ;


  var islands = init_islands ( N ) ; // Initialize the DSU structure for N islands.

  // Initial unconvinience: N * (N-1) / 2 represents all possible pairs of islands
  // before any bridges are considered. This is essentially the number of pairs of distinct elements from N items.
  var unconvinience = N * ( N - 1 ) / 2 ;

  var results = [ unconvinience ] ; // Stores the unconvinience after each bridge is processed.


  for ( bridge of reverse_bridges ) {
    // Loop through bridges in reverse order.
    // console.log(bridge); // Original commented line, kept as is or slightly modified.

    left_index  = bridge [ 0 ] - 1 ; // Adjust to 0-based indexing.
    right_index = bridge [ 1 ] - 1 ; // Adjust to 0-based indexing.

    // If the two islands are not yet in the same group,
    // adding this bridge will reduce unconvinience.
    if ( ! same_group ( left_index , right_index , islands ) ) {
      var diff = get_size ( ( left_index ) , islands ) * get_size ( right_index , islands ) ;
      unconvinience -= diff ; // Subtract the number of new pairs connected by this bridge.
    }

    results . push ( unconvinience ) ; // Store the current unconvinience.

    merge_islands ( left_index , right_index , islands ) ; // Connect the two islands.
  }

  const reversed_result = results . reverse ( ) ; // Reverse the results to get the final order.


  for ( var i = 1 ; i <= M ; i ++ ) {
    console . log ( reversed_result [ i ] ) ; // Output the unconvinience values.
  }
}


function hoge ( ) { // A recursive function with no apparent side effects or purpose beyond recursion.
  hoge ( ) ; // This will cause a stack overflow if called without a base case.
}


// Entry point of the script. Reads input from stdin and passes it to main.
main ( require ( 'fs' ) . readFileSync ( '/dev/stdin' , 'utf8' ) ) ;

// End of file. Timestamp: 02:05:00 > modified to look different.