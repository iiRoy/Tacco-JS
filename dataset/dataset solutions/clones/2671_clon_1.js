var GET = ( function () {
  /**
   * This is the main entry point for the GET module.
   * It creates a new instance of the internal parser 'g'.
   * @param {string} s - The input string to be parsed.
   * @returns {g} A new parser instance.
   */
  function f ( s ) {
    return new g( s );
  }

  /**
   * Internal constructor for the GET module's data handling.
   * It processes the input string into an array of lines.
   * @param {string} s - The raw input string.
   */
  function g ( s ) {
    /*
     * Store the processed lines of the input string.
     * `trim()` removes leading/trailing whitespace, `split("\n")` separates into lines.
     */
    this._s = s.trim().split( "\n" );
    // Initialize the current line index to 0.
    this._y = 0;
  }

  /**
   * Reads a single item from the current line of input.
   * If the line has not been processed, it splits it by space and reverses it for easy popping.
   * @param {boolean} f - If true, returns the item as a string; otherwise, attempts to parse as a number.
   * @returns {string|number} The read item.
   */
  g.prototype.a = function ( f ) {
    var s = this._s, // Reference to the array of input lines.
        y = this._y, // Current line index.
        r;           // Variable to hold the retrieved item.

    // Check if the current line is still a single string (not yet split into items).
    if ( typeof s[y] === "string" ) {
      // Split the line by spaces and reverse it. This allows `pop()` to get items from left to right.
      s[y] = s[y].split( " " ).reverse();
    }

    // Pop the last item from the (reversed) array, which is the next item in the line.
    r = s[y].pop();

    // If the current line is now empty, advance to the next line.
    if ( !s[y].length ) {
      this._y++;
    }

    // Return the item: as a string if 'f' is true, otherwise as a number (using unary plus).
    return f ? r : +r;
  };

  /**
   * Reads an entire line of input, splitting it into items.
   * Advances the line pointer after reading.
   * @param {boolean} f - If true, returns items as strings; otherwise, attempts to parse all items as numbers.
   * @returns {Array<string|number>} An array of items from the line.
   */
  g.prototype.l = function ( f ) {
    // Get the current line, split it by spaces, and then advance the line pointer.
    var s = this._s[this._y++].split( " " );

    // Return items: as strings if 'f' is true, otherwise mapped to numbers.
    return f ? s : s.map( a => +a );
  };

  /**
   * Reads 'n' lines of input as a 2D array (matrix).
   * Each line is split into items. Advances the line pointer by 'n'.
   * @param {number} n - The number of lines to read.
   * @param {boolean} f - If true, returns items as strings; otherwise, attempts to parse all items as numbers.
   * @returns {Array<Array<string|number>>} A 2D array of items.
   */
  g.prototype.m = function ( n, f ) {
    // Slice 'n' lines from the input, then map each line to an array of items (split by space).
    var r = this._s.slice( this._y, this._y += n ).map( a => a.split( " " ) );

    // Return the matrix: as strings if 'f' is true, otherwise mapped to numbers.
    return f ? r : r.map( a => a.map( a => +a ) );
  };

  /**
   * Reads 'n' lines of input as a 1D array.
   * Each line is treated as a single item. Advances the line pointer by 'n'.
   * @param {number} n - The number of lines to read.
   * @param {boolean} f - If true, returns items as strings; otherwise, attempts to parse all items as numbers.
   * @returns {Array<string|number>} A 1D array of items.
   */
  g.prototype.r = function ( n, f ) {
    // Slice 'n' lines from the input.
    var r = this._s.slice( this._y, this._y += n );

    // Return the array: as strings if 'f' is true, otherwise mapped to numbers.
    return f ? r : r.map( a => +a );
  };

  // Return the main entry point function `f`.
  return f;
} )();

// Initialize the 'o' object by reading the standard input.
// This uses the 'GET' module to parse the content of '/dev/stdin' as UTF-8.
var o = GET( require( "fs" ).readFileSync( "/dev/stdin", "utf8" ) );

/**
 * Creates a multi-dimensional array initialized with a specific value or expression.
 * The dimensions are provided as subsequent arguments.
 * @param {*} v - The value or expression to initialize array elements with.
 * @param {...number} dimensions - The sizes of each dimension, from outermost to innermost.
 * @returns {Array} A multi-dimensional array.
 */
function xArray ( v ) {
  var a = arguments, // Access all arguments passed to the function.
      l = a.length,  // Total number of arguments.
      // Start building the string for the innermost array.
      // 'l' is decremented to get the last dimension.
      r = "Array(a[" + --l + "]).fill(0).map(x=>{return " + v + ";})";

  // Loop backwards through the remaining dimensions to wrap the array creation.
  while ( --l ) {
    r = "Array(a[" + l + "]).fill(0).map(x=>" + r + ")";
  }

  // Use `eval` to execute the dynamically constructed array creation string.
  return eval( r );
}

/**
 * Implements the Bellman-Ford algorithm for finding shortest paths in a graph.
 * It can handle negative edge weights and detect negative cycles.
 */
