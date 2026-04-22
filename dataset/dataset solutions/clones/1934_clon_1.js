/*
 * This file defines a Scanner class for parsing input and a Main function
 * that processes graph-like data structure based on the parsed input.
 *
 * It's designed for competitive programming contexts where input needs
 * to be quickly consumed.
 */

// Define the Scanner constructor function.
function Scanner ( input )
{
    // A reference to the current instance of the Scanner.
    var self = this ;

    // Initialize the item number counter for tracking position in the parsed input.
    self . itemNo = 0 ;

    // Store the original input string.
    self . orgStr = input ;

    // Process the input string to split it into an array of strings.
    // This immediately-invoked function expression (IIFE) handles the parsing.
    self . splitedStrs = (
        function ( target )
        {
            var result = [ ] ; // Array to hold the split string parts.

            // Replace multiple newlines, spaces, and tabs with a single space.
            var target = target . replace ( /[\n \t]+/g , " " ) ;

            // Split the cleaned target string by spaces.
            var strs = target . split ( " " ) ;

            // Iterate through the split strings and push them into the result array.
            for ( var i = 0 , len = strs . length ; i < len ; i ++ )
            {
                result . push ( strs [ i ] ) ;
            }

            return result ; // Return the array of split strings.
        }
        ( input ) // Pass the original input to the IIFE.
    ) ;

    // Method to get the next string token from the input.
    self . next = function ( )
    {
        var result = self . splitedStrs [ self . itemNo ] ; // Get the current token.
        self . itemNo ++ ; // Advance the pointer to the next token.
        return ( result != null ) ? result : null ; // Return token or null if exhausted.
    } ;

    // Method to get the next integer token from the input.
    self . nextInt = function ( )
    {
        var result = self . splitedStrs [ self . itemNo ] ; // Retrieve the string token.
        self . itemNo ++ ; // Increment the token counter.
        // Attempt to parse as an integer if the token exists.
        return ( result != null ) ? parseInt ( result ) : null ;
    } ;

    // Method to get the next floating-point number (BigDecimal equivalent) from the input.
    self . nextBigDecimal = function ( )
    {
        var result = self . splitedStrs [ self . itemNo ] ; // Fetch the string representation.
        self . itemNo ++ ; // Move to the next item.
        // Convert to a float if the result is not null.
        return ( result != null ) ? parseFloat ( result ) : null ;
    } ;

    // Method to get the next byte (Int8Array) token from the input.
    self . nextByte = function ( )
    {
        var result = self . splitedStrs [ self . itemNo ] ; // Get the string token.
        self . itemNo ++ ; // Advance the internal index.
        // Return a new Int8Array if a token is available, otherwise null.
        return ( result != null ) ? new Int8Array ( result ) : null ;
    } ;
} // End of Scanner function definition.


/*
 * Main function to execute the primary logic of the program.
 * It takes a Scanner instance as an argument to read input.
 */
