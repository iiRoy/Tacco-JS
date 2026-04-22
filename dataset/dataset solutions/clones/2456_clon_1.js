/* This JavaScript file implements a solution for a specific problem.
 * It uses a custom array initialization function and several global variables
 * to manage state related to deliveries and scoring.
 * The core logic involves pathfinding and order management.
 */
"use strict"; // Enforces stricter parsing and error handling in the code.

// Custom function to create multi-dimensional arrays, or arrays initialized with specific values.
function   xArray  ( v )
{
  var a = arguments ,
    l = a.length ,
    r = "Array(a[" + --l + "]).fill(0).map(x=>{return " + v + ";})" ;

  while ( --l ) {
    r = "Array(a[" + l + "]).fill(0).map(x=>" + r + ")" ;
  }

  return eval( r ) ; // Executes the dynamically constructed string as JavaScript code.
}



// Global variables used throughout the program to maintain state.
var leng = 0 ,
    nextV = 0 ,
    day = 0 ,
    takeday = -1 ;

var score = 0 ;


const INF = 1e9 ; // Represents infinity for distance calculations.
var V ;           // Number of vertices (nodes) in the graph, typically 200-400.
var E ;           // Number of edges in the graph, typically 1.5V-2V.

var dist ;        // 2D array storing shortest path distances between all pairs of nodes.
var directDist ;  // 2D array storing direct edge distances between connected nodes.
var e ;           // Adjacency list representation of the graph.
var f ;           // An array of some kind, its purpose is not immediately clear from its name.

var tmax ;        // Maximum time or duration, often 10000 units.
var tmax2 ;       // tmax squared, pre-calculated for score computation.

const has = new Set( ) ; // Stores IDs of items/orders currently held or in transit.
var orderTime = xArray( "[]" , V ) ; // Stores arrival times for orders at each vertex.
const item = [ ] ;       // Buffer for incoming order data.
const out = [ ] ;        // Stores the output for each day.


var cx = 0 ; // Current index for processing items from the 'item' array.

/*
 * Retrieves the next item from the 'item' buffer and increments the index.
 * The '+' prefix ensures the returned value is a number.
 */
function next ( )
{
  return +item[ cx++ ] ;
}


/*
 * Determines the next delivery action.
 * If no items are held, it might start a new path from the origin.
 * Otherwise, it prioritizes delivering the held item that has the most pending orders
 * and is reachable within the remaining time.
 */
function deliver ( )
{
  if ( has.size === 0 )
  {
    if ( nextV === 0 )
    {
      return -2 ; // No items to deliver and at origin, nothing to do.
    }
    return minPath( 0 ) ; // Go back to origin if no items are held.
  }

  var maxid = -1 ,
      max = 0 ;

  // Iterate through currently held items to find the best candidate for delivery.
  for ( var v of has )
  {
    // Check if this item has more pending orders than current max,
    // AND if it's reachable within the remaining time.
    if ( max < orderTime[v].length ) {
      if ( dist[nextV][v] <= tmax - day ) {
        maxid = v ;
        max = orderTime[v].length ;
      }
    }
  }

  if ( maxid === -1 )
  {
    return -2 ; // No suitable item found for delivery.
  }

  return minPath( maxid ) ; // Proceed to deliver the selected item.
}



/*
 * Finds the next step on the shortest path from 'nextV' to 'to'.
 * Updates 'leng' (remaining length of current segment) and 'nextV' (current position).
 */
function minPath ( to )
{
  for ( var v of e[nextV] )
  {
    // If 'v' is the next node on the shortest path from 'nextV' to 'to'.
    if ( dist[nextV][to] === directDist[nextV][v] + dist[v][to] )
    {
      leng = dist[nextV][v] - 1 ; // Set remaining steps for this direct segment.
      return nextV = v ;         // Move to the next node 'v'.
    }
  }
  return -2 ; // Should not happen if 'to' is reachable.
}


/*
 * Main logic for each time step.
 * Manages movement, taking new orders, and giving delivered orders.
 */
function solve ( )
{
  // If currently traversing a segment, just decrement length and stay at current node.
  if ( leng )
  {
    leng-- ;
    return nextV ;
  }

  // If at a node (leng is 0), perform actions based on current location.
  if ( nextV === 0 )
  {
    take( ) ; // If at origin, take new orders.
  }
  else
  {
    give( ) ; // If at a destination, give delivered orders.
  }

  return deliver( ) ; // After actions, determine the next delivery target.
}


/*
 * Processes incoming orders up to the current 'day'.
 * Adds new orders to the 'has' set and records their arrival time.
 */