var bellmanFord = ( function () {
  // A large constant representing infinity for distances.
  var INF = 1e9;

  /**
   * Factory function to create and return a new Bellman-Ford solver instance.
   * @param {Array<Array<Object>>} graph - The graph as an adjacency list.
   * @param {number} start - The starting node for shortest path calculations.
   * @returns {bellmanFord} A new instance of the Bellman-Ford solver.
   */
  function f ( graph, start ) {
    return new bellmanFord( graph, start );
  }

  /**
   * Constructor for the Bellman-Ford algorithm.
   * Computes all shortest paths from the `start` node to all other nodes.
   * It also detects negative cycles.
   * @param {Array<Array<Object>>} graph - The graph (adjacency list: `graph[u] = [{to: v, cost: w}, ...]`).
   * @param {number} start - The index of the starting node.
   */
  function bellmanFord ( graph, start ) {
    var n  = graph.length, // Number of nodes in the graph.
        n2 = n << 1;      // Equivalent to n * 2, used for iteration count (to detect negative cycles).

    // Initialize distance array: all nodes are unreachable (INF) except the start node (0).
    var dist = this.d = Array( n ).fill( INF );
    dist[start] = 0;

    // Main loop of the Bellman-Ford algorithm.
    // Iterates `n * 2` times. The first `n-1` iterations find shortest paths.
    // Subsequent iterations (up to `n2`) are used to detect negative cycles.
    for ( var i = 0; i < n2; i++ ) {
      // Iterate through every vertex `v` in the graph.
      for ( var v = 0; v < n; v++ ) {
        // If the current node `v` is unreachable, it cannot be part of a shorter path to other nodes.
        if ( dist[v] === INF ) {
          continue;
        }

        // Iterate through all edges originating from vertex `v`.
        for ( var k = 0; k < graph[v].length; k++ ) {
          var e = graph[v][k]; // Current edge: {to: destination_node, cost: edge_weight}.

          // Relaxation step: if a shorter path to `e.to` is found via `v`.
          if ( dist[e.to] > dist[v] + e.cost ) {
            // If this relaxation occurs on or after the (n-1)-th iteration,
            // it means there's a negative cycle reachable from the start node,
            // and this node `e.to` is part of or reachable from that cycle.
            if ( i >= n - 1 ) {
              dist[e.to] = -INF; // Mark distance as negative infinity.
            } else {
              dist[e.to] = dist[v] + e.cost; // Update the shortest distance.
            }
          }
        }
      }
    }
  }

  /**
   * Retrieves the shortest distance from the start node to a specified node.
   * @param {number} i - The index of the target node.
   * @returns {number} The shortest distance to node `i`.
   */
  bellmanFord.prototype.dist = function ( i ) {
    return this.d[i];
  };

  // Return the factory function `f` to create Bellman-Ford instances.
  return f;
} )();

// Execute the main function and print its return value to the console.
console.log( main() );

/**
 * The main function of the program.
 * Reads problem input, constructs a graph representing a profit maximization problem,
 * applies the Bellman-Ford algorithm, and determines the maximum achievable profit.
 * @returns {number} The maximum profit, -1 if infinite profit, or 0 if no profit can be made.
 */
function main () {
  // Read the number of nodes (N), number of edges (M), and the profit multiplier (P).
  var n = o.a(); // N: Number of nodes.
  var m = o.a(); // M: Number of edges.
  var p = o.a(); // P: Profit multiplier.

  // Create an adjacency list for the graph, initialized with empty arrays for each node.
  var graph = xArray( "[]", n );

  // Read M edges and populate the graph.
  for ( var i = 0; i < m; i++ ) {
    // Read a line containing edge details: t[0]=source, t[1]=destination, t[2]=cost.
    var t = o.l(),
        a = t[0] - 1, // Source node, 0-indexed.
        b = t[1] - 1, // Destination node, 0-indexed.
        c = t[2];     // Original cost of traversing the edge.

    // Add the edge to the graph. The cost is transformed to (P - c)
    // because we are looking for the maximum profit, which is equivalent
    // to finding the shortest path with costs (P - c).
    graph[a].push( { to : b, cost : p - c } );
  }

  // Run the Bellman-Ford algorithm starting from node 0.
  var bf = bellmanFord( graph, 0 );

  // Check the shortest distance to the last node (n-1).
  // If the distance is -1e9, it means the last node is reachable from a negative cycle.
  // In the context of profit maximization, this implies infinite profit.
  if ( bf.dist( n - 1 ) === -1e9 ) {
    return -1; // Indicate infinite profit.
  }

  // If the shortest path cost to the last node is non-negative,
  // it means that no profit can be made, or there is a loss.
  // Since we're maximizing profit, this translates to zero profit.
  if ( bf.dist( n - 1 ) >= 0 ) {
    return 0; // Indicate zero profit.
  }

  // Otherwise, the shortest path cost is negative.
  // The maximum profit is the negative of this shortest path cost.
  return -bf.dist( n - 1 );
}