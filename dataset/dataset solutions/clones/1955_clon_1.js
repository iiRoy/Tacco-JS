"use strict"; /* This directive enforces strict parsing and error handling in the script. */

// --- Input Reading Utilities ---

var input = require("fs") . readFileSync ( "/dev/stdin" , "utf8" ) ; /* Reads entire standard input synchronously. */

var cin = input . split ( / |\n/ ) , /* Splits input by spaces or newlines into an array. */
    cid = 0 ; /* Current index for reading from the 'cin' array. */

/**
 * Reads the next token from the input.
 * @param {boolean} a - If true, returns string; otherwise, returns number.
 * @returns {string|number} The next token.
 */
function next( a ) {

  return a ? cin[ cid ++ ] : + cin[ cid ++ ] ;

}


/**
 * Reads 'n' tokens from the input.
 * @param {number} n - Number of tokens to read.
 * @param {boolean} a - If true, returns array of strings; otherwise, returns array of numbers.
 * @returns {Array<string|number>} An array of 'n' tokens.
 */
function nexts( n , a ) {

  return a
    ? cin . slice ( cid , cid += n )
    : cin . slice ( cid , cid += n ) . map ( a => + a ) ;

}


/**
 * Reads a 2D matrix of 'h' rows and 'w' columns from the input.
 * @param {number} h - Number of rows.
 * @param {number} w - Number of columns.
 * @param {boolean} a - If true, returns matrix of strings; otherwise, returns matrix of numbers.
 * @returns {Array<Array<string|number>>} The 2D matrix.
 */
function nextm( h , w , a ) {

  var r = [ ] ,
      i = 0 ;

  if ( a ) {
    for ( ; i < h ; i ++ ) {
      r . push ( cin . slice ( cid , cid += w ) ) ;
    }
  }
  else {
    for ( ; i < h ; i ++ ) {
      r . push ( cin . slice ( cid , cid += w ) . map ( a => + a ) ) ;
    }
  }

  return r ;

}


/**
 * Creates a multi-dimensional array initialized with a value or a nested structure.
 * @param {*} v - The initial value for the innermost array elements.
 * @param {...number} dimensions - The dimensions of the array.
 * @returns {Array} The created multi-dimensional array.
 */
function xArray( v ) {

  var a = arguments ,
      l = a . length ,
      r = "Array(a[" + -- l + "]).fill().map(x=>{return " + v + ";})" ;

  while ( -- l ) {
    r = "Array(a[" + l + "]).fill().map(x=>" + r + ")" ;
  }

  return eval ( r ) ;

}

// --- Priority Queue Implementation ---

var priorityQueue = ( function ( ) {

  /**
   * Factory function to create a new PriorityQueue instance.
   * @returns {PriorityQueue} A new PriorityQueue object.
   */
  function f ( ) {
    return new PriorityQueue ( ) ;
  }

  /**
   * Constructor for the PriorityQueue.
   * Initializes an empty heap.
   */
  function PriorityQueue ( ) {
    this . heap = [ ] ;
  }

  /**
   * Pushes an element onto the priority queue.
   * Elements are expected to be arrays where the first element is the priority.
   * @param {Array} x - The element to push.
   */
  PriorityQueue . prototype . push = function ( x ) {

    var h = this . heap ,
        i = h . length ++ , // Current index, then increment length
        j ;

    // Bubble up the new element
    while ( i ) {

      j = i - 1 >> 1 ; // Parent index

      if ( h[ j ][ 0 ] <= x[ 0 ] ) {
        break ; // Correct position found
      }

      h[ i ] = h[ j ] , // Move parent down
      i = j ;           // Move up to parent's position

    }

    h[ i ] = x ; // Place the new element

  } ;


  /**
   * Removes and returns the element with the highest priority (smallest first element).
   * @returns {Array} The element with the highest priority.
   */
  PriorityQueue . prototype . pop = function ( ) {

    var h = this . heap ,
        r = h[ 0 ] , // Root (highest priority) element to return
        x = h . pop ( ) , // Last element, will be used to fill the hole
        l = h . length , // Current length of the heap
        i = 0 ,          // Index for bubbling down
        j ;              // Child index

    if ( l === 0 ) {
      return r ; // Heap is empty after pop
    }

    var k = l >> 1 ; // Index of the last parent node
    l -- ;           // Adjust length for comparison (last element already popped)

    // Bubble down 'x'
    while ( i < k ) {

      j = ( i << 1 ) + 1 ; // Left child index

      // If right child exists and has higher priority than left child
      if ( j < l && h[ j + 1 ][ 0 ] < h[ j ][ 0 ] ) {
        j ++ ; // Use right child
      }

      if ( x[ 0 ] <= h[ j ][ 0 ] ) {
        break ; // Correct position found for 'x'
      }

      h[ i ] = h[ j ] , // Move child up
      i = j ;           // Move down to child's position

    }

    h[ i ] = x ; // Place 'x' in its final position

    return r ; // Return the original root

  } ;

  return f ; // Return the factory function

} ) ( ) ; // Immediately invoked function expression for priorityQueue