function take ( )
{
  while ( takeday < day )
  {
    takeday++ ; // Increment the day for which orders are being processed.
    var n = next( ) ; // Number of orders for this specific 'takeday'.

    for ( var i = 0 ; i < n ; i++ )
    {
      var id = next( ) - 1 , // Order ID.
          d = next( ) - 1 ;   // Destination node ID.
      has.add( d ) ;          // Mark this destination as having a pending order.
      orderTime[d].push( takeday ) ; // Record the day this order arrived at destination 'd'.
    }
  }
}


/*
 * Handles giving (delivering) items at the current 'nextV' node.
 * Removes the node from 'has' and calculates the score for delivered items.
 */
function give ( )
{
  has.delete( nextV ) ; // Remove the current node from the set of pending deliveries.

  // Process all orders that were destined for 'nextV'.
  while ( orderTime[nextV].length )
  {
    var t = day - orderTime[nextV].pop( ) ; // Calculate delivery time difference.
    score += tmax2 - t * t ;              // Update score based on delivery time.
  }
}


// Setup for reading input from standard input using 'readline' module.
const rl = require( "readline" ).createInterface( process.stdin , process.stdout ) ;


/*
 * Generator function 'g' to handle asynchronous input reading.
 * It uses 'yield gets()' to pause execution until a line is read.
 */
const g = ( function* ( )
{
  // Helper function to read a single line from input.
  const gets = ( ) => rl.once( "line" , s => g.next( s ) ) ;

  var V_E_str = yield gets( ) ; // Read the first line containing V and E.
  V_E_str = V_E_str.split( " " ) ;

  E = +V_E_str[ 1 ] ; // Parse E (number of edges).
  V = +V_E_str[ 0 ] ; // Parse V (number of vertices).

  // Initialize distance matrices and adjacency list.
  dist = xArray( INF , V , V ) ;
  directDist = xArray( INF , V , V ) ;
  e = xArray( "[]" , V ) ;

  // Initialize self-distances to 0.
  for ( var i = 0 ; i < V ; i++ )
  {
    dist[i][i] = 0 ;
  }

  // Read E edges and populate distance matrices and adjacency list.
  for ( var i = 0 ; i < E ; i++ )
  {
    var t = ( yield gets( ) ).split( " " ) ; // Read edge details.
    var v1 = t[ 0 ] - 1 ,
        v2 = t[ 1 ] - 1 ,
        d = +t[ 2 ] ;

    // Set distances for both directions (undirected graph).
    dist[v1][v2] = dist[v2][v1] = directDist[v1][v2] = directDist[v2][v1] = d ;

    // Add edges to adjacency list.
    e[v1].push( v2 ) ;
    e[v2].push( v1 ) ;
  }

  // Floyd-Warshall algorithm to compute all-pairs shortest paths.
  for ( var k = 0 ; k < V ; k++ )
    for ( var i = 0 ; i < V ; i++ )
      for ( var j = 0 ; j < V ; j++ )
      {
        if ( dist[i][k] + dist[k][j] < dist[i][j] )
        {
          dist[i][j] = dist[i][k] + dist[k][j] ;
        }
      }

  // Read the 'f' array.
  f = ( yield gets( ) ).split( " " ).map( a => +a ) ;

  // Read maximum time 'tmax'.
  tmax = +( yield gets( ) ) ; // 10000
  tmax2 = tmax * tmax ;     // Pre-calculate tmax squared.

  // Re-initialize orderTime (V was not known at initial declaration).
  orderTime = xArray( "[]" , V ) ;


  // Main simulation loop, runs for 'tmax' days.
  for ( ; day < tmax ; day++ )
  {
    var t = +( yield gets( ) ) ; // Number of new orders for this day.
    item.push( t ) ;             // Store number of orders.

    // Read details for each new order.
    for ( var i = 0 ; i < t ; i++ )
    {
      var u = ( yield gets( ) ).split( " " ).map( a => +a ) ; // Order details (e.g., source, destination).
      item.push( u[ 0 ] , u[ 1 ] ) ;                          // Store order data.
    }

    t = +( yield gets( ) ) ; // Read number of "other" inputs for this day.
    // Consume "other" inputs.
    for ( var i = 0 ; i < t ; i++ )
    {
      var u = yield gets( ) ;
    }

    out[ day ] = solve( ) + 1 ; // Execute the daily simulation step and store result.
    console.log( out[ day ] ) ; // Output the result for the current day.

    t = yield gets( ) ; // Read a control signal.
    if ( t[ 0 ] !== "O" )
    {
      return ; // If not 'O', terminate the simulation.
    }

    t = +( yield gets( ) ) ; // Read number of "more other" inputs.
    // Consume "more other" inputs.
    for ( var i = 0 ; i < t ; i++ )
    {
      var u = yield gets( ) ;
    }
  }
} ) ( ) ; // Immediately invoke the generator function.

g.next( ) ; // Start the generator, prompting for the first input.