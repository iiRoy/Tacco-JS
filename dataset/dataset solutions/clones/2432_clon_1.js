/*
 * Main entry point for the program.
 * This function processes input data, calculates distances,
 * generates permutations, and then computes an average sum.
 */
function main( input )
{
    // Parse the number of points from the first line of input.
    // The `-0` is used to ensure it's treated as a number.
    var n = input[ 0 ] - 0 ;

    // Initialize a list to store the coordinates of points.
    var list = [ ] ;

    // Loop through the input lines starting from the second line
    // to parse the coordinates for each point.
    for ( var i = 1 ; i <= n ; i++ )
    {
        // Split each line by space, then map the string values to numbers.
        // The `v=>v-0` is a concise way to convert string to number.
        list.push( input[ i ].split( " " ).map( v => v - 0 ) ) ;
    }

    // A map to store pre-calculated distances between pairs of points.
    // Keys will be in the format "idx1_idx2".
    var dismap = { } ;

    // Calculate all unique pairwise distances between points.
    // Store distances symmetrically (e.g., dismap["1_0"] and dismap["0_1"] will be the same).
    for ( var i = 0 ; i < n ; i++ )
    {
        for ( var j = i + 1 ; j < n ; j++ )
        {
            // Calculate distance using the 'distance' helper function.
            dismap[ j + "_" + i ] = dismap[ i + "_" + j ] = distance( list[ i ], list[ j ] ) ;
        }
    }

    // Generate all possible permutations (paths) for traversing 'n' points.
    // The 'allpth' function handles this recursive generation.
    var checklist = allpth( n ) ;

    // Initialize a variable to accumulate the total sum of path lengths.
    var sum = 0 ;

    // Iterate through each generated path (permutation).
    for ( var i = 0 ; i < checklist.length ; i++ )
    {
        // Calculate the total length of the current path and add it to the sum.
        sum += calcSum( dismap, checklist[ i ] ) ;
    }

    // Output the average path length.
    // This is the total sum of all path lengths divided by the number of paths.
    console.log( sum / checklist.length ) ;
}


/*
 * Calculates the total length of a given path (sequence of points).
 * It uses the pre-calculated distances stored in 'dismap'.
 */
function calcSum( dismap , list )
{
    var sum = 0 ; // Initialize path sum for this specific path.

    // Iterate through the path, calculating the distance between consecutive points.
    for ( var i = 1 ; i < list.length ; i++ )
    {
        // Retrieve the distance from the dismap using the current and previous point indices.
        sum += dismap[ list[ i - 1 ] + "_" + list[ i ] ] ;
    }
    return sum ; // Return the total length of the path.
}


/*
 * Calculates the Euclidean distance between two points (a and b).
 * Each point is an array [x, y].
 */
function distance( a , b )
{
    // Calculate the difference in x-coordinates and square it.
    // Calculate the difference in y-coordinates and square it.
    // Sum these squared differences, then take the square root.
    return Math.sqrt( Math.pow( a[ 0 ] - b[ 0 ] , 2 ) + Math.pow( a[ 1 ] - b[ 1 ] , 2 ) ) ;
}


/*
 * Generates all possible permutations of 'n' points (0 to n-1).
 * This function uses a recursive approach to build the permutations.
 */
function allpth( n )
{
    var list = [ ] ; // This list will store all generated permutations.

    // Base case for the recursion: if n is 1, there's only one point (0),
    // so the only permutation is [[0]].
    if ( n == 1 )
    {
        return [ [ 0 ] ] ;
    }

    // Recursive step: get all permutations for n-1 points.
    // The points are assumed to be 0 to n-2 at this stage.
    var baseList = allpth( n - 1 ) ;

    // For each permutation of n-1 points, insert the new point (n-1)
    // at every possible position to create permutations of n points.
    for ( var i = 0 ; i < n ; i++ )
    {
        for ( var j = 0 ; j < baseList.length ; j++ )
        {
            // Create a copy of the base permutation to avoid modifying the original.
            var tmp = baseList[ j ].concat( ) ;

            // Insert the new point (n-1) at index 'i' in the copied permutation.
            tmp.splice( i , 0 , n - 1 ) ;

            // Add the new complete permutation to our list.
            list.push( tmp ) ;
        }
    }
    return list ; // Return all permutations of 'n' points.
}


// Read input from standard input, decode it as UTF-8,
// split it into lines, and pass it to the main function.
main( require( 'fs' ).readFileSync( '/dev/stdin' , 'utf8' ).split( "\n" ) )