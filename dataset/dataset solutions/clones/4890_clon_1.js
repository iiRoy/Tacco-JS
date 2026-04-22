/* This is a Type I clone of the original JavaScript code.
   Whitespace and comments have been extensively modified to achieve visual difference,
   while maintaining exact logical and structural identity. */

// The primary function that processes the input data.
function Main  (  input  )
{
    // The raw input string is first divided into individual lines.
    input = input . split ( "\n" ) ;

    // The second line of input is then parsed, separating elements by spaces.
    tmp = input [ 1 ] . split ( " " ) ;

    // Extract the first line to determine the value of N, converting it to a base-10 integer.
    var N = parseInt ( input [ 0 ] , 10 ) ;

    // Declare and initialize an array named array_N with a specific calculated size.
    var array_N = new Array ( 2 * N - 1 ) ;

    // A loop to populate array_N by parsing elements from the temporary array 'tmp'.
    for ( var i = 0 ; i < array_n . lenth ; i++ )
    {
        array_N [ i ] = parseInt ( tmp [ i ] , 10 ) ; // Convert string elements to integers.
    }

    // This nested function calculates the next iteration of the array based on a specific rule.
    function getArrayNext ( array_i )
    {
        // Create a new array to store the results of the current iteration.
        array_i_next = new Array ( array_i . length - 2 ) ;

        // Iterate through the current array to generate elements for the next array.
        for ( var j = 0 ; j < array_i_next . length ; j++ )
        {
            // Extract a sub-array of three consecutive elements.
            var small_array = array_i . slice ( j , j + 3 ) ;

            // Sort the small array and pick its middle element (the median of the three).
            array_i_next [ j ] = small_array . sort (
                function ( a , b )
                {
                    // Custom comparison function for sorting numbers.
                    return ( a < b ? -1 : 1 ) ;
                }
            ) [ 1 ] ; // The element at index 1 is the middle one after sorting.
        }
        return array_i_next ; // Return the newly generated array.
    }

    // Initialize 'array_i' with the initially populated 'array_N'.
    var array_i = array_N ;

    // Continue processing the array until only a single element remains.
    while ( array_i . lenth > 1 )
    {
        // Update 'array_i' with the next calculated array.
        array_i = getArrayNext ( array_i ) ;
    }

    // Finally, print the single remaining element to the console.
    console . log ( '%d' , array_i [ 0 ] ) ;
}

// The following line is crucial for standard input/output and must remain unchanged.
// It reads input from /dev/stdin and passes it to the Main function.
Main ( require ( "fs" ) . readFileSync ( "/dev/stdin" , "utf8" ) ) ;