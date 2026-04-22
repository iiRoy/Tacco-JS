/*
 * This JavaScript code implements an algorithm to find bridges in an undirected graph.
 * It processes graph data provided via standard input (typically in a Node.js environment).
 */

// A convenient alias for console.log to shorten output statements.
var log = console.log;


// This block checks if the code is running in a Node.js environment.
// If 'process' global object is defined, it means we are likely in Node.js.
if ( typeof process != "undefined" )
{
	// Initialize an empty string to accumulate all incoming data from stdin.
	var input = "";
	
	// Ensure the standard input stream is active and ready to receive data.
	process.stdin.resume();
	
	// Set the character encoding for the standard input stream to UTF-8.
	process.stdin.setEncoding( 'utf8' );
	
	// Attach an event listener for 'data' events on stdin.
	// Each time a chunk of data is received, it's appended to the 'input' string.
	process.stdin.on( 'data', function ( chunk ) {
		input += chunk;
	} );
	
	// Attach an event listener for the 'end' event on stdin.
	// This event fires when the input stream has finished.
	process.stdin.on( 'end', function () {
		// Split the accumulated input string into an array of lines.
		var lines = input.split( "\n" );
		
		// Call the main processing function with the parsed lines.
		main( lines );
	} );
}


/*
 * The primary function responsible for parsing graph data and executing the bridge-finding algorithm.
 * @param {Array<string>} lines - An array where each element is a line of input data.
 */
