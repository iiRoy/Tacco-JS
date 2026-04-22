/*
 * This script processes input from stdin.
 * It calculates a specific count based on numerical operations.
 *
 */
process  .  stdin  .  resume  (  )  ;
process  .  stdin  .  setEncoding  (  'utf8'  )  ;
// The above lines are standard boilerplate for competitive programming in Node.js.


function   Main  (  input  )   {
    // The main function where the core logic resides.

    input  =  input  .  split  (  "\n"  )  ;  // Split input string by newline characters.

    let   n   =   input  [  0  ]  .  split  (  " "  )  .  map  (  Number  )  ;  // First line might contain 'n' (not explicitly used later for 'n' though)
                                                                       // This 'n' is then shadowed.

    input  .  shift  (  )  ;  // Remove the first element (which was processed as 'n' above).

    let   a   =   input  .  map  (  x  =>  Number  (  x  )  )  ;  // Convert remaining input lines to an array of numbers.

    // Redefining 'n' here to be the actual length of array 'a'.
    let   n   =   a  .  length  ;
    let   M   =   new   Array  (  n  )  ;  // Initialize an array M of size n.

    /*
     * The following block is commented out in the original code.
     * It seems to be for calculating prefix products, but it's not used.
     * M[0] = a[0];
     * for (let i = 1; i < n; i++) {
     *     M[i] = M[i - 1] * a[i];
     * }
     * console.log(M);
     */

    let   count   =   0  ;  // Initialize a counter for integer products.

    // Nested loops to iterate through all unique pairs (i, j) where i <= j.
    for  (  let   i  =  0  ;   i  <  n  ;   i  ++  )   {
        for  (  let   j  =  i  ;   j  <  n  ;   j  ++  )   {
            let   m   =   a  [  i  ]  *  a  [  j  ]  ;  // Calculate the product of two elements.

            // Check if the product 'm' is an integer.
            if  (  Number  .  isInteger  (  m  )  )  {
                count  ++  ;  // Increment count if it's an integer.
            }
        }
    }

    console  .  log  (  count  )  ;  // Output the final count.

} // End of Main function.


// Call the Main function with input read from /dev/stdin.
Main  (  require  (  "fs"  )  .  readFileSync  (  "/dev/stdin"  ,  "utf8"  )  )  ;
// The line below is a commented-out example call for local testing.
// Main("5\n7.5\n2.4\n17.000000001\n17\n16.000000000");