function Main ( sc )
{

    // Read the number of nodes (N) from the input using the scanner.
    var N = sc . nextInt ( ) ;

    // Initialize an array to store the final answers.
    var anss = [ ] ;

    // Object to store values associated with each node, indexed by node number.
    wrtnObj = { } ;

    // Populate wrtnObj by reading N integer values from the scanner.
    // Node numbers are 1-indexed.
    for ( var i = 0 ; i < N ; i ++ )
    {
        wrtnObj [ i + 1 ] = sc . nextInt ( ) ;
    }

    // Object to represent the graph's adjacency list, storing ordered subtrees.
    // This will hold connections between nodes.
    orderedSubTree = { } ;

    // Read N-1 pairs of integers representing edges in the graph.
    // This builds an undirected graph.
    for ( var i = 0 ; i < N - 1 ; i ++ )
    {
        var n1 = sc . nextInt ( ) ; // First node of an edge.
        var n2 = sc . nextInt ( ) ; // Second node of an edge.

        // Add n2 to n1's adjacency list.
        if ( ! orderedSubTree [ n1 ] ) {
            orderedSubTree [ n1 ] = [ n2 ] ;
        } else {
            orderedSubTree [ n1 ] . push ( n2 ) ;
        }

        // Add n1 to n2's adjacency list (for undirected graph).
        if ( ! orderedSubTree [ n2 ] ) {
            orderedSubTree [ n2 ] = [ n1 ] ;
        } else {
            orderedSubTree [ n2 ] . push ( n1 ) ;
        }
    }

    // Object to store the accumulated "wrtnNos" for each node during traversal.
    wrtnNoLists = { } ;

    // A queue (implemented as an array) to manage nodes to visit next in a BFS-like manner.
    nexts = [ ] ;

    /*
     * Defines a recursive-like function to traverse the tree/graph.
     * It takes the current target node and the node from which it was reached.
     */
    crawlNode = function ( tgtNo , fromNo )
    {
        // Get the accumulated sequence of numbers from the 'fromNo' node.
        // If 'fromNo' hasn't been processed, start with an empty string.
        var wrtnNos = ( wrtnNoLists [ fromNo ] ) ? wrtnNoLists [ fromNo ] : "" ;

        // Append the current node's value (from wrtnObj) to the sequence, followed by a comma.
        // Then, store this updated sequence for the current target node.
        wrtnNos += ( wrtnObj [ tgtNo ] + "," ) ;
        wrtnNoLists [ tgtNo ] = wrtnNos ;

        // Get the neighbors of the current target node from the adjacency list.
        var directionObj = orderedSubTree [ tgtNo ] ;

        // If the current node has neighbors (i.e., it's not a leaf or isolated).
        if ( directionObj )
        {
            // Iterate through all neighbors.
            for ( var i = 0 ; i < directionObj . length ; i ++ )
            {
                var nextNo = directionObj [ i ] ; // The neighbor node.

                // If the neighbor hasn't been visited yet (based on wrtnNoLists).
                if ( ! wrtnNoLists [ nextNo ] )
                {
                    // Add the neighbor to the queue for future processing,
                    // along with the current node as its 'fromNo'.
                    nexts . push ( [ nextNo , tgtNo ] ) ;
                }
            }
        }
    } ; // End of crawlNode function definition.

    // Initialize the traversal by adding the starting node (1) to the queue.
    // -1 indicates no parent for the root node.
    nexts . push ( [ 1 , -1 ] ) ;

    // This loop simulates a breadth-first search (BFS) or depth-first search (DFS)
    // depending on how 'nexts' is managed (shift for BFS, pop for DFS).
    // The YAKUYOKE variable acts as a safeguard against infinite loops,
    // though in a tree/graph traversal, it should naturally terminate.
    for ( var YAKUYOKE = 0 ; YAKUYOKE < 10000000 ; YAKUYOKE ++ )
    {
        var next = nexts . shift ( ) ; // Dequeue the next node to visit.
        crawlNode ( next [ 0 ] , next [ 1 ] ) ; // Process the dequeued node.

        // If the queue is empty, all reachable nodes have been processed.
        if ( nexts . length == 0 )
        {
            break ; // Exit the traversal loop.
        }
    } // End of traversal loop.


    // The following code block is currently unreachable due to the 'return' statement above.
    return ;

    // This section seems intended for further processing of 'wrtnNoLists'
    // to calculate answers, possibly related to Longest Increasing Subsequence (LIS)
    // or similar problems on paths in the tree.
    for ( var i = 1 ; i <= N ; i ++ )
    {

        // Retrieve the comma-separated list of numbers for the current node.
        var list = wrtnNoLists [ i ] . split ( "," ) ;
        list . pop ( ) ; // Remove the last empty string element resulting from the trailing comma.
        var list2 = [ ] ; // Initialize a new list to build the processed sequence.

        // Process each number in the list.
        for ( var j = 0 ; j < list . length ; j ++ )
        {
            var wk = list [ j ] ; // Current working number.

            // If list2 is empty, just add the first number.
            if ( list2 . length == 0 )
            {
                list2 . push ( wk ) ;
            }
            // If the current number is greater than the last element in list2, append it.
            else if ( wk > list2 [ list2 . length - 1 ] )
            {
                list2 . push ( wk ) ;
            }
            // If the current number is less than or equal to the first element in list2, replace the first element.
            else if ( wk <= list2 [ 0 ] )
            {
                list2 [ 0 ] = wk ;
            }
            // Otherwise, find the correct position to replace an element to maintain an increasing sequence.
            // This is a common step in algorithms like finding the LIS.
            else
            {
                for ( var k = 1 ; k < list2 . length ; k ++ )
                {
                    // Find the first element list2[k] such that list2[k-1] < wk <= list2[k].
                    // Replace list2[k] with wk to get a potentially shorter or equal length
                    // increasing subsequence ending with a smaller number.
                    if ( list2 [ k - 1 ] < wk && wk <= list2 [ k ] )
                    {
                        list2 [ k ] = wk ;
                        break ; // Found and replaced, move to the next 'wk'.
                    }
                }
            }
        }
        anss . push ( list2 . length ) ; // Store the length of the processed sequence for the current node.
    }

    // Output the final answers, each on a new line.
    console . log ( anss . join ( "\n" ) ) ;
} // End of Main function.


// Execute the Main function with a Scanner instance.
// The Scanner reads input from standard input (/dev/stdin) in UTF-8 encoding.
Main ( new Scanner ( require ( "fs" ) . readFileSync ( "/dev/stdin" , "utf8" ) ) ) ;

/*
// Example of how to create a Scanner instance with a hardcoded string.
// Main(new Scanner("33"));
*/

/*
// Usage examples for the Scanner methods (commented out).
// var str1 = sc.next();         // Get a string token.
// var int1 = sc.nextInt();      // Get an integer token.
// var bd1 = sc.nextBigDecimal(); // Get a floating-point token.
// var byte1 = sc.nextByte();     // Get a byte token (Int8Array).
*/

/*
// A loop designed to introduce a delay (commented out).
// for (var i = 0; i < 1000000000; i++) var toDelay = "aaa"; // Approximately 1000ms delay.
*/

/*
// A commented-out debug statement.
// console.log(wrtnNos); return;
*/