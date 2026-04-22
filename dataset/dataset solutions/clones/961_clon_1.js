var h = [ ] , hs = 0 ;
// Initialize the heap array and its size
h[ 0 ] = new Array( 2 ) ;
/* Set dummy values for the first element,
   as index 0 is typically unused in 1-based heaps */
h[ 0 ][ 0 ] = -1 ;
h[ 0 ][ 1 ] = -1 ;


function insert( key )
{
    // Insert the new key at the end of the heap
    h [ ++hs ] = key ;


    var i = hs ; // Current index of the new element

    // Bubble up the new element to maintain heap property
    while ( h [ i ] [ 1 ] < h [ Math.floor ( i / 2 ) ] [ 1 ] )
    {
        var ex = h [ i ] ; // Store current element
        h [ i ] = h [ Math.floor ( i / 2 ) ] ; // Move parent down
        h [ Math.floor ( i / 2 ) ] = ex ; // Place current element in parent's spot
        i = Math.floor ( i / 2 ) ; // Update current index
    }
}


function extract( )
{
    // If heap is empty, nothing to extract
    if ( hs <= 0 )
        return ;

    var ret = h [ 1 ] ; // The minimum element is at the root

    // Move the last element to the root and decrease heap size
    h [ 1 ] = h [ hs -- ] ;

    i = 1 ; // Start from the root
    // Bubble down the new root to maintain heap property
    while ( ( i * 2 <= hs && h [ i ] [ 1 ] > h [ i * 2 ] [ 1 ] ) || ( i * 2 + 1 <= hs && h [ i ] [ 1 ] > h [ i * 2 + 1 ] [ 1 ] ) )
    {
        var l = i * 2 ; // Left child index
        var r = i * 2 ; // Right child index, initially same as left

        // If right child exists, update its index
        if ( i * 2 + 1 <= hs )
            r ++ ;

        // Find the child with the smaller value
        var m = h [ l ] [ 1 ] <= h [ r ] [ 1 ] ? l : r ;

        var ex = h [ i ] ; // Store current element
        h [ i ] = h [ m ] ; // Move smaller child up
        h [ m ] = ex ; // Place current element in child's spot
        i = m ; // Update current index
    }
    return ret ; // Return the extracted minimum element
}


function Main ( input )
{
    // Process input string into an array of lines
    input = input . split ( "\n" ) ;
    // Parse the number of nodes (n) from the first line
    var n = parseInt ( input [ 0 ] , 10 ) ;

    // Initialize an adjacency list representation for the graph
    var graph = new Array ( n ) ;

    // Loop through each node to build its adjacency list
    for ( var i = 0 ; i < n ; i ++ )
    {
        // Split the current line into parts (node, degree, neighbors, weights)
        input [ i + 1 ] = input [ i + 1 ] . split ( " " ) ;
        var u = parseInt ( input [ i + 1 ] [ 0 ] , 10 ) ; // Current node index
        var k = parseInt ( input [ i + 1 ] [ 1 ] , 10 ) ; // Degree of the current node

        // Initialize the adjacency list for node 'u'
        graph [ u ] = new Array ( k ) ;

        // Prepare nested arrays for each neighbor
        for ( var j = 0 ; j < k ; j ++ )
            graph [ u ] [ j ] = new Array ( 2 ) ;

        // Populate neighbor and weight information
        for ( var j = 0 ; j < k ; j ++ )
        {
            graph [ u ] [ j ] [ 0 ] = parseInt ( input [ i + 1 ] [ j * 2 + 2 ] , 10 ) ; // Neighbor node
            graph [ u ] [ j ] [ 1 ] = parseInt ( input [ i + 1 ] [ j * 2 + 3 ] , 10 ) ; // Edge weight
        }
    }

    // Dijkstra's algorithm implementation
    var count = 1 ; // Number of visited nodes
    var sum = Array ( n ) ; // Stores minimum distances from source (node 0)

    // Initialize distances to infinity (a large number)
    for ( var i = 0 ; i < n ; i ++ )
        sum [ i ] = 1000000000 ; // Representing infinity

    sum [ 0 ] = 0 ; // Distance to the source node itself is 0

    // Add neighbors of the source node to the priority queue (heap)
    for ( var i = 0 ; i < graph [ 0 ] . length ; i ++ )
    {
        insert ( graph [ 0 ] [ i ] ) ;
    }

    // Main loop of Dijkstra's algorithm
    while ( count < n )
    {
        var aa = extract ( ) ; // Extract the node with the smallest distance

        // If this node has already been finalized with a shorter path, skip
        if ( sum [ aa [ 0 ] ] < 1000000000 )
            continue ;

        sum [ aa [ 0 ] ] = aa [ 1 ] ; // Finalize the shortest distance for this node
        count ++ ; // Increment visited nodes count

        // Explore neighbors of the extracted node
        for ( var i = 0 ; i < graph [ aa [ 0 ] ] . length ; i ++ )
        {
            // Calculate potential new distance to neighbor
            graph [ aa [ 0 ] ] [ i ] [ 1 ] += sum [ aa [ 0 ] ] ;
            insert ( graph [ aa [ 0 ] ] [ i ] ) ; // Add neighbor to priority queue
        }
    }

    // Output the results (node index and its minimum distance)
    for ( var i = 0 ; i < n ; i ++ )
    {
        console . log ( i + " " + sum [ i ] ) ;
    }
}

// Call the main function with input read from standard input
Main ( require ( "fs" ) . readFileSync ( "/dev/stdin" , "utf8" ) ) ;