// --- Main Program Execution ---

var myOut = main ( ) ; /* Execute the main function. */

if ( myOut !== undefined ) {
  console . log ( myOut ) ; /* If main returns a value, print it to console. */
}


/**
 * The main function containing the solution logic.
 * Implements Dijkstra's algorithm variant for shortest path with currency exchange.
 * @returns {string} The result string.
 */
function main ( ) {

  var [ n , m , s ] = nexts ( 3 ) ; /* Read N (nodes), M (edges), S (initial currency). */

  const INF = 1e18 , /* A large number representing infinity for distances. */
        mx = ( n - 1 ) * 50 ; /* Maximum possible currency capacity (based on problem constraints). */

  var graph = xArray ( "[]" , n ) ; /* Adjacency list for the graph. Each node has an empty array initially. */

  // Build the graph from M edges
  for ( var i = 0 ; i < m ; i ++ ) {

    var [ u , v , a , b ] = nexts ( 4 ) ; /* Read edge details: u, v (nodes), a (cost in currency), b (time cost). */

    u -- , v -- ; /* Convert to 0-indexed nodes. */

    graph[ u ] . push ( [ v , a , b ] ) ; /* Add edge u -> v. */
    graph[ v ] . push ( [ u , a , b ] ) ; /* Add edge v -> u (undirected graph). */

  }

  var d = nextm ( n , 2 ) ; /* Read currency exchange rates for each city: d[v][0] (exchange rate), d[v][1] (exchange time). */

  // map[v][c] stores the minimum time to reach city 'v' with 'c' currency.
  var map = xArray ( INF , n , mx + 1 ) ;

  var rem = n ; /* Number of unvisited cities for which minimum time is not yet finalized. */
  var ans = xArray ( INF , n ) ; /* ans[v] stores the minimum time to reach city 'v'. */

  var pq = new priorityQueue ( ) ; /* Initialize a new priority queue for Dijkstra. */

  if ( s > mx ) {
    s = mx ; /* Cap initial currency at mx if it exceeds it. */
  }

  pq . push ( [ 0 , 0 , s ] ) ; /* Push initial state: [time, city, currency]. Start at city 0 with 's' currency, time 0. */
  map[ 0 ][ s ] = 0 ; /* Mark the initial state in the map. */

  // Dijkstra's algorithm
  while ( rem ) {

    var [ t , v , c ] = pq . pop ( ) ; /* Extract state with minimum time: time, city, currency. */

    // If we've found a shorter path to this state already, skip.
    if ( map[ v ][ c ] < t ) {
      continue ;
    }

    // If this is the first time we finalize the minimum time for city 'v'
    if ( ans[ v ] === INF ) {
      rem -- ,
      ans[ v ] = t ;
    }

    // Option 1: Exchange currency at city 'v'
    if ( c < mx ) {

      var tt = t + d[ v ][ 1 ] ; /* New time: current time + exchange time. */
      var cc = c + d[ v ][ 0 ] ; /* New currency: current currency + exchanged amount. */

      if ( cc >= mx ) {
        cc = mx ; /* Cap currency at mx. */
      }

      // If this path to (v, cc) is shorter
      if ( map[ v ][ cc ] > tt ) {
        map[ v ][ cc ] = tt ,
        pq . push ( [ tt , v , cc ] ) ;
      }

    }

    // Option 2: Spend 1 unit of currency (if possible)
    if ( c && map[ v ][ c - 1 ] > t ) { // Note: original problem description implies spending currency to travel,
                                        // but this snippet seems to handle it as a separate state transition.
                                        // Assuming it's a valid operation for the specific problem.
      map[ v ][ c - 1 ] = t ,
      pq . push ( [ t , v , c - 1 ] ) ;
    }


    // Option 3: Travel through edges from city 'v'
    for ( var i = 0 ; i < graph[ v ] . length ; i ++ ) {

      var cost_to_travel = graph[ v ][ i ][ 1 ] ; /* Currency required for this edge. */
      var time_to_travel = graph[ v ][ i ][ 2 ] ; /* Time taken for this edge. */
      var next_city = graph[ v ][ i ][ 0 ] ;     /* Destination city. */

      var cc = c - cost_to_travel ; /* Remaining currency after travel. */

      if ( cc < 0 ) {
        continue ; /* Cannot travel if not enough currency. */
      }

      var tt = t + time_to_travel , /* Total time to reach next_city with remaining currency. */
          V = next_city ;

      // If this path to (V, cc) is shorter
      if ( map[ V ][ cc ] > tt ) {
        map[ V ][ cc ] = tt ,
        pq . push ( [ tt , V , cc ] ) ;
      }

    }

  }

  // Return the minimum times for cities 1 to N-1 (excluding start city 0), joined by newlines.
  return ans . slice ( 1 ) . join ( "\n" ) ;

}