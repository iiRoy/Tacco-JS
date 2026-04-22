'use strict'; // Enable strict mode for cleaner code and error prevention

// This is the PriorityQueue constructor function.
// It initializes a new priority queue with an empty list and a comparison function.
function PriorityQueue( comp )
{
    // The internal array that stores the elements of the priority queue.
    this.list = [];
    // The comparison function used to order elements in the queue.
    // It should return a negative value if a < b, zero if a == b, and a positive value if a > b.
    this.comp = comp;
}


// Adds an element to the priority queue while maintaining the heap property.
PriorityQueue.prototype.enq = function ( x )
{
    // Add the new element to the end of the list (the last leaf in the heap).
    this.list.push( x );

    // Get the index of the newly added element.
    var i = this.list.length - 1;


    // Bubble up the new element to its correct position in the heap.
    // Continue as long as the element is not at the root and is smaller than its parent.
    while ( i > 0 )
    {
        // Calculate the parent index. For a 0-indexed array, parent of node i is floor((i-1)/2).
        var p = Math.floor( ( i - 1 ) / 2 );

        // If the parent is already less than or equal to the new element,
        // the heap property is satisfied, so we can stop.
        if ( this.comp( this.list[p], x ) <= 0 )
            break;

        // If the parent is greater, swap the current element with its parent.
        this.list[i] = this.list[p];
        // Move up to the parent's position.
        i = p;
    }

    // Place the new element in its final sorted position.
    // This check ensures we don't try to access an empty list.
    if ( this.list.length > 0 )
        this.list[i] = x;
};


// Removes and returns the smallest element (root) from the priority queue.
PriorityQueue.prototype.deq = function ()
{
    // Get the minimum element (which is always at the root of a min-heap).
    var min = this.peek();
    // Get the last element in the list. This will temporarily replace the root.
    var root = this.list[ this.list.length - 1 ];
    // Remove the last element from the list.
    this.list.splice( this.list.length - 1, 1 );

    // Start the "bubble down" process from the root (index 0).
    var i = 0;


    // Continue as long as the current node has at least one child.
    while ( i * 2 + 1 < this.list.length )
    {
        // Calculate indices of left and right children.
        var a = i * 2 + 1,
            b = i * 2 + 2,
            // Determine the index of the smaller child.
            // If right child exists and is smaller than left child, choose right; otherwise, choose left.
            c = b < this.list.length && comp( this.list[b], this.list[a] ) < 0 ? b : a;

        // If the smaller child is greater than or equal to the element being moved down (root),
        // the heap property is restored, so we can stop.
        if ( this.comp( this.list[c], root ) >= 0 )
            break;

        // Swap the current element with its smaller child.
        this.list[i] = this.list[c];
        // Move down to the smaller child's position.
        i = c;
    }

    // Place the original last element (now `root`) into its final sorted position.
    // This check ensures we don't try to access an empty list.
    if ( this.list.length > 0 )
        this.list[i] = root;

    // Return the minimum element that was removed.
    return min;
};


// Returns the smallest element in the priority queue without removing it.
PriorityQueue.prototype.peek = function ()
{
    // If the queue is empty, return undefined. Otherwise, return the first element.
    return this.list.length == 0 ? undefined : this.list[0];
};


// Returns the number of elements in the priority queue.
PriorityQueue.prototype.size = function ()
{
    return this.list.length;
};


// Checks if the priority queue is empty.
PriorityQueue.prototype.isEmpty = function ()
{
    // The queue is empty if its size is 0.
    return this.size() == 0;
};


// --- Global Constants and Variables for Dijkstra's Algorithm ---

const MAX_V = 100000; // Maximum number of vertices allowed.
const INF = Number.POSITIVE_INFINITY / 4; // A large value representing infinity for distances.
var V, E, r; // V: number of vertices, E: number of edges, r: start node for Dijkstra.
var G;       // Adjacency list representation of the graph.
var d;       // Array to store shortest distances from the source node.


// Implementation of Dijkstra's shortest path algorithm.
// s: The starting node for finding shortest paths.
function dijkstra( s )
{
    // Initialize a priority queue to store {dist, v} pairs, ordered by dist.
    // The comparison function ensures that elements with smaller 'dist' are prioritized.
    // If distances are equal, elements with smaller 'v' (vertex ID) are prioritized.
    var pque = new PriorityQueue( function ( a, b )
    {
        if ( a.dist != b.dist )
            return a.dist - b.dist;

        return a.v - b.v;
    } );
    // Set the distance to the source node itself as 0.
    d[s] = 0;
    // Add the source node to the priority queue with distance 0.
    pque.enq( { dist: 0, v: s } );

    // Continue as long as there are nodes in the priority queue to process.
    while ( !pque.isEmpty() )
    {
        // Extract the node with the smallest distance from the priority queue.
        var p = pque.deq();

        // If we have already found a shorter path to this node, skip it.
        // This handles outdated entries in the priority queue.
        if ( d[p.v] < p.dist )
            continue;

        // Iterate through all neighbors (edges) of the current node 'p.v'.
        for ( var i = 0; i < G[p.v].length; ++i )
        {
            var e = G[p.v][i]; // 'e' represents an edge object: { to: target_node, cost: edge_weight }.

            // If a shorter path to the neighbor 'e.to' is found through 'p.v'.
            if ( d[e.to] > d[p.v] + e.cost )
            {
                // Update the shortest distance to 'e.to'.
                d[e.to] = d[p.v] + e.cost;
                // Add the neighbor to the priority queue with its new, shorter distance.
                pque.enq( { dist: d[e.to], v: e.to } );
            }
        }
    }
}


// Main execution block: an Immediately Invoked Function Expression (IIFE).
// It reads input, processes it, and then runs Dijkstra's algorithm.
( function main( input )
{
    // Trim whitespace from input and split it into an array of lines.
    var lines = input.trim().split( '\n' );
    // Flag to indicate if it's the first line of input (contains V, E, r).
    var fst = true;

    // Loop through each line of the input.
    for ( var j = 0; j < lines.length; ++j )
    {
        // Split the line by spaces and convert parts to numbers.
        var words = lines[j].split( ' ' ).map( Number );

        /*
        // This block is commented out in the original code, so it remains commented.
        // It would typically parse the graph parameters and edges.
        if( fst )
        {
          V = words[0]; // Number of vertices.
          E = words[1]; // Number of edges.
          r = words[2]; // Starting node for Dijkstra.

          G = []; // Initialize adjacency list.
          for( var i = 0; i < V; ++i )
            G[i] = []; // Each vertex gets an empty list of neighbors.

          d = (new Array(V)).fill(INF); // Initialize distances to infinity.
        }
        else
          // Add an edge from words[0] to words[1] with cost words[2].
          G[words[0]].push( { to: words[1], cost: words[2] } );
        */

        // After processing the first line, set the flag to false.
        fst = false;
    }

    // Call Dijkstra's algorithm with the starting node 'r'.
    // This line is commented out in the original code.
    // dijkstra( r );


    // Iterate through the calculated distances and print them.
    // If a distance is INF, print "INF"; otherwise, print the distance.
    // This line is commented out in the original code.
    // d.forEach( function(v) { console.log( v == INF ? "INF" : v ) } );

// Read input from standard input (e.g., a file or piped data).
} )( require( 'fs' ).readFileSync( '/dev/stdin', 'utf8' ) );