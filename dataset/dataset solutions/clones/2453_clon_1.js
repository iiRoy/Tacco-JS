"use strict" ; // Enforces stricter parsing and error handling for this script.

// This function dynamically creates a multi-dimensional array.
// The dimensions are provided as subsequent arguments.
// The 'v' parameter specifies the initial value for the deepest level elements.
function xArray( v )
{
	var a = arguments ,  // 'arguments' object holds all parameters passed.
		l = a . length , // Total number of arguments determines array dimensions.
		r = "Array(a[" + --l + "]).fill(0).map(x=>{return " + v + ";})" ; // Constructs the innermost array creation string.

	while ( --l ) // Loop backwards through dimensions to build the nested array structure.
	{
		r = "Array(a[" + l + "]).fill(0).map(x=>" + r + ")" ; // Wraps the previous dimension's string.
	}

	// 'eval' is used here to execute the dynamically generated string,
	// creating the multi-dimensional array at runtime.
	return eval( r ) ;
}


/*
 *  Union-Find (Disjoint Set Union) data structure implementation.
 *  Useful for keeping track of a set of elements partitioned into a number of disjoint (non-overlapping) sets.
 *  Each set has a representative element, its 'root'.
 */
function unionFind( n )
{
	// 'a' array stores parent pointers.
	// A negative value 'a[i]' means 'i' is a root, and -a[i] is the size of its set.
	this.a = Array( n + 1 ) . fill( -1 ) ;
}


// Prototype methods for the unionFind object.
unionFind.prototype = {

	// Finds the root of the set containing element 'i'.
	// Implements path compression for efficiency.
	root: function( i )
	{
		// If 'i' is its own root (value is negative), return 'i'.
		return this . a[ i ] < 0 ? i :
		       // Otherwise, recursively find the root and update 'a[i]' to point directly to it.
		       ( this . a[ i ] = this . root( this . a[ i ] ) ) ;
	},


	// Checks if two elements 'x' and 'y' belong to the same set.
	same: function( x , y )
	{
		// They are in the same set if their roots are identical.
		return this . root( x ) === this . root( y ) ;
	},


	// Unites the sets containing elements 'x' and 'y'.
	// Uses union by size heuristic to maintain a balanced tree structure.
	unite: function( x , y )
	{
		x = this . root( x ) ; // Get the root of x.
		y = this . root( y ) ; // Get the root of y.

		if ( x === y ) // If already in the same set, no union needed.
		{
			return 1 ; // Indicate that they were already united.
		}

		// Attach the smaller tree to the root of the larger tree.
		// The size of a set is stored as the negative value of its root.
		if ( this . a[ y ] <= this . a[ x ] )
		{
			this . a[ y ] += this . a[ x ] ; // Update size of the new root (y).
			this . a[ x ] = y ;               // Make y the parent of x.
		}
		else
		{
			this . a[ x ] += this . a[ y ] ; // Update size of the new root (x).
			this . a[ y ] = x ;               // Make x the parent of y.
		}
	},


	// Returns the size of the set that element 'i' belongs to.
	size: function( i )
	{
		// The size is the negative of the root's value.
		return - this . a[ this . root( i ) ] ;
	},
} ;


// --- Global Simulation Variables ---
var leng = 0 ,       // Remaining 'length' or steps to reach the 'nextV' vertex.
	nextV = 0 ,      // The current target vertex for movement.
	day = 0 ,        // The current day in the simulation.
	takeday = -1 ;   // The last day new items were processed for pickup.

var score = 0 ;      // Total score accumulated during the simulation.

const INF = 1e9 ;    // A constant representing a very large number (infinity) for distance calculations.

var V ;              // Number of vertices in the graph (200-400 range).
var E ;              // Number of edges in the graph (1.5V-2V range).

var dist ;           // 2D array: 'dist[i][j]' stores the shortest path distance between vertex 'i' and 'j'.
var directDist ;     // 2D array: 'directDist[i][j]' stores the direct edge weight if 'i' and 'j' are connected.
var e ;              // Adjacency list: 'e[v]' contains an array of vertices directly connected to 'v'.
var f ;              // A variable read from input; its specific use isn't clear from this snippet alone.

var tmax ;           // Maximum number of days for the simulation (e.g., 10000).
var tmax2 ;          // 'tmax' squared, used in score calculation.

const has = new Set() ,   // Stores vertices that currently have items needing delivery.
	  ready = new Set() ; // Stores vertices that have new items available for pickup on the current day.

