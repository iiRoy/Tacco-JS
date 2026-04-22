"use strict";

// --- Global Modules and Input Handling ---
var fs = require( "fs" );
var input = fs.readFileSync( "/dev/stdin", "utf8" );

// Split input by spaces or newlines, initialize pointer for `next` functions
var cin = input.split( / |\n/ ),
    cx  = 0;

/**
 * Reads the next integer from the input array.
 * @returns {number} The next integer.
 */
function next ( ) {
  return +cin[cx++];
}

/**
 * Reads the next string from the input array.
 * @returns {string} The next string.
 */
function nexts ( ) {
  return cin[cx++];
}

/**
 * Dynamically creates a multi-dimensional array initialized with a given value.
 * The dimensions are passed as subsequent arguments.
 *
 * @param {*} v - The initial value for the array elements.
 * @param {...number} dimensions - The dimensions of the array.
 * @returns {Array} The initialized multi-dimensional array.
 */
function xArray ( v ) {
  var a = arguments,
      l = a.length,
      r = "Array(a[" + --l + "]).fill(0).map(x=>{return " + v + ";})";

  while ( --l ) {
    r = "Array(a[" + l + "]).fill(0).map(x=>" + r + ")";
  }

  return eval( r );
}


// --- Union-Find Data Structure ---

/**
 * Initializes a Union-Find data structure.
 * @param {number} n - The number of elements.
 */
function unionFind ( n ) {
  this.a = Array( n + 1 ).fill( -1 ); // Parent array, -1 indicates root and size
}

unionFind.prototype = {
  /**
   * Finds the root of the set containing element `i`.
   * Performs path compression.
   * @param {number} i - The element to find the root for.
   * @returns {number} The root of the set.
   */
  root : function ( i ) {
    return this.a[i] < 0
      ? i
      : ( this.a[i] = this.root( this.a[i] ) );
  },

  /**
   * Checks if two elements are in the same set.
   * @param {number} x - First element.
   * @param {number} y - Second element.
   * @returns {boolean} True if they are in the same set, false otherwise.
   */
  same : function ( x, y ) {
    return this.root( x ) === this.root( y );
  },

  /**
   * Unites the sets containing elements `x` and `y`.
   * Performs union by size/rank.
   * @param {number} x - First element.
   * @param {number} y - Second element.
   * @returns {number} 1 if unification was performed, 0 if already united.
   */
  unite : function ( x, y ) {
    x = this.root( x );
    y = this.root( y );

    if ( x === y ) {
      return 1;
    }

    if ( this.a[y] <= this.a[x] ) {
      this.a[y] += this.a[x];
      this.a[x] = y;
    } else {
      this.a[x] += this.a[y];
      this.a[y] = x;
    }
  },

  /**
   * Returns the size of the set containing element `i`.
   * @param {number} i - The element.
   * @returns {number} The size of the set.
   */
  size : function ( i ) {
    return -this.a[this.root( i )];
  },
};


// --- Global State Variables ---
var leng = 0, // Remaining length of the current path segment
    nextV = 0, // Next vertex to move to
    day = 0, // Current day
    takeday = -1; // Last day items were taken

var score = 0; // Total score accumulated

const INF = 1e9; // A large number representing infinity

// Graph properties and data structures
const V = next(); // Number of vertices (e.g., 200-400)
const E = next(); // Number of edges (e.g., 1.5V-2V)

// Distance matrices: dist for all-pairs shortest paths, directDist for direct edge weights
const dist = xArray( INF, V, V );
const directDist = xArray( INF, V, V );

// Adjacency list for graph edges
const e = xArray( "[]", V );

getE( ); // Initialize graph edges and direct distances

const tmax = next(); // Maximum number of days (e.g., 10000)
const tmax2 = tmax * tmax; // tmax squared, used for score calculation

const ans = Array( tmax ); // Array to store answers for each day

// Sets to manage items: 'has' for items currently in possession, 'ready' for items ready for delivery
const has = new Set(),
      ready = new Set();

var round = []; // Current path being traversed (list of vertices)

// Stores the day an item was ordered for each vertex (destination)
const orderTime = xArray( "[]", V );


// --- Main Execution Block ---
const out = main(); // Run the main simulation

// Output the result to stdout or console.log in case of error
try {
  fs.writeFileSync( "/dev/stdout", out );
  console.log( score );
} catch ( er ) {
  console.log( out ); // Fallback to console.log if file write fails
}


// --- Core Functions ---

/**
 * The main simulation loop.
 * Calculates all-pairs shortest paths using Floyd-Warshall, then simulates days.
 * @returns {string} The newline-separated sequence of chosen vertices for each day.
 */
