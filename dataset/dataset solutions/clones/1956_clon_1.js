"use strict"; // Enforce strict mode for cleaner code and fewer errors.

// --- Input Reading Utilities ---

// Synchronously read all input from stdin, treating it as UTF-8.
var input = require( "fs" ) . readFileSync ( "/dev/stdin" , "utf8" ) ;

// Split the input string by spaces or newlines, creating an array of tokens.
// `cid` acts as a cursor for the current index in the `cin` array.
var cin = input . split ( / |\n/ ) ,
    cid = 0 ;

/*
 * next(a): Retrieves the next token from the input array.
 * @param {boolean} a - If true, returns the token as a string.
 *                      If false or undefined, attempts to convert it to a number.
 * @returns {string|number} The next token.
 */
function next ( a ) {
  return a
    ? cin [ cid++ ] // Return as string.
    : + cin [ cid++ ] ; // Convert to number using unary plus operator.
}

/*
 * nexts(n, a): Retrieves 'n' consecutive tokens from the input array.
 * @param {number} n - The number of tokens to retrieve.
 * @param {boolean} a - If true, returns tokens as strings.
 *                      If false or undefined, maps them to numbers.
 * @returns {Array<string|number>} An array containing the retrieved tokens.
 */
function nexts ( n , a ) {
  return a
    ? cin . slice ( cid , cid += n ) // Return slice of strings.
    : cin . slice ( cid , cid += n ) . map ( a => +a ) ; // Map slice to numbers.
}

/*
 * nextm(h, w, a): Reads a matrix of 'h' rows and 'w' columns from the input.
 * @param {number} h - The number of rows (height).
 * @param {number} w - The number of columns (width) per row.
 * @param {boolean} a - If true, matrix elements are strings; otherwise, numbers.
 * @returns {Array<Array<string|number>>} The parsed matrix.
 */
function nextm ( h , w , a ) {
  var r = [] ,
      i = 0 ;
  if ( a ) {
    // If 'a' is true, push slices of string tokens directly.
    for ( ; i < h ; i++ )
      r . push ( cin . slice ( cid , cid += w ) ) ;
  } else {
    // Otherwise, push slices mapped to numbers.
    for ( ; i < h ; i++ )
      r . push ( cin . slice ( cid , cid += w ) . map ( a => +a ) ) ;
  }
  return r ;
}

/*
 * xArray(v, ...dimensions): Creates a multi-dimensional array initialized with a value.
 * The dimensions are passed as additional arguments after the initial value 'v'.
 * @param {*} v - The initial value for all elements.
 * @param {...number} dimensions - The sizes of each dimension, from outermost to innermost.
 * @returns {Array} A multi-dimensional array.
 */
function xArray ( v ) {
  var a = arguments ,
      l = a . length ,
      r = "Array(a[" + --l + "]).fill().map(x=>{return " + v + ";})" ; // Innermost dimension
  while ( --l )
    r = "Array(a[" + l + "]).fill().map(x=>" + r + ")" ; // Wrap for outer dimensions
  return eval ( r ) ; // Evaluate the dynamically constructed string to create the array.
}

// --- Priority Queue Implementation ---

// Defines a priority queue using an Immediately Invoked Function Expression (IIFE).
var priorityQueue = ( function ( ) {

  // Factory function to create new PriorityQueue instances.
  function f ( ) {
    return new PriorityQueue ( ) ;
  }

  // PriorityQueue constructor.
  function PriorityQueue ( ) {
    this . heap = [] ; // The underlying array that stores the heap elements.
  }

  // Adds an element `x` to the priority queue.
  // Elements are assumed to be arrays where the first element `x[0]` is the priority.
  PriorityQueue . prototype . push = function ( x ) {
    var h = this . heap ,
        i = h . length++ , // Current position for the new element, then increment length.
        j ;
    while ( i ) {
      j = ( i - 1 ) >> 1 ; // Calculate parent index.
      if ( h [ j ] [ 0 ] <= x [ 0 ] )
        break ; // If parent's priority is less than or equal to x's, heap property holds.
      h [ i ] = h [ j ] , // Move parent down.
      i = j ; // Move up to parent's position.
    }
    h [ i ] = x ; // Place x in its final sorted position.
  } ;

  // Removes and returns the element with the highest priority (smallest value).
  PriorityQueue . prototype . pop = function ( ) {
    var h = this . heap ,
        r = h [ 0 ] , // The root element (highest priority) to be returned.
        x = h . pop ( ) , // The last element, which will be re-positioned.
        l = h . length , // Current length of the heap after popping the last element.
        i = 0 , // Index for traversing down the heap.
        j ;
    if ( l === 0 )
      return r ; // If the heap is now empty, return the popped root.

    var k = l >> 1 ; // Optimization: No need to check leaf nodes.
    l-- ; // Adjust length for boundary checks in the loop (last valid index).

    while ( i < k ) {
      j = ( i << 1 ) + 1 ; // Calculate left child index.
      // Find the smaller child (if right child exists and has higher priority).
      if ( j < l && h [ j + 1 ] [ 0 ] < h [ j ] [ 0 ] )
        j++ ;
      if ( x [ 0 ] <= h [ j ] [ 0 ] )
        break ; // If x's priority is less than or equal to the smaller child's, stop.
      h [ i ] = h [ j ] , // Move child up.
      i = j ; // Move down to child's position.
    }
    h [ i ] = x ; // Place the re-positioned element.
    return r ; // Return the original root.
  } ;

  return f ; // Return the factory function for creating priority queues.

} ) ( ) ; // IIFE ends here.