var round = [] ;          // The planned delivery route (sequence of vertices to visit).
var orderTime = xArray( "[]" , V ) ; // Stores the day an item for a vertex was picked up.

const item = [] ;         // A buffer to hold parsed input data for items.
const out = [] ;          // Stores the sequence of output vertices for each day.

var cx = 0 ;              // Current index for reading from the 'item' buffer.

// Utility function to retrieve the next value from the 'item' buffer and advance the pointer.
function next()
{
	return + item[ cx++ ] ; // Converts the item to a number and increments 'cx'.
}


/**
 *  Computes a Minimum Spanning Tree (MST) for a given set of destination vertices.
 *  The depot (vertex 0) is always included in the set for MST calculation.
 *  @param {Set<number>} set - A set of vertex indices representing delivery destinations.
 *  @returns {Array<Array<number>>} An array of edges [u, v, weight] forming the MST.
 */
function kruskal( set )
{
	// Convert the set to an array and include the depot (vertex 0).
	var vs = Array . from( set ) . concat( 0 ) ;
	var n = vs . length ;  // Number of unique vertices involved in this MST.
	var es = [] ;          // Array to store all possible edges between these vertices.

	// Generate all pairwise edges between vertices in 'vs'.
	for ( var i = 0 ; i < n ; i++ )
	{
		for ( var j = i + 1 ; j < n ; j++ )
		{
			// Add edge [vertex1, vertex2, distance_between_them].
			es . push( [ vs[ i ] , vs[ j ] , dist[ vs[ i ] ][ vs[ j ] ] ] ) ;
		}
	}

	// Sort edges by weight (distance) in ascending order.
	es . sort( ( a , b ) => a[ 2 ] - b[ 2 ] ) ;

	var uf = new unionFind( V ) ; // Initialize Union-Find structure for all graph vertices.
	var res = [] ;                // This will store the edges that constitute the MST.

	// Kruskal's algorithm main loop.
	// Continues until all 'n' vertices (depot + destinations) are connected into a single component.
	for ( var i = 0 ; uf . size( 0 ) !== n ; i++ )
	{
		// Attempt to unite the sets of the current edge's vertices.
		// If 'unite' returns 1, they were already in the same set (adding this edge would form a cycle).
		if ( uf . unite( es[ i ][ 0 ] , es[ i ][ 1 ] ) )
		{
			continue ; // Skip this edge.
		}
		res . push( [ es[ i ][ 0 ] , es[ i ][ 1 ] , es[ i ][ 2 ] ] ) ; // Add the edge to the MST.
	}

	return res ; // Return the list of MST edges.
}


/**
 *  Determines the next vertex the vehicle should move towards.
 *  This involves checking item status and current route.
 *  @returns {number} The ID of the next vertex to move to, or -2 if no movement is needed.
 */
function deliver()
{
	// Scenario 1: No items currently held.
	if ( has . size === 0 )
	{
		if ( nextV === 0 ) // If at depot and no items, do nothing.
		{
			return -2 ;
		}
		return minPath( 0 ) ; // Go back to the depot.
	}

	// Scenario 2: Vehicle is at the next scheduled stop in the 'round' route.
	if ( nextV === round[ round . length - 1 ] )
	{
		round . pop() ; // Remove current vertex from the route as it's been reached.

		// Clean up the route: remove any further vertices that have already been 'ready' (processed).
		while ( round . length && ready . has( round[ round . length - 1 ] ) )
		{
			round . pop() ;
		}

		if ( round . length === 0 ) // If route is now empty, head to depot.
		{
			return minPath( 0 ) ;
		}
	}

	// Scenario 3: Continue along the current route to the next destination.
	return minPath( round[ round . length - 1 ] ) ;
}


/**
 *  Finds the next immediate step on the shortest path from 'nextV' to 'to'.
 *  Also updates 'leng' to reflect the distance to the newly chosen 'nextV'.
 *  @param {number} to - The ultimate destination vertex.
 *  @returns {number} The ID of the immediate next vertex to move to, or -2 if no path found (error).
 */
