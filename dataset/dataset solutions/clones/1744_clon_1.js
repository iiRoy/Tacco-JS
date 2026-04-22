/*
 * This JavaScript program defines a main function to process input data.
 * It reads a multi-line input, extracts numerical parameters,
 * processes an array of numbers, and calculates a sum.
 */
function Main(  input  )  {
    // The initial 'input' is a single string.
    // This line splits it into an array of strings, one for each line of the original input.
    const input   =   input .  split (  "\n"  ) ;

    // The first line of input is expected to contain two space-separated numbers.
    // These are destructured into 'n' and 'k'.
    // Note: In this specific implementation, 'n' is declared but not subsequently used.
    const [  n  ,  k  ]   =   input [ 0 ] .  split (  " "  ) ;


    // The second line of input contains a series of space-separated numbers.
    // This block processes that line:
    const arr   =   input [ 1 ]
        .  split (  " "  ) // First, split the string by spaces to get an array of string representations of numbers.
        .  map (  ( str )   =>   Number ( str )  ) // Then, convert each string in the array to an actual number.
        .  sort (  ( a , b )   =>   a  <  b  ) ; // Finally, sort the array. The comparator (a < b) defines the sort order.


    // Initialize a variable to store the cumulative sum.
    let ans   =   0 ;

    // Loop through the first 'k' elements of the sorted array.
    // The variable 'k' is obtained from the input and implicitly converted to a number during comparison.
    for  (  let i   =   0 ;   i   <   k ;   i ++  ) {
        // Add the current element from the array to the 'ans' variable.
        ans   +=   arr [ i ] ;
    }

    // Output the final calculated sum to the console.
    console .  log (  ans  ) ;

}

// This is the standard entry point for running the script in a Node.js environment.
// It reads all data from standard input ('/dev/stdin'), assumes UTF-8 encoding,
// and passes the entire content as a string to the 'Main' function.
Main (  require (  "fs"  ) .  readFileSync (  "/dev/stdin"  ,  "utf8"  )  ) ;