function main ( lines )
{
	// Check and handle potential trailing empty line from input.
	// If the last line is empty, `pop()` removes it. If it's not empty, it's removed,
	// and then `lines.push()` (which pushes `undefined`) is called to match original behavior.
	if ( lines.pop() != "" )
	{
		lines.push();
	}
	
	// Transform each input line into an array of numbers.
	// Each line is first split by spaces, then each resulting string is converted to a Number.
	lines = lines.map( function ( line ) {
		return line.split( " " ).map( function ( e ) {
			return Number( e );
		} );
	} );
	
	// Extract the first line of input, which typically contains the number of vertices (V) and edges (E).
	var top_line = lines.shift();
	
	// Number of vertices in the graph.
	var V = top_line[ 0 ];
	// Number of edges in the graph.
	var E = top_line[ 1 ];
	
	// Adjacency list representation of the graph. `real_edge[i]` will store neighbors of vertex `i`.
	var real_edge = [];
	// This variable is declared but not used in the provided code. It remains for Type I clone fidelity.
	var virt_edge = [];
	
	// An array to keep track of visited nodes during the Depth-First Search (DFS).
	var mark = [];
	// This variable is also declared but unused. Kept as per Type I definition.
	var status = [];
	
	// `ord[i]` will store the discovery time (order of visit) for vertex `i` during DFS.
	var ord = [];
	// `lowlink[i]` will store the lowest discovery time reachable from vertex `i` (including `i` itself)
	// through tree edges and at most one back-edge.
	var lowlink = [];
	
	// `bridges[i]` will store an array of vertices `j` such that `(i, j)` is a bridge, where `i < j`.
	var bridges = [];
	
	// Initialize all data structures for each vertex from 0 to V-1.
	for ( var i = 0 ; i < V ; i++ )
	{
		real_edge[ i ] = [];   // Each vertex's adjacency list starts empty.
		mark[ i ] = false;     // Initially, no vertex has been visited.
		
		// Original comments in Japanese, preserved for Type I, along with English explanations.
		// ord????????? (Initialize discovery time)
		// lowlink??????(dfs????????????????§????){0,}??¨(?????????){0,1}??§?????????ord???????°????
		// ?????????????????????????§???????°???????ord
		ord[ i ] = 0;          // Default discovery time is 0.
		lowlink[ i ] = V;      // Low-link initialized to a value higher than any possible ord.
		bridges[ i ] = [];     // Each vertex starts with no known bridges.
	}
	
	// Populate the adjacency list based on the input edges.
	lines.forEach( function ( edge ) {
		var a = edge[ 0 ]; // The first vertex of the current edge.
		var b = edge[ 1 ]; // The second vertex of the current edge.
		
		// Since the graph is undirected, add an edge from a to b and from b to a.
		real_edge[ a ].push( b );
		real_edge[ b ].push( a );
	} );
	
	// `no` acts as a global counter to assign unique discovery times (`ord`) during DFS.
	var no = 0;
	// `prev` is declared here but is unused in this scope; it is shadowed by a parameter in `dfs`.
	var prev = 0;
	
	/*
	 * Performs a Depth-First Search (DFS) traversal starting from a given node.
	 * It computes discovery times (`ord`) and low-link values (`lowlink`) for bridge detection.
	 * @param {number} now_point - The current vertex being visited by DFS.
	 * @param {number} prev - The parent vertex of `now_point` in the DFS tree (used to avoid trivial back-edges).
	 */
	function dfs ( now_point, prev ) {
		// Create local aliases for better readability and potentially minor performance.
		var np = now_point; // Current point.
		var mk = mark;      // Visited marks array.
		
		// Get the list of neighbors for the current node.
		var targets = real_edge[ np ];
		
		mk[ np ] = true;       // Mark the current node as visited.
		ord[ np ] = no;        // Assign its discovery time.
		lowlink[ np ] = no;    // Initialize its low-link value to its discovery time.
		no++;                  // Increment the global discovery time counter.
		
		// Iterate over each neighbor of the current node.
		targets.forEach( function ( target ) {
			// If the target is the parent node in the DFS tree, skip it.
			// This prevents considering the tree edge to the parent as a back-edge.
			// ??´???????????????????????????????????§ (If it is the parent, ignore.)
			if ( target == prev ) {
				return;
			}
			
			// If the target node has already been visited (and is not the parent).
			if ( mk[ target ] ) {
				// This indicates a back-edge to an ancestor.
				// Update the current node's low-link value with the discovery time of the target.
				// lowlink?????´??° (Update lowlink value)
				// ????°???????????????? (Considering the discovery time of the target)
				lowlink[ np ] = Math.min( lowlink[ np ], target );
			}
			else
			{
				// If the target node has not been visited, it's a tree edge.
				// Recursively call DFS on the target node.
				// ???????????£????????¨????????? (Visiting an unvisited node)
				// ??¢?´¢????????? (Recursive call)
				dfs( target, np );
				
				// After the recursive call returns, update the current node's low-link value.
				// The low-link of the current node is the minimum of its current low-link
				// and the low-link value of its child (target).
				// ?????\????????????lowlink????????? (Update lowlink after child's DFS completes)
				// ???????????????????±????lowlink???????°???????lowlink????????¨?????? (The lowlink of the child is taken into consideration)
				lowlink[ np ] = Math.min( lowlink[ np ], lowlink[ target ] );
			}
		} );
	}
	
	// Initiate the DFS traversal from vertex 0.
	// `V` is passed as the parent for the starting node, which is an invalid index,
	// effectively indicating no parent exists for the root of the DFS tree.
	dfs( 0, V );
	
	// After computing all `ord` and `lowlink` values, iterate through the original edges
	// to identify and store bridges.
	lines.forEach( function ( edge ) {
		var u = edge[ 0 ]; // First vertex of the current edge.
		var v = edge[ 1 ]; // Second vertex of the current edge.
		
		// Ensure that `u` always has a smaller discovery time than `v` for consistent bridge detection logic.
		if ( ord[ u ] > ord[ v ] ) {
			var k = u; // Temporary variable for swapping.
			u = v;
			v = k;
		}
		
		// An edge (u, v) is a bridge if the discovery time of `u` is strictly less than
		// the low-link value of `v`. This means `v` (and its subtree) cannot reach `u` or
		// any ancestor of `u` without using the edge (u, v).
		if ( ord[ u ] < lowlink[ v ] ) {
			// This edge (u, v) is a bridge.
			// ???????????? (It's a bridge)
			var min = Math.min( u, v ); // Get the smaller vertex of the bridge.
			var max = Math.max( u, v ); // Get the larger vertex of the bridge.
			bridges[ min ].push( max ); // Add the larger vertex to the list of bridges for the smaller one.
		}
	} );
	
	// For each vertex, sort the list of bridges it's part of (by the other endpoint).
	bridges = bridges.map( function ( e ) {
		return e.sort();
	} );
	
	// Finally, iterate through all found bridges and print them to standard output.
	for ( var s = 0 ; s < V ; s++ )
	{
		var len = bridges[ s ].length; // Get the number of bridges connected to vertex 's'.
		
		// Iterate through each bridge found for vertex 's'.
		for ( var td = 0 ; td < len ; td++ )
		{
			var t = bridges[ s ][ td ]; // Get the other endpoint of the bridge.
			
			// Output the bridge in the format "s t".
			log( s + " " + t );
		}
	}
}