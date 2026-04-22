var n , g ; // Global variables: n for node count, g for adjacency list.


/*
 * This is the main function where the program execution begins.
 * It processes multiple test cases, each involving graph construction and pathfinding queries.
 */
function main ( )
{
    // The program runs in an infinite loop, processing test cases
    // until a specific termination condition is met by the input.
    while ( 1 )
    {
        // Read the number of edges (m) and the number of nodes (n) for the current graph.
        // The 'scan()' helper function reads numeric input.
        var m = scan ( ) ;
        n = scan ( ) ;

        // Check for the termination condition: if both 'n' and 'm' are zero,
        // it signifies the end of input and the program should exit.
        if ( n == 0 && m == 0 )
        {
            break ; // Exit the 'while(1)' loop.
        }


        // Initialize the global adjacency list 'g'.
        // 'g' will be an array of arrays, where g[i] stores edges originating from node 'i'.
        g = [ ] ;

        // Populate 'g' with empty arrays for each node.
        // This ensures every node has an initialized list for its outgoing edges.
        rep ( n , function ( i )
        {
            g [ i ] = [ ] ; // Assign an empty array to each node 'i'.
        } ) ;


        // Read and process 'm' edges to build the graph.
        // Each edge connects two nodes and has two associated weights.
        rep ( m , function ( )
        {
            // Read the start node (a), end node (b), and two weights (c, d) for an edge.
            // Input nodes are 1-indexed, so we subtract 1 to convert them to 0-indexed.
            var a = scan ( ) - 1 ;
            var b = scan ( ) - 1 ;
            var c = scan ( ) ;
            var d = scan ( ) ;

            // Add the edge to the adjacency list.
            // For an undirected graph, add the edge in both directions.
            // Each element in the adjacency list is an array: [weight_c, weight_d, destination_node].
            g [ a ] . push ( [ c , d , b ] ) ;
            g [ b ] . push ( [ c , d , a ] ) ;
        } ) ;


        // Read the number of queries (q) for the current graph.
        // Each query asks for the shortest path between two nodes.
        var q = scan ( ) ;

        // Process each of the 'q' queries.
        rep ( q , function ( )
        {
            // Read the start node, goal node, and the type of weight to use for the query.
            // Nodes are converted from 1-indexed to 0-indexed.
            var start = scan ( ) - 1 ;
            var goal = scan ( ) - 1 ;
            var type = scan ( ) ; // 'type' determines which weight (c or d) to consider.

            // Call Dijkstra's algorithm to find the shortest path and print the result.
            print ( dijkstra ( start , goal , type ) ) ;
        } ) ;
    }
}


/*
 * Implements Dijkstra's algorithm to find the shortest path from a starting node
 * to a goal node in the graph 'g', considering a specific type of edge weight.
 *
 * @param {number} start - The 0-indexed starting node.
 * @param {number} goal  - The 0-indexed target node.
 * @param {number} type  - The index indicating which weight to use from the edge array (0 for 'c', 1 for 'd').
 * @returns {number} The minimum distance from 'start' to 'goal' using the specified weight type.
 */
