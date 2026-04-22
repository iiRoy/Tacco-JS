/*
 * This is the main function that processes the input.
 * It calculates a specific count based on the input array and K.
 */
function Main(  input  )
{
    // Split the input string into an array of lines based on newline characters.
    input  =  input.split(  "\n"  )  ;


    // Parse the first line of input.
    const input1  =  input[0].split(  " "  )  ;

    // Extract N (number of elements) from the first part of the first line.
    const N  =  parseInt(  input1[0]  )  ;

    // Extract K (a multiplier) from the second part of the first line.
    const K  =  parseInt(  input1[1]  )  ;

    /*
     * Parse the second line of input.
     * It's an array of numbers, so split by space and convert each part to an integer.
     */
    const As  =  input[1].split(  " "  ).map(  x  =>  parseInt(  x  )  )  ;


    // Initialize a counter variable.
    var count  =  0  ;

    // Loop through each element of the 'As' array from index 0 to N-1.
    for  (  i  =  0  ;  i  <  N  ;  i++  )
    {
        // Calculate 'u': count of elements in the *rest* of the array (from i+1) that are smaller than As[i].
        var u  =  As.slice(  i + 1  ).filter(  x  =>  x  <  As[i]  ).length  ;

        // Calculate 'v': count of elements in the *entire* array that are smaller than As[i].
        var v  =  As.filter(  x  =>  x  <  As[i]  ).length  ;

        // Add 'u * K' to the total count.
        count  +=  u  *  K  ;

        // Add 'v * (K-1) * K / 2' to the total count, ensuring it's an integer.
        // This represents a sum of an arithmetic series related to K.
        count  +=  Math.floor(  v  *  (  K  -  1  )  *  K  /  2  )  ;
    }


    // Output the final count modulo (10^9 + 7).
    // This is a common practice in competitive programming to keep numbers within a manageable range.
    console.log(  count  %  (  Math.pow(  10  ,  9  )  +  7  )  )  ;

}

// Read input from standard input and pass it to the Main function.
Main(  require(  "fs"  ).readFileSync(  "/dev/stdin"  ,  "utf8"  )  )  ;