// This is a Type I clone of a JavaScript program that calculates the maximum flow
// in a graph using the Ford-Fulkerson algorithm with DFS for augmenting paths.

// Global array 'G' will represent the graph using an adjacency list.
// Each element G[i] is an array of edge objects originating from vertex 'i'.
var G = [] ;


// Global variables to store the number of vertices (V) and edges (E) in the graph.
var V , E ;


/*
 *  Setting up standard input stream handling for Node.js environment.
 *  This ensures the program can continuously listen for and process input.
 */
process.stdin.resume ( ) ;


//  Configuring the input stream to interpret incoming data as UTF-8 encoded text.
process.stdin.setEncoding ( 'utf8' ) ;


//  Attaching an event listener to the 'data' event of the standard input stream.
//  The provided anonymous function will be executed whenever data is received.
process.stdin.on ( 'data' , function ( input ) {


  // Split the entire input string into an array of individual lines,
  // using the newline character as a delimiter.
  var lines = input . split ( '\n' ) ;


  // Iterate through each line of the input data received.
  for ( var i = 0 ; i < lines . length ; ++i )
  {

    // The very first line of input (i == 0) contains graph dimensions:
    // the total number of vertices (V) and the total number of edges (E).
    if ( i == 0 )
    {
      // Parse the first line by splitting it by space and converting parts to numbers.
      var ves = lines[i] . split ( ' ' ) . map ( Number ) ;

      V = ves[0] ; // Assign the first parsed number to 'V' (vertices count).
      E = ves[1] ; // Assign the second parsed number to 'E' (edges count).


      // Initialize the adjacency list for each vertex.
      // For each vertex from 0 to V-1, create an empty array to hold its outgoing edges.
      for ( var j = 0 ; j < V ; ++j )
        G[j] = [] ; // Initialize G[j] as an empty array.
    }
    // All subsequent lines (i > 0) describe individual edges in the graph.
    else
    {
      // Parse the edge details: 'from' vertex, 'to' vertex, and 'capacity'.
      var uvc = lines[i] . split ( ' ' ) . map ( Number ) ;

      // Call the 'addEdge' utility function to construct the graph
      // with the parsed 'from', 'to', and 'capacity' values.
      addEdge ( uvc[0] , uvc[1] , uvc[2] ) ;
    }
  }


  // After processing all input lines and building the graph,
  // calculate the maximum flow from the source (vertex 0) to the sink (vertex V-1).
  // The result is then printed to the console.
  console . log ( maxFlow ( 0 , V - 1 ) ) ;

} ) ; // End of the 'data' event listener callback function.


// This function is responsible for adding a directed edge to the graph
// and its corresponding reverse (residual) edge, which is essential
// for the Ford-Fulkerson algorithm.
function addEdge ( from , to , cap ) {

  // Add the forward edge from 'from' to 'to' with the specified 'cap' capacity.
  // The 'rev' property stores the index of its reverse edge in the G[to] adjacency list.
  G[from] . push ( { to : to , cap : cap , rev : G[to] . length } ) ;

  // Add a backward (residual) edge from 'to' to 'from' with an initial capacity of 0.
  // This edge's capacity will increase if flow is pushed back along the forward edge.
  // The 'rev' property points to the index of the forward edge in G[from]'s list.
  G[to] . push ( { to : from , cap : 0 , rev : G[from] . length - 1 } ) ;
}


// A global array 'used' is declared. It will be used in DFS traversals
// to keep track of visited nodes within a single path search, preventing cycles.
var used ;


// The Depth-First Search (DFS) function, central to finding augmenting paths.
// 'v' is the current vertex, 't' is the target sink, and 'f' is the
// minimum capacity found along the path to 'v' so far.
function dfs ( v , t , f ) {

  // Base case: If the current vertex 'v' is the sink 't',
  // an augmenting path has been successfully found.
  if ( v == t )
  {
    return f ; // Return the flow capacity of this path.
  }


  // Mark the current vertex 'v' as visited for this DFS traversal.
  used[v] = true ;


  // Iterate through all edges originating from the current vertex 'v'.
  for ( var i = 0 ; i < G[v] . length ; ++i )
  {
    var e = G[v][i] ; // Get the current edge object.

    // Check two conditions before traversing an edge:
    // 1. The destination vertex 'e.to' has not been visited in the current DFS path.
    // 2. The edge 'e' has remaining capacity (e.cap > 0), meaning flow can pass through it.
    if ( ! used[e.to] && e.cap > 0 )
    {
      // Recursively call DFS for the next vertex 'e.to'.
      // The flow for this path segment is limited by the current path flow 'f'
      // and the capacity of the current edge 'e.cap'.
      var resF = dfs ( e.to , t , Math . min ( f , e.cap ) ) ;


      // If the recursive DFS call returned a positive flow (an augmenting path was found).
      if ( resF > 0 )
      {
        e.cap -= resF ; // Decrease the capacity of the forward edge by the found flow.
        G[e.to][e.rev].cap += resF ; // Increase the capacity of the reverse edge.

        return resF ; // Return the amount of flow pushed through this path.
      }
    }
  }


  // If no augmenting path could be found from the current vertex 'v', return 0.
  return 0 ;
} // End of the dfs function.


// The main function implementing the Ford-Fulkerson algorithm.
// It calculates the maximum flow from a source 's' to a sink 't'
// in the given graph 'G'.
function maxFlow ( s , t )
{
  var f = 0 ; // Initialize the total maximum flow found to zero.


  // This loop continues indefinitely until no more augmenting paths can be found.
  while ( true )
  {
    // Before each DFS traversal to find an augmenting path,
    // reset the 'used' array, marking all vertices as unvisited.
    used = new Array ( V ) . fill ( false ) ;


    // Perform a DFS starting from the source 's' to find an augmenting path
    // to the sink 't'. The initial flow capacity for this path is considered infinite.
    var resF = dfs ( s , t , Number . POSITIVE_INFINITY ) ;

    // Add the flow found by the current DFS traversal to the total maximum flow.
    f += resF ;


    // If the DFS found no flow (resF is 0), it means no more augmenting paths exist
    // from 's' to 't' in the residual graph. The algorithm has converged.
    if ( resF == 0 ) {
      break ; // Exit the loop.
    }
  }

  // Return the accumulated total maximum flow from source 's' to sink 't'.
  return f ;
} // End of the maxFlow function.