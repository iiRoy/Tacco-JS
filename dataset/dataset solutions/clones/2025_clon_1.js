"use strict";
// This directive enforces strict mode for the entire script.
// It helps in writing cleaner code by catching common mistakes.



const   main   =   ( arg )   =>
{

    // The 'main' function serves as the entry point for processing the input.

    arg  =  arg .trim() .split( "\n" ) ;
    // First, the input string 'arg' is processed:
    // 1. '.trim()' removes any leading or trailing whitespace.
    // 2. '.split("\n")' then splits the cleaned string into an array of lines,
    //    using the newline character as a delimiter.


    // Extracting the problem parameters from the first line of the input.
    const K  =  parseInt(  arg[0] .split( " " ) [0]  ) ;
    // K represents the total length of the circular track or the maximum coordinate.

    const N  =  parseInt(  arg[0] .split( " " ) [1]  ) ;
    // N represents the number of points (houses) located on the track.


    // Extracting the coordinates of the points from the second line of the input.
    const A  =  arg[1] .split( " " ) .map(  n  =>  parseInt(n)  ) ;
    // A is an array containing the integer coordinates of the N points.


    let distances  =  [ ] ;
    // An empty array is initialized to store the calculated distances
    // between consecutive points on the circular track.


    // This comment indicates the purpose of the following loop: to create segments.
    // 区間を作る


    // Loop through each point to calculate the distance to the next point.
    for (  let i = 0;    i < N;    i++  )
    {

        let distance ;
        // A variable to temporarily hold the distance for the current segment.

        // Special handling for the last segment, which connects the last point back to the first.
        if (  parseInt(i)  ===  N  -  1  )
        {
            // The distance for the last segment involves wrapping around the circular track.
            // It's calculated as: (total length - last point's coordinate) + first point's coordinate.
            distance  =  ( K  -  A[i] )  +  A[0] ;
        }
        else
        {
            // For all other segments, the distance is simply the difference
            // between the coordinate of the next point and the current point.
            distance  =  A[  parseInt(i)  +  1  ]  -  A[i] ;
        }


        distances .push( distance ) ;
        // The calculated distance for the current segment is added to the 'distances' array.
    }


    // Calculate the sum of all segment distances.
    // This represents the total circumference if we were to traverse all segments.
    const sum  =  distances .reduce(  ( m, n )  =>  m + n  ) ;


    // The problem asks to find the minimum travel distance to visit all points.
    // This is achieved by removing the longest segment from the total sum.
    let answer  =  sum  -  Math.max( ...distances ) ;


    // Print the final calculated answer to the standard output.
    console .log( answer ) ;

};


// This line reads the input from '/dev/stdin' (standard input),
// decodes it as 'utf8', and then passes it to the 'main' function for processing.
main(  require( 'fs' ) .readFileSync( '/dev/stdin',  'utf8' )  ) ;