// --- Main Program Execution ---

// Call the main function and store its return value.
var myOut = main ( ) ;
// If the main function returned anything (not undefined), print it to the console.
if ( myOut !== undefined )
  console . log ( myOut ) ;

// --- Main Function (Problem Logic) ---

/*
 * main(): Implements the core logic, likely a variation of Dijkstra's algorithm
 * to find shortest paths considering silver currency and exchanges.
 * @returns {string} The formatted answer string.
 */
function main ( ) {
  // Read N (number of nodes), M (number of edges), S (initial silver amount).
  var [ n , m , s ] = nexts ( 3 ) ;

  // Initialize the graph as an adjacency list. Each node starts with an empty array.
  var graph = xArray ( "[]" , n ) ;

  // Populate the graph with M edges.
  for ( var i = 0 ; i < m ; i++ ) {
    // Read edge details: u (source), v (destination), a (silver cost), b (time cost).
    var [ u , v , a , b ] = nexts ( 4 ) ;
    u-- , // Adjust node indices to be 0-based.
    v-- ;
    graph [ u ] . push ( [ v , a , b ] ) ; // Add edge from u to v.
    graph [ v ] . push ( [ u , a , b ] ) ; // Add edge from v to u (undirected graph).
  }

  // Read additional data 'd' for each node, presumably for silver exchange rates.
  // d[v][0] is silver gained, d[v][1] is time cost for exchange.
  var d = nextm ( n , 2 ) ;

  // Initialize a 3D map for dynamic programming or state tracking:
  // map[node][silver_amount] stores the minimum time to reach that state.
  // 1e18 represents an effectively infinite time. Max silver amount is 2500.
  var map = xArray ( 1e18 , n , 2501 ) ;

  // `rem` tracks the number of nodes whose shortest path to has not been finalized yet.
  var rem = n ;

  // `ans` stores the final shortest time to reach each node, initialized to infinity.
  var ans = xArray ( 1e18 , n ) ;

  // Create a new priority queue for Dijkstra's algorithm.
  var pq = new priorityQueue ( ) ;

  // Cap the initial silver amount at 2500.
  if ( s > 2500 )
    s = 2500 ;

  // Push the initial state to the priority queue: [time, node, current_silver].
  // Starting at node 0, time 0, with initial silver 's'.
  pq . push ( [ 0 , 0 , s ] ) ;

  // --- Dijkstra-like Algorithm Main Loop ---
  while ( rem ) {
    // Pop the state with the minimum time from the priority queue.
    var [ t , v , c ] = pq . pop ( ) ;

    // If this node 'v' has not had its shortest path finalized yet.
    if ( ans [ v ] === 1e18 ) {
      rem-- ; // Decrement count of remaining nodes.
      ans [ v ] = t ; // Finalize the shortest time to reach node 'v'.
    }

    // If the current path to (v, c) is worse than an already recorded path, skip.
    if ( map [ v ] [ c ] < t )
      continue ;

    // --- Explore Silver Exchange Option ---
    // If current silver 'c' is less than the maximum capacity (2500).
    if ( c < 2500 ) {
      var tt = t + d [ v ] [ 1 ] ; // Calculate new time after exchange (current time + exchange time cost).
      var cc = c + d [ v ] [ 0 ] ; // Calculate new silver amount after exchange (current silver + silver gained).
      if ( cc >= 2500 )
        cc = 2500 ; // Cap the silver amount at 2500.

      // If this new state (v, cc) results in a better (shorter) time.
      if ( map [ v ] [ cc ] > tt )
        map [ v ] [ cc ] = tt , // Update the map with the new minimum time.
        pq . push ( [ tt , v , cc ] ) ; // Push this new state to the priority queue.
    }

    // --- Explore Traveling to Adjacent Nodes ---
    for ( var i = 0 ; i < graph [ v ] . length ; i++ ) {
      var cc = c - graph [ v ] [ i ] [ 1 ] ; // Calculate silver remaining after travel (current silver - edge silver cost).
      if ( cc < 0 )
        continue ; // If not enough silver to travel, skip this edge.

      var tt = t + graph [ v ] [ i ] [ 2 ] , // Calculate new time after travel (current time + edge time cost).
          V = graph [ v ] [ i ] [ 0 ] ; // The destination node of this edge.

      // If this new state (V, cc) is not better (time is greater than or equal to recorded).
      if ( map [ V ] [ cc ] <= tt )
        continue ; // Skip, as we've found an equal or better path already.

      pq . push ( [ tt , V , cc ] ) ; // Push this new, better state to the priority queue.
    }
  }

  // Format the final answer: slice from the second element (node 1) and join with newlines.
  return ans . slice ( 1 ) . join ( "\n" ) ;
}