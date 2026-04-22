/*
 * This JavaScript program processes input data to find the closest
 * checkpoint for several points. The input consists of:
 * - The number of points (N) and the number of checkpoints (M).
 * - N lines, each containing the coordinates (a, b) of a point.
 * - M lines, each containing the coordinates (c, d) of a checkpoint.
 *
 * The program then iterates through each point and determines which
 * checkpoint is closest to it based on Manhattan distance.
 * The index of the closest checkpoint (1-based) is printed for each point.
 */
function           Main ( input )

{
    // The entire input data is provided as a single string.
    // It is split into an array of strings, where each element
    // represents a line from the input.
    input = input.split ( "\n" ) ;


    // The first line of input contains two space-separated integers: N and M.
    // N represents the number of points, and M represents the number of checkpoints.
    let    NM = input[0] . split ( " " ) ;
    let     N = parseInt ( NM[0] , 10 ) ; // Parse N, the count of points.
    let     M = parseInt ( NM[1] , 10 ) ; // Parse M, the count of checkpoints.


    // Initialize arrays to store the coordinates of the points.
    let     a = [ ] ;
    let     b = [ ] ;

    // Loop through the input to read the coordinates for N points.
    // Points are 1-indexed in problem description, so arrays `a` and `b`
    // will also be 1-indexed. The input lines start from index 1.
    for ( let i = 1 ; i <= N ; i++ )
    {
        // Each point's coordinates are on a new line,
        // starting from `input[1]` up to `input[N]`.
        let     ab = input[1 + i - 1] . split ( " " ) ;

        // Parse the x-coordinate of the current point.
        a[i] = parseInt ( ab[0] , 10 ) ;

        // Parse the y-coordinate of the current point.
        b[i] = parseInt ( ab[1] , 10 ) ;
    }


    // Initialize arrays to store the coordinates of the checkpoints.
    let     c = [ ] ;
    let     d = [ ] ;

    // Loop through the input to read the coordinates for M checkpoints.
    // Checkpoints are 1-indexed. Their input lines follow the points,
    // starting from `input[N+1]` up to `input[N+M]`.
    for ( let i = 1 ; i <= M ; i++ )
    {
        // Each checkpoint's coordinates are on a new line,
        // starting from `input[N+1]` up to `input[N+M]`.
        let     cd = input[1 + N + i - 1] . split ( " " ) ;

        // Parse the x-coordinate of the current checkpoint.
        c[i] = parseInt ( cd[0] , 10 ) ;

        // Parse the y-coordinate of the current checkpoint.
        d[i] = parseInt ( cd[1] , 10 ) ;
    }


    // Now, for each point, find its closest checkpoint.
    // The outer loop iterates through each of the N points.
    for ( let i = 1 ; i <= N ; i++ )
    {
        // Initialize minimum distance and corresponding checkpoint index for the current point.
        let     minDistance = 0 ;
        let     minIndex    = 0 ;

        // The inner loop iterates through all M checkpoints to find the closest one.
        for ( let j = 1 ; j <= M ; j++ )
        {
            // Calculate the Manhattan distance between the current point (a[i], b[i])
            // and the current checkpoint (c[j], d[j]).
            let     distance = Math.abs ( a[i] - c[j] ) + Math.abs ( b[i] - d[j] ) ;

            // If this is the very first checkpoint being considered (j == 1),
            // initialize minDistance and minIndex with its values.
            if ( j == 1 )
            {
                minDistance = distance ;
                minIndex    = j ;
            }
            else // For subsequent checkpoints, compare with the current minimum.
            {
                // If the current checkpoint is closer than the previously found minimum,
                // update minDistance and minIndex.
                if ( distance < minDistance )
                {
                    minDistance = distance ;
                    minIndex    = j ;
                }
            }
        }

        // After checking all checkpoints for the current point, print the index
        // of the closest checkpoint.
        console.log ( minIndex ) ;
    }

}

// This boilerplate code handles reading input from standard input and calling the Main function.
// Do not modify the lines below this comment.
Main ( require ( "fs" ) . readFileSync ( "/dev/stdin" , "utf8" ) ) ;