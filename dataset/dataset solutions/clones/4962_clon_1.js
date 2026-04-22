'use strict' ; // This directive enforces strict mode for the entire script.

// Module 'fs' is required to interact with the file system.
// The input is read synchronously from '/dev/stdin', decoded as UTF-8,
// trimmed of leading/trailing whitespace, and then split into an array of lines.
const inputs = require ( 'fs' ) . readFileSync ( '/dev/stdin' , 'utf8' ) . trim ( ) . split ( '\n' ) ;


// The first line of input contains R (rows) and C (columns), separated by a space.
// It's parsed into an array of numbers.
const RC = inputs[ 0 ] . split ( ' ' ) . map ( Number ) ;
const R = RC[ 0 ] ; // R represents the number of rows in the grid.
const C = RC[ 1 ] ; // C represents the number of columns in the grid.

// The second line of input contains N, the number of data points or operations.
const N = parseInt ( inputs[ 1 ] ) ;

// The remaining lines (from index 2 onwards) contain the actual data points.
// Each data point consists of r, c, a values.
const rca = inputs . slice ( 2 ) ;


// Initialize distance variables for different parity and axis combinations.
// A value of -1 indicates that the distance has not yet been determined.
let dist_x_odd  =  -1 , // Distance for odd-indexed rows/columns along x-axis.
	dist_x_even =  -1 , // Distance for even-indexed rows/columns along x-axis.
	dist_y_odd  =  -1 , // Distance for odd-indexed rows/columns along y-axis.
	dist_y_even =  -1 ; // Distance for even-indexed rows/columns along y-axis.


// Initialize Map objects to store encountered data points.
// These maps help in finding pairs of points to calculate distances.
let map_x_odd   =  new  Map ( ) ,  // Stores points for odd rows/columns (x-axis related).
	map_x_even  =  new  Map ( ) ,  // Stores points for even rows/columns (x-axis related).
	map_y_odd   =  new  Map ( ) ,  // Stores points for odd rows/columns (y-axis related).
	map_y_even  =  new  Map ( ) ;  // Stores points for even rows/columns (y-axis related).


