/*
 * This JavaScript program is designed to solve a specific graph-related problem.
 * It takes input representing a graph and a series of queries,
 * then calculates and outputs the results for each query.
 * The core logic involves building an adjacency list, sorting it,
 * and performing a range query using a modified binary search (upper_bound).
 */
function   Main ( s )
{
    // The input 's' is a multi-line string.
    // We first split it into an array of individual lines.
    s = s . split ( "\n" ) ;

    // The first line of input contains three space-separated integers:
    // N (number of nodes), M (number of edges), and Q (number of queries).
    // We parse these values.
    var   n = s[0] . split ( " " ) . map ( a => +a ) ;

    // Extract M and Q from the parsed array.
    // N is then reassigned to its actual value.
    var   m = n[1] ,   q = n[2] ;
    n = n[0] ; // N represents the total number of nodes in the graph.

    // Initialize an adjacency list 'a' for the graph.
    // Since nodes are typically 1-indexed in competitive programming,
    // we create an array of size n+1 to accommodate this.
    // Each element is initialized as an empty array to store neighbors.
    var   a = Array ( n + 1 ) . fill ( 0 ) . map ( a => [] ) ;

    // Loop through the next 'm' lines of input, which describe the edges.
    for ( var i = 0 ; i < m ; i ++ )
    {
        // Each edge line contains two space-separated integers:
        // l[0] (source node) and l[1] (destination node).
        var   l = s[ i + 1 ] . split ( " " ) . map ( a => +a ) ;

        // Add the destination node to the source node's adjacency list.
        // This builds an directed graph representation.
        a[l[0]] . push ( l[1] ) ;
    }

    // After building the adjacency lists, sort each list.
    // Sorting is crucial for the efficient operation of the 'upper_bound' function,
    // which relies on binary search.
    for ( i = 1 ; i <= n ; i ++ ) {
        a[i] . sort ( ( a , b ) => a - b ) ; // Sorts numbers in ascending order.
    }

    // Initialize an array to store the results of each query.
    var   ans = [ ] ;

    // Process each of the 'q' queries.
    for ( i = 0 ; i < q ; i ++ )
    {
        // Each query line contains two space-separated integers:
        // p[0] (start node of the query range) and p[1] (end node of the query range).
        var   p = s[ i + m + 1 ] . split ( " " ) . map ( a => +a ) ;

        // 't' is a temporary variable to accumulate the sum for the current query.
        var   t = 0 ;

        // Iterate through all nodes 'j' within the query range [p[0], p[1]].
        for ( j = p[0] ; j <= p[1] ; j ++ )
        {
            // For each node 'j', use the 'upper_bound' function on its adjacency list 'a[j]'.
            // The upper_bound function counts how many neighbors of 'j'
            // are less than or equal to 'p[1]' (the end of the query range).
            // This effectively counts neighbors that fall within the query's upper limit.
            t += upper_bound ( a[j] , 0 , a[j] . length , p[1] ) ;
        }

        // Store the calculated total 't' as the result for the current query.
        ans[i] = t ;
    }

    // Finally, print all the query results, each on a new line.
    console . log ( ans . join ( "\n" ) ) ;
}

/*
 * This helper function implements a binary search variant similar to 'upper_bound'.
 * It finds the count of elements in a sorted array 'd' that are less than or equal to 'e'.
 *
 * Parameters:
 *   d: The sorted array (e.g., an adjacency list).
 *   a: The starting index for the search range (inclusive).
 *   b: The ending index for the search range (exclusive).
 *   e: The target value to compare against.
 *
 * Returns: The count of elements in d[a...b-1] that are <= e.
 */
function   upper_bound ( d , a , b , e )
{
    for ( var c ; 1 < b - a ; ) { // Loop continues as long as the search range has at least two elements.
        c = 0 | ( a + b ) / 2 ; // Calculate the middle index using bitwise OR for integer truncation.

        if ( d[c] <= e ) { // If the element at 'c' is less than or equal to 'e',
            a = c ;        // then 'c' and potentially elements to its right could be part of the count.
        } else {           // Otherwise, the element at 'c' is greater than 'e',
            b = c ;        // so we need to search in the left half.
        }
    }
    // After the loop, 'a' and 'b' will be adjacent indices (b = a + 1 or b = a).
    // The final check determines if the element at 'a' itself satisfies the condition.
    return d[a] <= e ? b : a ;
}

// The program execution starts by reading input from standard input.
// 'require("fs").readFileSync("/dev/stdin","utf8")' is a common way
// to read all input in competitive programming environments.
// The read content is then passed to the Main function.
Main ( require ( "fs" ) . readFileSync ( "/dev/stdin" , "utf8" ) ) ;