function dijkstra ( start , goal , type )
{
    // A min-priority heap data structure to efficiently retrieve the node
    // with the smallest current distance. Heap elements are [distance, node_index].
    var heap = [ ] ;


    /*
     * Inserts an element 'x' into the min-priority heap, maintaining the heap property.
     * Elements are compared based on their first component (distance).
     * @param {Array<number>} x - The element to push, typically [distance, node_index].
     */
    function heap_push ( x )
    {
        var i = heap . length ; // Start insertion at the end of the heap array.

        // Bubble up the new element 'x' by comparing it with its parent.
        // Continue swapping until 'x' is at the root or its parent is smaller than 'x'.
        while ( i > 0 )
        {
            var p = ( i - 1 ) >> 1 ; // Calculate the parent index using bitwise right shift for efficiency.

            // If the parent element is less than or equal to 'x', 'x' is in its correct position.
            if ( heap [ p ] <= x )
            {
                break ;
            }

            // Move the parent element down to make space for 'x'.
            heap [ i ] = heap [ p ] ;
            i = p ; // Update current index to parent's position.
        }
        heap [ i ] = x ; // Place 'x' at its final, sorted position.
    }


    /*
     * Removes and returns the minimum element (root) from the min-priority heap.
     * The heap property is restored after removal.
     * @returns {Array<number>} The smallest element from the heap.
     */
    function heap_pop ( )
    {
        var result = heap [ 0 ] ; // The minimum element is always at the root (index 0).

        // Take the last element in the heap and prepare to use it to rebalance.
        var x = heap [ heap . length - 1 ] ;
        var len = -- heap . length ; // Decrease the heap size and store the new length.

        // If the heap becomes empty after popping the only element, return the result immediately.
        if ( ! len )
        {
            return result ;
        }

        var i = 0 ; // Start rebalancing from the root (index 0).

        // Bubble down 'x' by comparing it with its children.
        // Continue swapping with the smaller child until 'x' is in its correct position.
        while ( i * 2 + 1 < len )
        {
            var a = i * 2 + 1 ; // Index of the left child.
            var b = i * 2 + 2 ; // Index of the right child.

            // If the right child exists and is smaller than the left child, choose the right child.
            if ( b < len && heap [ b ] < heap [ a ] )
            {
                a = b ; // Update 'a' to be the index of the smaller child.
            }

            // If the smaller child is greater than or equal to 'x', 'x' is in its correct position.
            if ( heap [ a ] >= x )
            {
                break ;
            }

            // Move the smaller child up to the current position.
            heap [ i ] = heap [ a ] ;
            i = a ; // Update current index to the child's position.
        }
        heap [ i ] = x ; // Place 'x' at its final, sorted position.

        return result ; // Return the original minimum element.
    }


    /*
     * Checks if the heap is currently empty.
     * @returns {boolean} True if the heap contains no elements, false otherwise.
     */
    function heap_empty ( )
    {
        return ! heap . length ; // Returns true if heap.length is 0, false otherwise.
    }


    // Initialize a distance array 'd'.
    // 'd[i]' will store the shortest distance found so far from 'start' to node 'i'.
    // All distances are initially set to Infinity.
    var d = [ ] ;
    rep ( n , function ( i )
    {
        d [ i ] = Infinity ;
    } ) ;

    // The distance from the start node to itself is 0.
    d [ start ] = 0 ;

    // Push the start node into the priority heap with its initial distance.
    heap_push ( [ 0 , start ] ) ;

    // The main loop of Dijkstra's algorithm.
    // Continues as long as there are unvisited nodes in the priority queue.
    while ( ! heap_empty ( ) )
    {
        // Extract the node 'v' with the smallest distance from the heap.
        // 'v' is an array: [current_distance, node_index].
        var v = heap_pop ( ) ;

        // If the extracted distance is greater than the already recorded shortest distance
        // to this node, it means we found a shorter path previously, so skip this outdated entry.
        if ( v [ 0 ] > d [ v [ 1 ] ] )
        {
            continue ;
        }

        // Iterate over all neighbors (edges) of the current node 'v[1]'.
        rep ( g [ v [ 1 ] ] . length , function ( i )
        {
            // 'edge' is an array: [weight_c, weight_d, destination_node].
            var edge = g [ v [ 1 ] ] [ i ] ;

            // Calculate the potential new distance to the neighbor 'edge[2]'.
            // The specific weight to use (c or d) is determined by the 'type' parameter.
            var new_dist = d [ v [ 1 ] ] + edge [ type ] ;

            // If this new path to 'edge[2]' is shorter than the previously recorded distance,
            // update the distance and push the neighbor onto the heap.
            if ( d [ edge [ 2 ] ] > new_dist )
            {
                d [ edge [ 2 ] ] = new_dist ; // Update the shortest distance to 'edge[2]'.
                heap_push ( [ d [ edge [ 2 ] ] , edge [ 2 ] ] ) ; // Add or update in the heap.
            }
        } ) ;
    }

    // After the algorithm completes, 'd[goal]' holds the shortest distance to the goal node.
    return d [ goal ] ;
}


/*
 * A flexible utility function for repetitive tasks (loops).
 * It can be called in two ways:
 * 1. rep(count, callback): Loops 'count' times, passing 0 to count-1 to the callback.
 * 2. rep(start, end, callback): Loops from 'start' up to (but not including) 'end',
 *                               passing the current index to the callback.
 *
 * @param {number} a - In single-argument mode, this is the total count.
 *                     In triple-argument mode, this is the starting index.
 * @param {function|number} b - In single-argument mode, this is the callback function.
 *                              In triple-argument mode, this is the ending index.
 * @param {function} [c] - The callback function for triple-argument mode.
 */
function rep ( a , b , c )
{
    // Check if the function was called with two arguments (count, callback).
    if ( c == null )
    {
        c = b ; // 'b' is actually the callback function.
        b = a ; // 'a' is the total count, which becomes the loop's upper bound.
        a = 0 ; // The loop starts from 0 by default.
    }

    // Execute the loop.
    for ( var i = a ; i < b ; ++ i )
    {
        c ( i ) ; // Call the provided callback function with the current loop index.
    }
}


// Resume the standard input stream to listen for data.
process . stdin . resume ( ) ;

// Set the encoding for the standard input stream to UTF-8.
process . stdin . setEncoding ( 'utf8' ) ;


// A buffer to accumulate all incoming standard input data.
var input = '' ;
// An index to keep track of the current position when reading from the 'input' buffer.
var input_index = 0 ;


/*
 * A helper function to read the next token from the pre-processed input buffer.
 * It can read either numbers or strings based on the 'type' parameter.
 *
 * @param {string} [type] - Optional. If 'string', returns the value as a string.
 *                          Otherwise, it attempts to convert the value to a number.
 * @returns {number|string} The next value from the input stream.
 */
function scan ( type )
{
    // If the requested type is 'string', return the token as is.
    if ( type === 'string' )
    {
        return input [ input_index ++ ] ;
    }
    // Otherwise, convert the token to a number using the unary plus operator.
    else
    {
        return + input [ input_index ++ ] ;
    }
}


/*
 * A helper function to print a value to the standard output.
 * It leverages 'console.log', which automatically appends a newline character.
 *
 * @param {*} val - The value to be displayed on the console.
 */
function print ( val )
{
    console . log ( val ) ;
}


// Event listener for the 'data' event on the standard input stream.
// Each incoming chunk of data is appended to the 'input' buffer.
process . stdin . on ( 'data' , function ( chunk )
{
    input += chunk ;
} ) ;


// Event listener for the 'end' event on the standard input stream.
// Once all input has been received, this callback is executed.
process . stdin . on ( 'end' , function ( )
{
    // Split the accumulated input string into an array of tokens,
    // using any sequence of whitespace characters as delimiters.
    input = input . split ( /\s+/ ) ;

    // After processing the input, initiate the main program logic.
    main ( ) ;
} ) ;