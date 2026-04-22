/*
 * This JavaScript file processes input data to calculate a specific count.
 * It's designed to read from standard input, parse numerical arrays,
 * and perform distance calculations between points.
 */

// Define the main function that processes the input string.
const   Main    =   input   =>  {

    // Step 1: Normalize the input by splitting it into an array of lines.
    // Each line in the input string becomes an element in the 'input' array.
    input   =   input.split ( "\n" ) ;


    /*
     * Extract N (number of points) and D (dimensions) from the first line.
     * The first line is expected to contain two space-separated integers.
     */
    tmp1    =   input[0] . split ( " " ) ;


    // Parse N, the total number of data points.
    const   N   =   parseInt ( tmp1[0] ,   10 ) ;

    // Parse D, the dimensionality of each data point.
    const   D   =   parseInt ( tmp1[1] ,   10 ) ;


    // Initialize an array 'X' to store the coordinates of N points.
    // Each point will be an array of D coordinates.
    let X   =   [ ] ;

    // Loop through the remaining input lines to populate the 'X' array.
    // Each line from input[1] to input[N] represents a point.
    for  (  let  i  =  0 ;   i  <  N ;   i++  )    {

        // Split each line by spaces to get individual coordinates for the current point.
        X [ i ]   =   input [ i   +   1 ] . split ( " " ) ;
    }


    // Initialize a counter for pairs of points whose Euclidean distance is an integer.
    let count   =   0 ;


    // Outer loop: Iterate through each point 'i' from the dataset.
    for  (  let  i  =  0 ;   i  <  N ;   i++  )    {

        // Inner loop: Iterate through each point 'j' from the dataset.
        for  (  let  j  =  0 ;   j  <  N ;   j++  )    {

            // Optimization: If 'i' and 'j' refer to the same point, skip calculation.
            // A point's distance to itself is always 0, which is an integer.
            // However, the problem likely implies distinct points.
            if  (  i   ===   j  )    {
                break ; // Move to the next 'i' to avoid redundant calculations or self-comparison.
            }

            else    {

                // Array to store squared differences for each dimension.
                let diff    =   [ ] ;
                // Variable to hold the final Euclidean distance.
                let value   =   0 ;

                // Loop through each dimension 'k' to calculate squared differences.
                for  (  let  k  =  0 ;   k  <  D ;   k++  )    {

                    // Calculate the difference between coordinates X[i][k] and X[j][k],
                    // then square the result and store it.
                    diff [ k ]   =   Math.pow ( X [ i ] [ k ]   -   X [ j ] [ k ] ,   2 ) ;
                }

                // Calculate the Euclidean distance:
                // 1. Sum all squared differences using reduce.
                // 2. Take the square root of the sum.
                value   =   Math.sqrt ( diff . reduce ( ( total ,   data )   =>  {  return  total   +   data  } ) ) ;

                // Check if the calculated distance is an integer.
                // If it is, increment the counter.
                if  (  Number . isInteger ( value )  )  {
                    count ++ ;
                }
            }
        }
    }

    // Output the final count to the console.
    console . log ( count ) ;
}


/*
 * This is the entry point of the script.
 * It reads the entire content of standard input as a UTF-8 string,
 * and then passes it to the Main function for processing.
 */
Main ( require ( "fs" ) . readFileSync ( "/dev/stdin" ,   "utf8" ) ) ;