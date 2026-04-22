/*
 * This JavaScript file processes input data to find an optimal location based on temperature.
 * It aims to identify a location where the calculated average temperature is closest
 * to a predefined ideal temperature.
 *
 * The core logic involves calculating temperature differences and
 * then determining the index of the location that exhibits the smallest absolute difference.
 */
function main ( input )
{
    // The input string is first split by newline characters to separate individual arguments.
    const   args    =   input . split ( '\n' ) ;


    // The following formula is used to compute the average temperature for a given location:
    // Average Temperature = Base Temperature (T) - ( Location Specific Value (x) × 0.006 )
    // 'x' corresponds to an element from the 'ary' array.

    // This variable is designed to store the smallest absolute difference found so far
    // between the ideal temperature and the calculated average temperature.
    let     min_gap ;


    // This variable will hold the 0-based index of the location
    // that corresponds to the 'min_gap' (i.e., the optimal location).
    let     idx     ;


    // Parse the necessary numerical values from the 'args' array.
    // N: Represents the total number of locations (though it is not explicitly used later in this code).
    // T: The initial or base temperature value.
    // A: The target or ideal temperature value that we are trying to match.
    // ary: An array of numerical values, where each element 'n' serves as 'x' in the temperature formula.
    const   N       =   parseInt ( args [ 0 ] ,   10 ) ,
            T       =   parseInt ( args [ 1 ] . split ( ' ' ) [ 0 ] ) ,
            A       =   parseInt ( args [ 1 ] . split ( ' ' ) [ 1 ] ) ,
            ary     =   args [ 2 ] . split ( ' ' ) . map ( n => parseInt ( n ,   10 ) ) ;


    // Begin an iterative process to evaluate each location represented in the 'ary' array.
    for ( let i = 0 ;   i < ary . length ;   i ++ )
    {
        // Calculate the 'gap', which is the absolute difference between
        // the ideal temperature (A) and the average temperature of the current location.
        // The average temperature is derived using T and the current array element ary[i].
        gap     =   Math . abs ( A   -   ( T   -   ( ary [ i ]   *   0.006 ) ) ) ;


        // On the very first iteration, or if 'min_gap' has not yet been initialized,
        // set 'min_gap' to the current 'gap' and 'idx' to the current index 'i'.
        if ( ! min_gap )
        {
            min_gap     =   gap ;
            idx         =   i   ;
        }

        // For subsequent iterations, if the newly calculated 'gap' is less than or
        // equal to the previously recorded 'min_gap', update 'min_gap' and 'idx'
        // to reflect this new optimal finding.
        if ( gap   <=   min_gap )
        {
            min_gap     =   gap ;
            idx         =   i   ;
        }
    }


    // After processing all locations, output the 1-based index of the optimal location.
    // This is achieved by adding 1 to the 0-based 'idx' and converting it to a string.
    console . log ( ( idx   +   1 ) . toString ( ) ) ;
}


// The script execution starts here.
// It reads the entire content of standard input, decodes it as UTF-8,
// and then passes this content as a string to the 'main' function for processing.
main ( require ( 'fs' ) . readFileSync ( '/dev/stdin' ,   'utf8' ) ) ;