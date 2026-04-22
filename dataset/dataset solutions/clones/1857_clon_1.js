function   main ( input ) /* Entry point of the program */ {

  const inputs = input.trim() . split ( '\n' ) ; /* Split input into lines based on newline character */

  var N = inputs[0] . split ( ' ' ) [ 0 ] - 0 ; // Parse the number of nodes (N) from the first line
  var M = inputs[0] . split ( ' ' ) [ 1 ] - 0 ; // Parse the number of edges (M) from the first line

  // Initialize an adjacency list to represent the graph
  var AB = [ ] ; /* Adjacency list representation of the graph */
  for ( var i = 0 ; i < N ; i++ ) {
    AB . push ( [ ] ) ; // Each element in AB will be an array to store neighbors
  }

  // Populate the adjacency list with edges
  for ( var i = 1 ; i <= M ; i++ ) { /* Loop through each edge input starting from the second line */
    var input = inputs[i] . split ( ' ' ) ; // Split the current edge line by space

    var v1 = input[0] - 1 ; /* First vertex of the edge (converted to 0-indexed) */
    var v2 = input[1] - 1 ; /* Second vertex of the edge (converted to 0-indexed) */

    AB [ v1 ] . push ( v2 ) ; // Add v2 to v1's neighbor list
    AB [ v2 ] . push ( v1 ) ; // Add v1 to v2's neighbor list (since it's an undirected graph)
  } // End of edge processing loop


  // Variables for Breadth-First Search (BFS)
  var existNums = [ 0 ] ; /* Stores all nodes visited during the BFS, initialized with starting node 0 */
  var shouldContinue = true ; // Flag to control the main BFS loop
  var floor = 0 ; /* Represents the current BFS level or 'floor' */
  var nowFloors = [ 0 ] ; // Nodes that are currently being processed at the 'floor' level
  var floors = [ ] ; // A 2D array to store nodes, grouped by their BFS floor

  // Main BFS loop
  while ( shouldContinue ) { // Continue as long as new nodes are being discovered

    floors . push ( [ ] ) ; // Add a new empty array for the nodes on the current floor
    var counter = 0 ; // Counter for new nodes discovered in this iteration (floor)
    var nextFloors = [ ] ; // List to hold nodes for the next BFS floor

    // Iterate through all nodes on the current floor
    for ( var i = 0 ; i < nowFloors.length ; i++ ) {

      // Iterate through all neighbors of the current node
      for ( var j = 0 ; j < AB [ nowFloors [ i ] ] . length ; j++ ) {

        var conNum = AB [ nowFloors [ i ] ] [ j ] ; // Get the connected neighbor node

        // Check if the neighbor has not been visited yet
        if ( ! existNums . includes ( conNum ) ) {

          counter += 1 ; // Increment the counter for newly discovered nodes
          nextFloors . push ( conNum ) ; // Add the neighbor to the list for the next floor
          floors [ floor ] . push ( conNum ) ; // Assign the neighbor to the current floor in the 'floors' structure
          existNums . push ( conNum ) ; // Mark the neighbor as visited
        }
      } // End of inner loop (neighbors)
    } // End of outer loop (current floor nodes)

    floor += 1 ; // Move to the next BFS floor level
    nowFloors = nextFloors . concat ( ) ; /* Prepare 'nowFloors' for the next iteration using discovered nodes */

    // If no new nodes were found in this floor, the BFS is complete
    if ( counter == 0 ) shouldContinue = false ;
  } // End of while loop for BFS


  // Prepare the final output array
  var output = [ ] ; // Array to store the assigned floor for each node
  for ( var i = 0 ; i < N ; i++ ) {
    output . push ( 0 ) ; /* Initialize all output values to 0 before assignment */
  }

  // Populate the output array with the floor numbers
  for ( var i = 0 ; i < floors.length ; i++ ) { /* Iterate through each BFS floor */
    for ( var j = 0 ; j < floors [ i ] . length ; j++ ) { // Iterate through nodes on the current floor

      output [ floors [ i ] [ j ] ] = i ; // Assign the current floor index (i) to the respective node
    } // End of inner loop
  } // End of outer loop

  // The output array's index 0 corresponds to node 0, which was implicitly handled as floor 0.
  // We remove it as the problem might require output for nodes 1 to N, or it's a specific problem constraint.
  output . shift ( ) ; // Remove the first element of the output array


  // Final check and output based on BFS results
  if ( existNums . length != N ) { // If the number of visited nodes is not equal to the total number of nodes (N)
    console . log ( 'No' ) ; /* Output 'No' if the graph is not fully connected from node 0 */
  }
  else { // All nodes were visited, meaning a valid BFS tree covers the graph
    console . log ( 'Yes' ) ; /* Output 'Yes' */

    // Print the floor number for each node (1-indexed)
    for ( var i = 0 ; i < output . length ; i++ ) {
      console . log ( output [ i ] + 1 ) ; // Add 1 because floors are 0-indexed internally
    } // End of printing loop
  } // End of conditional block for output

  /* Original debug comment: console.log(floors); - This line was commented out in the source and is now removed */
} // End of main function


// Call the main function with input from standard input
main ( require ( 'fs' ) . readFileSync ( '/dev/stdin' , 'utf8' ) ) ; /* Execute the main function, reading input from stdin */