function main ( ) {
  // Floyd-Warshall algorithm for all-pairs shortest paths
  for ( var k = 0; k < V; k++ ) {
    for ( var i = 0; i < V; i++ ) {
      for ( var j = 0; j < V; j++ ) {
        if ( dist[i][k] + dist[k][j] < dist[i][j] ) {
          dist[i][j] = dist[i][k] + dist[k][j];
        }
      }
    }
  }

  // Simulate each day up to tmax
  while ( day < tmax ) {
    ans[day] = solve( ) + 1; // Store the next vertex (1-indexed for output)

    // Error condition: if leng becomes negative, something went wrong
    if ( leng < 0 ) {
      console.log( day, leng, nextV );
      return; // Exit early
    }

    day++; // Advance to the next day
  }

  return ans.join( "\n" ); // Join all daily answers with newlines
}

/**
 * Calculates a Minimum Spanning Tree (MST) for a given set of vertices
 * including vertex 0 (the depot), using Kruskal's algorithm.
 *
 * @param {Set<number>} set - The set of vertices to include in the MST.
 * @returns {Array<Array<number>>} A list of edges [u, v, weight] forming the MST.
 */
function kruskal ( set ) {
  // Combine vertex 0 with the target set
  var vs = Array.from( set ).concat( 0 );
  var n = vs.length; // Number of vertices in the MST calculation

  var es = []; // List of potential edges
  // Generate all possible edges between vertices in `vs`
  for ( var i = 0; i < n; i++ ) {
    for ( var j = i + 1; j < n; j++ ) {
      es.push( [vs[i], vs[j], dist[vs[i]][vs[j]]] );
    }
  }

  // Sort edges by weight in ascending order
  es.sort( ( a, b ) => a[2] - b[2] );

  var uf = new unionFind( V ); // Union-Find instance for MST
  var res = []; // Stores the edges of the MST

  // Iterate through sorted edges to build the MST
  // The loop continues until all `n` vertices are connected to vertex 0
  for ( var i = 0; uf.size( 0 ) !== n; i++ ) {
    // If uniting these two vertices doesn't form a cycle (i.e., they are in different sets)
    if ( uf.unite( es[i][0], es[i][1] ) ) {
      continue; // Skip if they were already united
    }
    // Add the edge to the MST
    res.push( [es[i][0], es[i][1], es[i][2]] );
  }
  return res;
}

/**
 * Reconstructs an MST by adding new vertices to an existing tree.
 * (This function appears to be incomplete or have a bug, `n` is undefined inside it).
 *
 * @param {Array<Array<number>>} tree - The existing MST edges.
 * @param {Set<number>} set - The set of vertices in the existing tree (excluding `addV`).
 * @param {Set<number>} addV - The set of new vertices to add.
 * @returns {Array<Array<number>>} The new MST edges.
 */
function treeAdd ( tree, set, addV ) {
  var vset = Array.from( set ).concat( 0 ); // Vertices already in the tree plus depot
  var vadd = Array.from( addV ); // Vertices to add

  var ns = vset.length, // Count of existing vertices
      na = vadd.length; // Count of new vertices

  var es = []; // Edges between existing and new vertices
  for ( var i = 0; i < ns; i++ ) {
    for ( var j = 0; j < na; j++ ) {
      es.push( [vset[i], vadd[j], dist[vset[i]][vadd[j]]] );
    }
  }

  es.sort( ( a, b ) => a[2] - b[2] ); // Sort new edges

  es.push( [0, 0, INF] ); // Sentinel edge to ensure loops terminate

  var uf = new unionFind( V ); // Union-Find for the new MST
  var res = []; // Resulting MST edges

  // This loop has an issue: `n` is not defined within `treeAdd`.
  // It likely should be `vset.length + vadd.length` or similar.
  for ( var i = 0, j = 0; uf.size( 0 ) !== n; ) {
    if ( i === ns || es[j][2] < tree[i][2] ) {
      if ( !uf.unite( es[j][0], es[j][1] ) ) {
        res.push( [es[j][0], es[j][1], es[j][2]] );
      }
      j++;
    } else {
      if ( !uf.unite( tree[i][0], tree[i][1] ) ) {
        res.push( [tree[i][0], tree[i][1], tree[i][2]] );
      }
      i++;
    }
  }
  return res;
}

/**
 * Initializes the graph by reading edge data.
 * Sets direct distances and populates adjacency lists.
 */
function getE ( ) {
  // Initialize diagonal of distance matrix to 0 (distance from a vertex to itself)
  for ( var i = 0; i < V; i++ ) {
    dist[i][i] = 0;
  }

  // Read E edges
  for ( var i = 0; i < E; i++ ) {
    var v1 = next() - 1, // Vertex 1 (0-indexed)
        v2 = next() - 1, // Vertex 2 (0-indexed)
        d = next(); // Distance/weight of the edge

    // Set direct and initial shortest path distances for undirected edges
    dist[v1][v2] = dist[v2][v1] = directDist[v1][v2] = directDist[v2][v1] = d;

    // Add to adjacency lists
    e[v1].push( v2 );
    e[v2].push( v1 );
  }
}

