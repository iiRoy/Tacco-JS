/*
 * This JavaScript code processes input from standard in.
 * It reads a series of lines, then performs graph-related operations.
 * The main goal is to calculate friend recommendations or block connections.
 */

var       input = require ( "fs" )
    . readFileSync ( "/dev/stdin" , "utf8" )
    . trim ( )
    . split ( "\n" )
; // End of input reading and initial processing

/*
 * The 'obj' object acts as a custom iterator for the input array.
 * It provides methods to get the next element and check for existence.
 */
var         obj = {
    "list" : input , // The array of input lines
    "index" : 0 ,    // Current position in the list
    "max" : input . length , // Total number of elements in the list

    /*
     * Retrieves the next element from the input list.
     * Throws an error if no more elements are available.
     */
    "next" : function ( ) {
        if ( ! this . hasNext ( ) ) {
            throw "NoSuchElementException:次に要素は無いよ"; // Error message for no next element
        }

        var returnObj = this . list [ this . index ] ; // Get the current element
        this . index ++ ; // Advance the index

        return returnObj ; // Return the retrieved element
    } ,

    /*
     * Checks if there are more elements to iterate over.
     * Returns true if there are, false otherwise.
     */
    "hasNext" : function ( ) {
        return ( this . index < this . max ) ; // Compare current index with max length
    }
} ; // End of obj definition


Main ( ) ; // Invoke the primary function to start execution


/*
 * Wrapper function to get the next element using the custom iterator.
 * Simplifies access to obj.next().
 */
function next ( ) {

    return obj . next ( ) ;
}


/*
 * Wrapper function to check if there's a next element using the custom iterator.
 * Simplifies access to obj.hasNext().
 */
function hasNext ( ) {

    return obj . hasNext ( ) ;
}


/*
 * Outputs the given argument to the standard output (console.log).
 * This is for displaying results.
 */
function myout ( t ) {
    console . log ( t ) ;
} // standard output function


/*
 * Outputs the given argument to the standard error (console.error).
 * Useful for debugging or displaying error messages.
 */
function myerr ( t ) {
    console . error ( t ) ;
} // standard error function


/*
 * myconv: A utility function for type conversion and string manipulation.
 *
 * Parameters:
 *   i: The input value to be converted or processed.
 *   no: A numeric code specifying the desired operation.
 *
 * Operation codes:
 *   - 1: Convert to integer (parseInt).
 *   - 2: Split by half-width space (" ").
 *   - 4: Split by half-width space, then map to Number array.
 *   - 6: Split into individual characters ("").
 *   - 7: Split into individual characters, then map to Number array.
 *   - 8: Join array elements with half-width space (" ").
 *   - 9: Join array elements with newline ("\n").
 *   - 0: Join array elements without any separator ("").
 *   - Default: Return the input 'i' unchanged.
 *
 * Error Handling:
 *   - If any conversion or operation fails, the original input 'i' is returned.
 */
function myconv ( i , no ) {
    try {
        switch ( no ) {
            case 1 :
                return parseInt ( i ) ; // Convert to integer
            case 2 :
                return i . split ( " " ) ; // Split string by space
            case 4 :
                return i . split ( " " ) . map ( ( a ) => Number ( a ) ) ; // Split by space, convert to numbers
            case 6 :
                return i . split ( "" ) ; // Split string into characters
            case 7 :
                return i . split ( "" ) . map ( ( a ) => Number ( a ) ) ; // Split into characters, convert to numbers
            case 8 :
                return i . join ( " " ) ; // Join array with spaces
            case 9 :
                return i . join ( "\n" ) ; // Join array with newlines
            case 0 :
                return i . join ( "" ) ; // Join array without separator
            default :
                return i ; // Return input as is if no matching case
        }
    } catch ( e ) {
        return i ; // Return original input on error
    }
}


/*
 * The main function where the program logic resides.
 * It reads N, M, K values, builds a graph, finds connected components (groups),
 * and then calculates potential friend recommendations or blocked connections.
 */
