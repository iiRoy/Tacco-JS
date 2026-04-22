/* This is the main function that processes the input data.
 * It is designed to find a specific word within a grid-like structure
 * represented by the input string and generate a unique identifier
 * for its location. */
function   Main  (  input  )   {

    // Ensure the input string has no leading or trailing whitespace.
    input  =  input.trim  (  )  ;

    // Define a string containing all uppercase English alphabet letters.
    // This will be used to map column indices to letters.
    var   alphaList   =   "abcdefghijklmnopqrstuvwxyz".toUpperCase  (  )  ;

    // Initialize an empty string that will accumulate the final output.
    var   output   =   ""  ;

    /*
     * Parse the dimensions of the grid from the first line of the input.
     * The dimensions are expected to be two space-separated integers:
     * H (height/number of rows) and W (width/number of columns).
     */
    var   H   =   parseInt  (  input.split  (  "\n"  )  [  0  ]  .split  (  " "  )  [  0  ]  )  ;
    var   W   =   parseInt  (  input.split  (  "\n"  )  [  0  ]  .split  (  " "  )  [  1  ]  )  ;


    // Iterate through each row of the grid, starting from the second line of input
    // (index 1, as index 0 contains H and W).
    // The loop runs from 1 up to H (inclusive) to match 1-based row indexing.
    for   (  var   i   =   1  ;   i   <=   H  ;   i  ++  )   {
        // Extract the current row's data and split it into individual cells (words)
        // based on spaces.
        var   tmp   =   input.split  (  "\n"  )  [  i  ]  .split  (  " "  )  ;

        // Iterate through each cell (word) within the current row.
        // The loop runs from 1 up to the length of the row (inclusive)
        // to match 1-based column indexing.
        for   (  var   j   =   1  ;   j   <=   tmp.length  ;   j  ++  )   {
            // Check if the current cell's content matches the target string "snuke".
            // Note: `j - 1` is used to access the 0-based array index.
            if   (  tmp  [  j   -   1  ]   ==   "snuke"  )   {
                // If "snuke" is found, append its column letter (A, B, C...)
                // and its row number to the output string.
                // `alphaList.slice(j - 1, j)` gets the j-th letter (1-based).
                output   +=   alphaList.slice  (  j   -   1  ,  j  )   +   i  ;
            }
        }
    }

    // Finally, print the accumulated output string to the console.
    console.log  (  output  )  ;

} // End of the Main function definition.


// This line calls the Main function, providing it with input read from
// standard input. This is a common pattern for competitive programming
// environments in Node.js.
Main  (  require  (  "fs"  )  .readFileSync  (  "/dev/stdin"  ,   "utf8"  )  )  ;