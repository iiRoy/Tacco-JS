/*
 * This JavaScript code implements the Warshall-Floyd algorithm
 * for finding all-pairs shortest paths in a graph.
 * It processes multiple test cases from standard input.
 */

// Define the core Warshall-Floyd algorithm function.
function warshall (
    // No parameters are explicitly passed, as it operates on global variables C, T, and nm.
)
{

    // Outer loop for the intermediate vertex 'k'
    for ( var i = 0 ; i < nm[1] ; i++ )
    {

        // Middle loop for the source vertex 'j'
        for ( var j = 0 ; j < nm[1] ; j++ )
        {

            /* Inner loop for the destination vertex 'k'
             * Note: Loop variables 'i', 'j', 'k' are standard for Warshall-Floyd.
             */
            for ( var k = 0 ; k < nm[1] ; k++ )
            {
                // Update shortest path for C (cost matrix)
                C[i][j] = Math.min ( C[i][j] , C[i][k] + C[k][j] ) ;

                // Update shortest path for T (time matrix)
                T[i][j] = Math.min ( T[i][j] , T[i][k] + T[k][j] ) ;
            }
        }
    }
}


/*
 * Main execution block begins here.
 * Reads input, processes test cases, and outputs results.
 */

// Read all input from stdin, decode as UTF-8.
var input = require ( 'fs' ) . readFileSync ( '/dev/stdin' , 'utf8' ) ;

// Trim whitespace and split the input into an array of lines.
var Arr = ( input . trim ( ) ) . split ( "\n" ) ;


// Loop indefinitely, processing test cases until a termination condition is met.
while ( true )
{
    // Read the first line of the current test case (n, m values).
    // Shift removes the element from Arr and returns it.
    var nm = ( Arr . shift ( ) ) . split ( " " ) . map ( Number ) ;

    // Check for termination condition: if both n and m are 0.
    if ( nm[0] == 0 && nm[1] == 0 )
        break ; // Exit the while loop.


    // Initialize the cost matrix C and time matrix T.
    var C = [ ] ;
    var T = [ ] ;


    // Populate matrices with initial values.
    // nm[1] represents the number of vertices.
    for ( var i = 0 ; i < nm[1] ; i++ )
    {
        // Initialize rows for C and T.
        C[i] = [ ] ;
        T[i] = [ ] ;

        // Initialize direct path costs/times.
        for ( var j = 0 ; j < nm[1] ; j++ )
        {
            // If it's the same vertex, cost/time is 0.
            // Otherwise, it's considered infinite initially.
            C[i][j] = ( i == j ) ? 0 : Infinity ;
            T[i][j] = ( i == j ) ? 0 : Infinity ;
        }
    }


    // Read initial edge weights and update matrices.
    // nm[0] represents the number of initial edges.
    for ( var i = 0 ; i < nm[0] ; i++ )
    {
        // Read edge details: start, end, cost, time.
        var A = ( Arr . shift ( ) ) . split ( " " ) . map ( Number ) ;

        // Update cost matrix C. Adjusting for 0-based indexing.
        C[A[0] - 1][A[1] - 1] = A[2] ;

        // Update time matrix T. Adjusting for 0-based indexing.
        T[A[0] - 1][A[1] - 1] = A[3] ;
    }

    // Execute the Warshall-Floyd algorithm to compute all-pairs shortest paths.
    warshall ( ) ;


    // Read the number of queries for the current test case.
    var k = Arr . shift ( ) - 0 ; // The `-0` ensures conversion to number.


    // Process each query.
    for ( var i = 0 ; i < k ; i++ )
    {
        // Read query details: start, end, type (0 for cost, 1 for time).
        var B = ( Arr . shift ( ) ) . split ( " " ) . map ( Number ) ;

        // Check query type and output the corresponding shortest path.
        if ( B[2] == 0 )
        {
            // Output shortest cost.
            console . log ( C[B[0] - 1][B[1] - 1] ) ;
        }

        if ( B[2] == 1 )
        {
            // Output shortest time.
            console . log ( T[B[0] - 1][B[1] - 1] ) ;
        }
    }
}