/**
 * Determines the next destination when delivering items.
 * @returns {number} The next vertex to move to, or -2 if no path found.
 */
function deliver ( ) {
  // If no items are currently held, check if nextV is 0 (depot)
  if ( has.size === 0 ) {
    if ( nextV === 0 ) {
      return -2; // No items, at depot, nothing to do
    }
    return minPath( 0 ); // Go back to depot
  }

  // If the current nextV is the last item in the round path, remove it
  if ( nextV === round[round.length - 1] ) {
    round.pop( );
  }

  // If the path is now empty, go back to depot
  if ( round.length === 0 ) {
    return minPath( 0 );
  }

  // Otherwise, continue along the current path
  return minPath( round[round.length - 1] );
}

/**
 * Finds the next vertex on the shortest path from `nextV` to `to`.
 * Updates `leng` and `nextV` accordingly.
 * @param {number} to - The target destination vertex.
 * @returns {number} The next vertex in the path, or -2 if no path.
 */
function minPath ( to ) {
  // Iterate through neighbors of `nextV`
  for ( var v of e[nextV] ) {
    // Check if `v` is on the shortest path from `nextV` to `to`
    if ( dist[nextV][to] === directDist[nextV][v] + dist[v][to] ) {
      leng = dist[nextV][v] - 1; // Set remaining path length
      return nextV = v; // Move to `v` and return it
    }
  }
  return -2; // Should not happen if `dist` is correct and path exists
}

/**
 * Solves for the current day's action.
 * If currently traversing a path, decrements `leng`.
 * If at a vertex with `leng` 0, either `take` items at depot or `give` items at destination.
 * Then determines the next delivery target.
 * @returns {number} The chosen vertex for the current day.
 */
function solve ( ) {
  if ( leng ) {
    leng--; // Continue moving along the current path
    return nextV;
  }

  // If `leng` is 0, we have arrived at `nextV`
  if ( nextV === 0 ) {
    take( ); // If at depot, take new items
  } else {
    give( ); // If at a destination, deliver items
  }

  return deliver( ); // Determine the next move based on delivery needs
}

/**
 * Handles taking new items at the depot (vertex 0).
 * Updates `has` set and `orderTime`.
 * Recalculates the MST for current items and sets the `round` path.
 */
function take ( ) {
  round = []; // Clear current path

  // Process new orders until `takeday` catches up to `day`
  while ( takeday < day ) {
    takeday++;
    var n = next(); // Number of items ordered today
    for ( var i = 0; i < n; i++ ) {
      var id = next() - 1, // Item ID (not used)
          d = next() - 1; // Destination vertex (0-indexed)
      has.add( d ); // Add destination to the set of items to deliver
      orderTime[d].push( takeday ); // Record the day the item was ordered
    }
  }

  if ( has.size === 0 ) {
    return; // No items to deliver
  }

  // Calculate MST for all destinations in `has` plus the depot
  var tree = kruskal( has );
  var road = xArray( "[]", V ); // Adjacency list for the MST

  // Build the adjacency list from the MST edges
  for ( var i = 0; i < tree.length; i++ ) {
    var a = tree[i][0],
        b = tree[i][1];
    road[a].push( b );
    road[b].push( a );
  }

  dfs( 0, -1, road ); // Perform DFS from depot to find an Eulerian path-like traversal
  round.reverse( ); // Reverse the path to get correct delivery order
  round.pop( ); // Remove the starting depot (as we are already there)
}

/**
 * Performs a Depth-First Search (DFS) on the MST to create a traversal path (`round`).
 * @param {number} v - Current vertex.
 * @param {number} p - Parent vertex (to avoid going back immediately).
 * @param {Array<Array<number>>} road - Adjacency list representing the MST.
 */
function dfs ( v, p, road ) {
  round.push( v ); // Add current vertex to the path

  // Traverse neighbors
  for ( var i of road[v] ) {
    if ( i === p ) {
      continue; // Skip parent
    }
    dfs( i, v, road ); // Recurse
  }
}

/**
 * Handles delivering an item at `nextV`.
 * Removes `nextV` from `has` and updates the score based on delivery time.
 */
function give ( ) {
  has.delete( nextV ); // Remove the delivered item's destination from `has`

  // Calculate and add score for all items delivered to `nextV`
  while ( orderTime[nextV].length ) {
    var t = day - orderTime[nextV].pop( ); // Time taken for delivery
    score += tmax2 - t * t; // Update score
  }
}