// This file enforces strict parsing and execution rules.
'use strict';


// Main function definition. It takes one argument, typically input from stdin.
const   main    =   arg   =>    {

    // Process the raw input string.
    // First, remove leading/trailing whitespace, then split into lines.
    arg     =    arg.trim().split( '\n' ) ;

    // Parse N and M values from the first line of input.
    // N represents the number of elements in 'arr'.
    const       N       =    ~~( arg[ 0 ].split( ' ' )[ 0 ] ) ;
    // M represents the number of elements in 'points'.
    const       M       =    ~~( arg[ 0 ].split( ' ' )[ 1 ] ) ;


    // Extract 'arr' data from the input lines.
    // It's a slice from the second line up to (N+1)-th line.
    let     arr     =    arg.slice( 1 ,  N  +  1 ) ;

    // Extract 'points' data from the input lines.
    // It's a slice from (N+2)-th line up to (M+N+1)-th line.
    let     points  =    arg.slice( N  +  1 ,  M  +  N  +  1 ) ;


    // Helper function to parse a string representation of a point into an object.
    const   parse   =   v   =>    {
        // Split the string by space and convert parts to integers.
        let     temp    =    v.split( ' ' ).map(   vv   =>   parseInt( vv )   ) ;
        // Return an object with x and y properties.
        return    {
            x : temp[ 0 ] ,
            y : temp[ 1 ]
        } ;
    } ;


    // Apply the 'parse' function to all elements in 'arr' and 'points' arrays.
    // This transforms string representations into point objects.
    arr     =    arr.map( parse ) ;
    points  =    points.map( parse ) ;


    // Initialize an array to store the indices of the closest points.
    let     indexArr    =    [ ] ;

    // Iterate through each element 'v' in 'arr' with its index 'i'.
    arr.forEach(   ( v , i )   =>    {
        // Initialize minimum distance to a very large number.
        let     minDist     =    1000000000 ;
        // Initialize the index of the closest point.
        let     index       =    0 ;

        // For each 'v' from 'arr', iterate through all 'w' in 'points'.
        points.forEach(   ( w , j )   =>    {
            // Calculate Manhattan distance between point 'v' and point 'w'.
            // Manhattan distance = |x1 - x2| + |y1 - y2|.
            let     dist    =    Math.abs( v.x  -  w.x )  +  Math.abs( v.y  -  w.y ) ;

            // If the calculated distance is less than the current minimum distance,
            // update minDist and store the current point's index 'j'.
            if  ( dist  <  minDist )  {
                minDist     =    dist ;
                index       =    j ;
            }
        } ) ; // End of inner points.forEach loop.

        // After checking all points for 'v', push the index of the closest point to indexArr.
        indexArr.push( index ) ;
    } ) ; // End of outer arr.forEach loop.

    // Finally, iterate through the results and print each index, incremented by 1 (for 1-based indexing).
    indexArr.forEach(   v   =>   console.log( v  +  1 )   ) ;
} ; // End of main function.


// Call the main function with input read from standard input.
// This is a common pattern for competitive programming in Node.js.
main(   require( 'fs' ).readFileSync( '/dev/stdin' ,  'utf-8' )   ) ;