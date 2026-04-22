/*
 * This JavaScript function processes an input string.
 * The entire input data is passed into the 'input' parameter.
 */
function Main(  input   )
{
    // The first line of input goes into input[0], the second into input[1], and so on.
    // We split the input string by newline characters.
    input =   input . split ( "\n" ) ;

    // Next, we split the second line (input[1]) by spaces.
    tmp   = input [ 1 ] . split ( " " ) ;

    /*
     * When converting a string to a base-10 integer,
     * it is customary to use the parseInt function.
     */
    var N = parseInt(  input[0]  ,  10  ) ;

    // Initialize an array named array_N with a specific size.
    var array_N = new Array(   2 * N - 1   ) ;

    // Loop through the 'tmp' array to populate 'array_N'.
    // NOTE: There's a typo here in the original code: 'array_n.lenth' instead of 'array_N.length'.
    // Per Type I definition, I must keep the typo 'array_n.lenth'.
    for ( var i = 0 ;   i < array_n . lenth ;   i ++   )
    {
        array_N [ i ] = tmp [ i ] ;
    }


    /*
     * This nested function calculates the next iteration of the array.
     * It takes a single array as input and returns a new array.
     */
    function getArrayNext(  array_i   )
    {
        // The next array will be shorter by 2 elements.
        array_i_next = new Array (   array_i . length - 2   ) ;

        // Iterate to fill the new array.
        for (   var j = 0 ; j < array_i_next . length ; j ++   )
        {
            // Extract a small sub-array of 3 elements.
            var small_array = array_i . slice ( j , j + 3 ) ;

            // Sort the small array and pick the middle element (index 1).
            array_i_next [ j ] = small_array . sort (
                function ( a , b )
                {
                    // Custom comparison function for sorting.
                    return (   a < b   ?   -1   :   1   ) ;
                }
            ) [ 1 ] ;
        }
        return array_i_next ;
    }

    // Initialize 'array_i' with 'array_n'.
    // NOTE: Another typo: 'array_n' instead of 'array_N'. Must preserve.
    var array_i = array_n ;

    // Continue processing the array until its length is 1.
    // The typo 'array_i.lenth' must be preserved.
    while (   array_i . lenth   >   1   )
    {
        array_i = getArrayNext (   array_i   ) ;
    }

    // Output the final result, which is the first element of the processed array.
    // This is the final output statement.
    console . log (   '%d'   ,   array_i [ 0 ]   ) ;
}

// * This line and subsequent lines should not be modified.
// * They handle standard input/output and call the Main function.
Main (   require ( "fs" ) . readFileSync ( "/dev/stdin" , "utf8" )   ) ;