function minPath( to )
{
	if ( to === nextV ) // Already at the destination.
	{
		return -2 ;
	}

	// Iterate through direct neighbors of 'nextV'.
	for ( var v of e[ nextV ] )
	{
		// Check if 'v' lies on the shortest path from 'nextV' to 'to'.
		if ( dist[ nextV ][ to ] === directDist[ nextV ][ v ] + dist[ v ][ to ] )
		{
			leng = directDist[ nextV ][ v ] - 1 ; // Set remaining distance for this segment.
			return nextV = v ;                     // Update 'nextV' to this intermediate vertex and return it.
		}
	}

	// This case implies 'to' is not reachable, or an error in pathfinding logic.
	return -2 ;
}


/**
 *  Performs one step of the simulation logic for the vehicle.
 *  Handles movement, item pickup, and item delivery.
 *  @returns {number} The ID of the vertex the vehicle is currently at or moving towards.
 */
function solve()
{
	// If the vehicle is currently moving along a path segment...
	if ( leng )
	{
		leng-- ;         // Decrement remaining distance.
		return nextV ;   // Continue moving towards the current 'nextV'.
	}

	// Vehicle has arrived at a vertex (leng is 0).
	if ( nextV === 0 ) // If at the depot...
	{
		take() ;       // Process new item pickups.
	}
	else               // Otherwise, at a delivery destination...
	{
		give() ;       // Process item deliveries.
	}

	// After processing pickup/delivery, determine the next move.
	return deliver() ;
}


/**
 *  Handles the process of picking up new items at the depot (vertex 0).
 *  Updates 'has' set, 'orderTime', and generates a new delivery route 'round'.
 */
function take()
{
	ready . clear() ; // Clear the set of items that were ready for pickup (they are now 'has').
	round = [] ;      // Reset the current delivery route.

	// Process all new items that have arrived since the last 'take' operation.
	while ( takeday < day )
	{
		takeday++ ;        // Advance the last pickup day counter.
		var n = next() ;   // Number of new items for this specific 'takeday'.
		for ( var i = 0 ; i < n ; i++ )
		{
			var id = next() - 1 , // Item ID (not used in this logic).
				d = next() - 1 ;  // Destination vertex ID for the item.

			has . add( d ) ;           // Add destination 'd' to the set of places needing delivery.
			orderTime[ d ] . push( takeday ) ; // Record the day this item was picked up for destination 'd'.
		}
	}

	if ( has . size === 0 ) // If no items to deliver, simply return.
	{
		return ;
	}

	// Compute the MST for all current destinations ('has' set) including the depot (0).
	var tree = kruskal( has ) ;

	// Construct an adjacency list 'road' from the MST edges.
	var road = xArray( "[]" , V ) ;
	for ( var i = 0 ; i < tree . length ; i++ )
	{
		var a = tree[ i ][ 0 ] , // First vertex of an MST edge.
			b = tree[ i ][ 1 ] ; // Second vertex of an MST edge.
		road[ a ] . push( b ) ; // Add edge (a, b).
		road[ b ] . push( a ) ; // Add edge (b, a).
	}

	// Perform a Depth First Search on the MST to generate a traversal route.
	dfs( 0 , -1 , road ) ; // Start DFS from the depot (0), with no parent (-1).
	round . reverse() ;    // Reverse the route to get a path from depot, through nodes, and back.
	round . pop() ;        // Remove the duplicate depot entry at the end of the reversed route.
}


/**
 *  Performs a Depth First Search on the constructed MST ('road') to build the 'round' delivery route.
 *  @param {number} v - The current vertex in the DFS.
 *  @param {number} p - The parent vertex of 'v' (to avoid going back immediately).
 *  @param {Array<Array<number>>} road - Adjacency list representation of the MST.
 */
function dfs( v , p , road )
{
	round . push( v ) ; // Add the current vertex to the route.
	// Explore all neighbors of 'v'.
	for ( var i of road[ v ] )
	{
		if ( i === p ) // Skip the parent vertex to avoid infinite loops and backtracking.
		{
			continue ;
		}
		dfs( i , v , road ) ; // Recursively call DFS on the child vertex.
	}
}


/**
 *  Handles the process of delivering items at the current vertex ('nextV').
 *  Updates the 'has' set and calculates the score for delivered items.
 */
function give()
{
	has . delete( nextV ) ; // Remove 'nextV' from the set of vertices that need deliveries.

	// Calculate and add score for all items delivered at 'nextV'.
	while ( orderTime[ nextV ] . length )
	{
		var t = day - orderTime[ nextV ] . pop() ; // Time taken for this specific item delivery.
		score += tmax2 - t * t ;                   // Update total score using the given formula.
	}
}