function Main ( ) {

    // Read the first line of input, which contains N, M, K
    var one = myconv ( next ( ) , 4 ) ;

    var N = one [ 0 ] ; // Number of people/nodes
    var M = one [ 1 ] ; // Number of friend connections
    var K = one [ 2 ] ; // Number of blocked connections

    // Initialize a list to store information about each person
    var list = new Array ( N ) ;
    var i ; // Loop counter variable


    // Initialize each person's entry in the list
    for ( i = 0 ; i < N ; i ++ ) {
        list [ i ] = {
            "friend" : [ ] , // Array to store indices of friends
            "group" : null   // Group ID, initially null
        } ;
    }


    // Process M friend connections
    for ( i = 0 ; i < M ; i ++ ) {
        var tmp = myconv ( next ( ) , 4 ) ; // Read a friend pair (u, v)

        // Adjust indices to be 0-based
        list [ tmp [ 0 ] - 1 ] [ "friend" ] . push ( tmp [ 1 ] - 1 ) ; // Add v to u's friend list
        list [ tmp [ 1 ] - 1 ] [ "friend" ] . push ( tmp [ 0 ] - 1 ) ; // Add u to v's friend list (undirected graph)
    }


    // Array to store sets of people belonging to each connected group
    var group = [ ] ;


    // Perform Breadth-First Search (BFS) to find connected components
    for ( i = 0 ; i < N ; i ++ ) {
        bfs ( i ) ; // Start BFS from each unvisited person
    }

    // myerr(list); // Debugging output for the list structure


    /*
     * Performs a Breadth-First Search (BFS) starting from a given index
     * to identify connected components in the graph.
     * Assigns a 'group' ID to all reachable nodes.
     */
    function bfs ( index ) {
        // If this person already belongs to a group, skip BFS
        if ( list [ index ] [ "group" ] != null ) {
            return ;
        }

        // If a new group is found, create a new Set for it
        group . push ( new Set ( ) ) ;

        // Initialize queue for BFS with the starting person
        var queue = [ list [ index ] ] ;

        // Process nodes in the queue
        while ( queue . length > 0 ) {
            var tmp = queue . shift ( ) ; // Get the next person from the queue

            // If this person already has a group, skip (already processed)
            if ( tmp [ "group" ] != null ) {
                continue ;
            }

            // Assign the current group ID to this person
            tmp [ "group" ] = group . length - 1 ;

            // Add all friends of this person to the queue for processing
            for ( var j = 0 ; j < tmp [ "friend" ] . length ; j ++ ) {
                queue . push ( list [ tmp [ "friend" ] [ j ] ] ) ;
            }
        }
    } // End of bfs function


    // Populate the 'group' sets with actual person indices
    for ( i = 0 ; i < N ; i ++ ) {
        group [ list [ i ] [ "group" ] ] . add ( i ) ;
    }

    // myerr(group); // Debugging output for the group sets


    // Initialize an array to store the calculated output for each person
    var output = new Array ( N ) ;


    // Calculate initial recommendation count for each person
    // (Size of their group - 1 (self) - number of direct friends)
    for ( i = 0 ; i < N ; i ++ ) {
        output [ i ] = group [ list [ i ] [ "group" ] ] . size - 1 - list [ i ] [ "friend" ] . length ;
    }


    // Process K blocked connections
    for ( i = 0 ; i < K ; i ++ ) {
        var ng = myconv ( next ( ) , 4 ) ; // Read a blocked pair (u, v)

        // Adjust indices to be 0-based
        ng [ 0 ] -- ;
        ng [ 1 ] -- ;

        // Only consider blocked connections if they are in the same group
        if ( list [ ng [ 0 ] ] [ "group" ] != list [ ng [ 1 ] ] [ "group" ] ) {
            continue ; // If not in the same group, they cannot be recommended anyway
        }

        // Decrement recommendation count for both people in the blocked pair
        output [ ng [ 0 ] ] -- ;
        output [ ng [ 1 ] ] -- ;
    }

    // Output the final results, joined by spaces
    myout ( myconv ( output , 8 ) ) ;

} // End of Main function