// Begin processing each of the N data points.
for  ( let i = 0 ;  i  <  N ;  i ++ )
{
    // Parse the current data point (r, c, a) from the 'rca' array.
    let rcai = rca[ i ] . split ( ' ' ) , // Split the string by space.
        r1   = parseInt ( rcai[ 0 ] ) , // r1 is the row coordinate.
        c1   = parseInt ( rcai[ 1 ] ) , // c1 is the column coordinate.
        a1   = parseInt ( rcai[ 2 ] ) ; // a1 is the associated value.

    // --- Logic for Y-axis (vertical) distances ---

    // Special case: If the number of rows R is 2.
    if  ( R  ===  2 )
    {
        // For R=2, all rows are effectively 'even' or handled uniformly.
        // Check if map_y_even already contains an entry for the current column c1.
        if  ( map_y_even . has ( c1 ) )
        {
            // If an entry exists, we have a pair of points in the same column.
            let ra2  =  map_y_even . get ( c1 ) , // Get the previously stored [r, a] pair.
                r2   =  ra2[ 0 ] ,              // r2 is the row of the previous point.
                a2   =  ra2[ 1 ] ;              // a2 is the value of the previous point.

            // Calculate the difference 'd' based on the two points.
            let d  =  ( a2  -  a1 )  /  ( r2  -  r1 ) ;
            // Adjust 'd' if r2 is greater than r1 for consistent direction.
            if  ( r2  >  r1 )  d  *=  -1 ;

            // If dist_y_even has not been set yet, initialize it.
            if  ( dist_y_even  ===  -1 )
            {
                dist_y_even  =  d ; // Set the global distance for this case.

                // Validate all previously stored points in map_y_even with the new distance.
                for  ( let cra3  of  map_y_even . entries ( ) )
                {
                    let c3  =  cra3[ 0 ] ,         // Column of the stored point.
                        r3  =  cra3[ 1 ][ 0 ] ,    // Row of the stored point.
                        a3  =  cra3[ 1 ][ 1 ] ;    // Value of the stored point.

                    // Check if the conditions based on 'd' are violated.
                    if  ( a3  -  d  *  ( r3  -  1 )  <  0  ||
                          a3  +  d  *  ( 2  -  r3 )  <  0 )
                    {
                        console . log ( 'No' ) ; // Output 'No' if invalid.
                        process . exit ( ) ;     // Terminate execution.
                    }
                }
            }
            else
            {
                // If dist_y_even was already set, ensure the new 'd' matches.
                if  ( d  !==  dist_y_even )
                {
                    console . log ( 'No' ) ;
                    process . exit ( ) ;
                }
            }
            // Finally, check the current point (r1, a1) against the distance 'd'.
            if  ( a1  -  d  *  ( r1  -  1 )  <  0  ||
                  a1  +  d  *  ( 2  -  r1 )  <  0 )
            {
                console . log ( 'No' ) ;
                process . exit ( ) ;
            }

        }
        else
        {
            // If no existing entry for c1, store the current point.
            map_y_even . set ( c1 ,  [ r1 ,  a1 ] ) ;
        }

    }
    else // General case: R > 2.
    {
        // Distinguish based on the parity of the current row r1.
        if  ( r1  %  2  ===  0 ) // If r1 is an even row.
        {
            // Use map_y_even for even rows.
            if  ( map_y_even . has ( c1 ) )
            {
                let ra2  =  map_y_even . get ( c1 ) ,
                    r2   =  ra2[ 0 ] ,
                    a2   =  ra2[ 1 ] ;

                let d  =  ( a2  -  a1 )  /  ( ( r2  -  r1 )  /  2 ) ;
                if  ( r2  >  r1 )  d  *=  -1 ;

                if  ( dist_y_even  ===  -1 )
                {
                    dist_y_even  =  d ;

                    // Note: This loop iterates over map_y_odd, which might be a copy-paste error from the original code.
                    // However, for a Type I clone, we must preserve it exactly as is.
                    for  ( let cra3  of  map_y_odd . entries ( ) )
                    {
                        let c3  =  cra3[ 0 ] ,
                            r3  =  cra3[ 1 ][ 0 ] ,
                            a3  =  cra3[ 1 ][ 1 ] ;

                        if  ( a3  -  d  *  ( ( r3  /  2 )  -  1 )  <  0  ||
                              a3  +  d  *  Math . floor ( ( R  -  r3 )  /  2 )  <  0 )
                        {
                            console . log ( 'No' ) ;
                            process . exit ( ) ;
                        }
                    }
                }
                else
                {
                    if  ( d  !==  dist_y_even )
                    {
                        console . log ( 'No' ) ;
                        process . exit ( ) ;
                    }
                }
                if  ( a1  -  d  *  ( ( r1  /  2 )  -  1 )  <  0  ||
                      a1  +  d  *  Math . floor ( ( R  -  r1 )  /  2 )  <  0 )
                {
                    console . log ( 'No' ) ;
                    process . exit ( ) ;
                }

            }
            else
            {
                map_y_even . set ( c1 ,  [ r1 ,  a1 ] ) ;
            }

        }
        else // If r1 is an odd row.
        {
            // Use map_y_odd for odd rows.
            if  ( map_y_odd . has ( c1 ) )
            {
                let ra2  =  map_y_odd . get ( c1 ) ,
                    r2   =  ra2[ 0 ] ,
                    a2   =  ra2[ 1 ] ;

                let d  =  ( a2  -  a1 )  /  ( ( r2  -  r1 )  /  2 ) ;
                if  ( r2  >  r1 )  d  *=  -1 ;

                if  ( dist_y_odd  ===  -1 )
                {
                    dist_y_odd  =  d ;

                    for  ( let cra3  of  map_y_odd . entries ( ) )
                    {
                        let c3  =  cra3[ 0 ] ,
                            r3  =  cra3[ 1 ][ 0 ] ,
                            a3  =  cra3[ 1 ][ 1 ] ;

                        if  ( a3  -  d  *  Math . floor ( r3  /  2 )  <  0  ||
                              a3  +  d  *  Math . floor ( ( R  -  r3 )  /  2 )  <  0 )
                        {
                            console . log ( 'No' ) ;
                            process . exit ( ) ;
                        }
                    }
                }
                else
                {
                    if  ( d  !==  dist_y_odd )
                    {
                        console . log ( 'No' ) ;
                        process . exit ( ) ;
                    }
                }
                if  ( a1  -  d  *  Math . floor ( ( r1  -  1 )  /  2 )  <  0  ||
                      a1  +  d  *  Math . floor ( ( R  -  r1 )  /  2 )  <  0 )
                {
                    console . log ( 'No' ) ;
                    process . exit ( ) ;
                }
            }
            else
            {
                map_y_odd . set ( c1 ,  [ r1 ,  a1 ] ) ;
            }
        }
    }

    // --- Logic for X-axis (horizontal) distances ---
    // This section mirrors the Y-axis logic but for columns.

    // Special case: If the number of columns C is exactly 2.
    if  ( C  ===  2 )
    {
        // For C=2, all columns are effectively 'even' or handled uniformly.
        // Check if map_x_even already contains an entry for the current row r1.
        if  ( map_x_even . has ( r1 ) )
        {
            let ca2  =  map_x_even . get ( r1 ) ,
                c2   =  ca2[ 0 ] ,
                a2   =  ca2[ 1 ] ;

            let d  =  ( a2  -  a1 )  /  ( c2  -  c1 ) ;
            if  ( c2  >  c1 )  d  *=  -1 ;

            if  ( dist_x_even  ===  -1 )
            {
                dist_x_even  =  d ;

                for  ( let rca3  of  map_x_even . entries ( ) )
                {
                    let r3  =  rca3[ 0 ] ,
                        c3  =  rca3[ 1 ][ 0 ] ,
                        a3  =  rca3[ 1 ][ 1 ] ;

                    if  ( a3  -  d  *  ( c3  -  1 )  <  0  ||
                          a3  +  d  *  ( C  -  c3 )  <  0 )
                    {
                        console . log ( 'No' ) ;
                        process . exit ( ) ;
                    }
                }
            }
            else
            {
                if  ( d  !==  dist_x_even )
                {
                    console . log ( 'No' ) ;
                    process . exit ( ) ;
                }
            }
            if  ( a1  -  d  *  ( c1  -  1 )  <  0  ||
                  a1  +  d  *  ( C  -  c1 )  <  0 )
            {
                console . log ( 'No' ) ;
                process . exit ( ) ;
            }

        }
        else
        {
            map_x_even . set ( r1 ,  [ c1 ,  a1 ] ) ;
        }
    }
    else // General case: C > 2.
    {
        // Distinguish based on the parity of the current column c1.
        if  ( c1  %  2  ==  0 ) // If c1 is an even column. (Using '==' for variety)
        {
            // Use map_x_even for even columns.
            if  ( map_x_even . has ( r1 ) )
            {
                let ca2  =  map_x_even . get ( r1 ) ,
                    c2   =  ca2[ 0 ] ,
                    a2   =  ca2[ 1 ] ;

                let d  =  ( a2  -  a1 )  /  ( ( c2  -  c1 )  /  2 ) ;
                if  ( c2  >  c1 )  d  *=  -1 ;

                if  ( dist_x_even  ===  -1 )
                {
                    dist_x_even  =  d ;

                    for  ( let rca3  of  map_x_even . entries ( ) )
                    {
                        let r3  =  rca3[ 0 ] ,
                            c3  =  rca3[ 1 ][ 0 ] ,
                            a3  =  rca3[ 1 ][ 1 ] ;

                        if  ( a3  -  d  *  ( ( c3  /  2 )  -  1 )  <  0  ||
                              a3  +  d  *  Math . floor ( ( C  -  c3 )  /  2 )  <  0 )
                        {
                            console . log ( 'No' ) ;
                            process . exit ( ) ;
                        }
                    }
                }
                else
                {
                    if  ( d  !==  dist_x_even )
                    {
                        console . log ( 'No' ) ;
                        process . exit ( ) ;
                    }
                }
                if  ( a1  -  d  *  ( ( c1  /  2 )  -  1 )  <  0  ||
                      a1  +  d  *  Math . floor ( ( C  -  c1 )  /  2 )  <  0 )
                {
                    console . log ( 'No' ) ;
                    process . exit ( ) ;
                }
            }
            else
            {
                map_x_even . set ( r1 ,  [ c1 ,  a1 ] ) ;
            }

        }
        else // If c1 is an odd column.
        {
            // Use map_x_odd for odd columns.
            if  ( map_x_odd . has ( r1 ) )
            {
                let ca2  =  map_x_odd . get ( r1 ) ,
                    c2   =  ca2[ 0 ] ,
                    a2   =  ca2[ 1 ] ;

                let d  =  ( a2  -  a1 )  /  ( ( c2  -  c1 )  /  2 ) ;
                if  ( c2  >  c1 )  d  *=  -1 ;

                if  ( dist_x_odd  ===  -1 )
                {
                    dist_x_odd  =  d ;

                    for  ( let rca3  of  map_x_odd . entries ( ) )
                    {
                        let r3  =  rca3[ 0 ] ,
                            c3  =  rca3[ 1 ][ 0 ] ,
                            a3  =  rca3[ 1 ][ 1 ] ;

                        if  ( a3  -  d  *  Math . floor ( c3  /  2 )  <  0  ||
                              a3  +  d  *  Math . floor ( ( C  -  c3 )  /  2 )  <  0 )
                        {
                            console . log ( 'No' ) ;
                            process . exit ( ) ;
                        }
                    }
                }
                else
                {
                    if  ( d  !==  dist_x_odd )
                    {
                        console . log ( 'No' ) ;
                        process . exit ( ) ;
                    }
                }
                if  ( a1  -  d  *  Math . floor ( c1  /  2 )  <  0  ||
                      a1  +  d  *  Math . floor ( ( C  -  c1 )  /  2 )  <  0 )
                {
                    console . log ( 'No' ) ;
                    process . exit ( ) ;
                }
            }
            else
            {
                map_x_odd . set ( r1 ,  [ c1 ,  a1 ] ) ;
            }
        }
    }
}

/*
 * If the program reaches this point, it means all data points were processed
 * without any inconsistencies being found.
 * Therefore, the conditions are met, and the output is 'Yes'.
 */
console . log ( 'Yes' ) ;