// Initialize readline interface for input/output operations.
const rl = require( "readline" ) . createInterface( process . stdin , process . stdout ) ;

// This is an asynchronous generator function that controls the entire simulation flow.
// It uses 'yield gets()' to pause execution and wait for input lines.
const g = ( function*()
{
	// Helper function to read a single line from standard input.
	const gets = () => rl . once( "line" , s => g . next( s ) ) ;

	// --- Initial Input Reading and Graph Setup ---

	var yi = yield gets() ; // Read the first line: "V E".
	yi = yi . split( " " ) ;
	E = +yi[ 1 ] , V = +yi[ 0 ] ; // Parse E (edges) and V (vertices).

	// Initialize distance matrices and adjacency list based on V.
	dist = xArray( INF , V , V ) ;
	directDist = xArray( INF , V , V ) ;
	e = xArray( "[]" , V ) ;

	// Set self-distances to 0.
	for ( var i = 0 ; i < V ; i++ )
	{
		dist[ i ][ i ] = 0 ;
	}

	// Read edge information and populate graph structures.
	for ( var i = 0 ; i < E ; i++ )
	{
		var t = ( yield gets() ) . split( " " ) ; // Read edge: "v1 v2 d".
		var v1 = t[ 0 ] - 1 ,
			v2 = t[ 1 ] - 1 ,
			d = +t[ 2 ] ;
		// Update direct and shortest path distances for this edge.
		dist[ v1 ][ v2 ] = dist[ v2 ][ v1 ] = directDist[ v1 ][ v2 ] = directDist[ v2 ][ v1 ] = d ;
		// Add to adjacency list.
		e[ v1 ] . push( v2 ) ;
		e[ v2 ] . push( v1 ) ;
	}

	// --- Floyd-Warshall Algorithm for All-Pairs Shortest Paths ---
	// Computes shortest paths between all pairs of vertices.
	for ( var k = 0 ; k < V ; k++ )
	{
		for ( var i = 0 ; i < V ; i++ )
		{
			for ( var j = 0 ; j < V ; j++ )
			{
				// If path through intermediate vertex 'k' is shorter than current 'dist[i][j]', update.
				if ( dist[ i ][ k ] + dist[ k ][ j ] < dist[ i ][ j ] )
				{
					dist[ i ][ j ] = dist[ i ][ k ] + dist[ k ][ j ] ;
				}
			}
		}
	}

	f = ( yield gets() ) . split( " " ) . map( a => +a ) ; // Read an array 'f' (purpose unknown without more context).

	tmax = +( yield gets() ) ; // Read the maximum simulation time (total days).
	tmax2 = tmax * tmax ;      // Pre-calculate tmax squared for score.

	orderTime = xArray( "[]" , V ) ; // Re-initialize 'orderTime' (redundant but harmless).

	// --- Main Simulation Loop ---
	// Iterates for each day up to tmax.
	for ( ; day < tmax ; day++ )
	{
		var t = +( yield gets() ) ; // Read number of new items arriving today.
		item . push( t ) ;           // Add this count to the item buffer.

		// Read details for each new item.
		for ( var i = 0 ; i < t ; i++ )
		{
			var u = ( yield gets() ) . split( " " ) . map( a => +a ) ;
			item . push( u[ 0 ] , u[ 1 ] ) ; // Store item ID and destination vertex.
			ready . add( u[ 1 ] ) ;           // Mark destination as having items ready for pickup.
		}

		t = +( yield gets() ) ; // Read number of items delivered by *this* vehicle on the *previous* day.
		for ( var i = 0 ; i < t ; i++ )
		{
			var u = yield gets() ; // Read the details of delivered items (these are ignored).
		}

		out[ day ] = solve() + 1 ; // Execute one day's simulation logic. Add 1 for 1-based indexing output.
		console . log( out[ day ] ) ; // Output the next vertex to move to.

		t = yield gets() ; // Read the game state feedback (e.g., "OK" or "END").
		if ( t[ 0 ] !== "O" ) // If not "OK" (i.e., "END" or other), terminate simulation.
		{
			return ;
		}

		t = +( yield gets() ) ; // Read number of items delivered by *other* vehicles.
		for ( var i = 0 ; i < t ; i++ )
		{
			var u = yield gets() ; // Read details of other vehicles' deliveries (these are ignored).
		}
	}
} )() ;

g . next() ; // Start the generator function to begin the simulation.