/* This is a Type I clone of the original JavaScript code.
   The purpose is to demonstrate that only whitespace and comments
   are altered, while the core logic remains identical. */

// The 'input' parameter will contain the entire input data provided to the function.
function Main(  input  )

{

    // The first line of input is in input[0], the second in input[1], and so on.
    // Initialize the answer variable with a default positive value.
    var   ans   =   "Yes"   ;


    // Process the raw input string: trim whitespace and split into lines.
    input   =   input.trim( ) .split( "\n" )   ;

    // Parse the first line to get N and M.
    const   [   N  ,  M   ]   =   input[0].split( " " ) .map( (n) => parseInt(n) )   ;

    // Parse the second line to get the array 'a'.
    var   a   =   input[1].split( " " ) .map( (n) => parseInt(n) )   ;


    // Sort array 'a' in descending order.
    a.sort(  (a, b)  =>  b - a  )   ;


    // Extract the top M elements from the sorted array.
    var   top   =   a.slice(  0, M  )   ;

    // Calculate the limiting value based on the problem's condition.
    // This value is (sum of all elements) / (4 * M).
    const   lim   =   (  1   *   arrsum(a)  )   /   (  4   *   M  )   ;

    // Check the condition: if the M-th element (last in 'top') is less than the limit.
    if   (   top[  top.length - 1  ]   <   lim   )
    {

        // If the condition is met, the answer is "No".
        ans   =   "No"   ;

    }


    /**
     * Helper function to calculate the sum of all elements in an array.
     * @param {Array<number>} arr - The array of numbers to sum.
     * @returns {number} The total sum of the array elements.
     */
    function   arrsum(   arr   )
    {
        return   arr.reduce(  (  c, a, i, self  )   =>
        {
            return   c   +   a   ;
        }  )   ;
    }


    // Output the final answer to the console.
    console.log(  ans  )   ;

}

/*
 * Do not modify the code below this line.
 * It handles standard input/output operations,
 * reading all input at once and calling the Main function.
 */
Main(  require(  "fs"  ) .readFileSync(  "/dev/stdin"  ,  "utf8"  )  )   ;
// Example for local testing: Main( require("fs").readFileSync("./input.txt", "utf-8") );