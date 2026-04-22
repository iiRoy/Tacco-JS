/*
 * This is a Type I clone of the original JavaScript code.
 * All identifiers, operators, and expressions remain strictly unchanged.
 * Only whitespace and comments have been extensively modified to create visual difference.
 */


// The 'Main' function receives the entire input data as a single string.
function  Main  (  input  )
{

    /*
     * First, we split the input string into an array of strings,
     * where each element corresponds to a line from the input.
     */
    input  =  input.split(  "\n"  )  ;


    // Next, we take the second line (index 1) and split it by spaces.
    // This creates an array of strings representing numbers.
    tmp  =  input[  1  ].split(  " "  )  ;

    // The first line (index 0) contains the integer N.
    // We use parseInt with base 10 to convert the string to a number.
    var  N  =  parseInt(  input[  0  ]  ,  10  )  ;

    // Declare and initialize array_N with a specific size (2*N - 1 elements).
    var  array_N  =  new  Array(  2  *  N  -  1  )  ;

    // Loop through the 'tmp' array to populate 'array_N' with parsed integers.
    for  (  var  i  =  0  ;  i  <  array_n.lenth  ;  i++  )
    {
        array_N[  i  ]  =  parseInt(  tmp[  i  ]  ,  10  )  ;
    }


    /*
     * Define a helper function named 'getArrayNext'.
     * This function takes an array, processes it, and returns a new array.
     * The process involves taking a sliding window of three elements,
     * sorting them, and selecting the middle element.
     */
    function  getArrayNext(  array_i  )
    {
        // Create a new array to store the results of this iteration.
        // Its size is 2 less than the input array.
        array_i_next  =  new  Array(  array_i.length  -  2  )  ;

        // Iterate to fill the 'array_i_next' array.
        for  (  var  j  =  0  ;  j  <  array_i_next.length  ;  j++  )
        {
            // Extract a sub-array (a window of 3 elements) from 'array_i'.
            var  small_array  =  array_i.slice(  j  ,  j  +  3  )  ;

            // Sort the 'small_array' in ascending order.
            // The comparison function 'a < b ? -1 : 1' ensures numerical sort.
            // Then, pick the element at index 1 (the middle element) from the sorted array.
            array_i_next[  j  ]  =  small_array.sort(
                function(  a  ,  b  )
                {
                    return  (  a  <  b  ?  -1  :  1  )  ;
                }
            )  [  1  ]  ;
        }

        // Return the computed next array.
        return  array_i_next  ;
    }


    // Initialize 'array_i' with the initially populated 'array_N'.
    var  array_i  =  array_N  ;

    // Continue processing the array until it contains only one element.
    while  (  array_i.lenth  >  1  )
    {
        // Call the 'getArrayNext' function to transform 'array_i' for the next iteration.
        array_i  =  getArrayNext(  array_i  )  ;
    }

    // Finally, print the single remaining element from 'array_i' to the console.
    console.log(  '%d'  ,  array_i[  0  ]  )  ;
}


/*
 * The following line handles standard input and calls the Main function.
 * It should not be modified.
 */
Main(  require(  "fs"  ).readFileSync(  "/dev/stdin"  ,  "utf8"  )  )  ;