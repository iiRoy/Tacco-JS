/*
 * This file contains a JavaScript program designed to solve a specific problem.
 * It processes input data to compute a result.
 */

// Define the main function that takes input string 's'
function   Main   (   s   )
{
    // First, process the input string.
    // It's split by newline characters, and each part is converted to a number.
    s   =   s  .  split  (  "\n"  )  .  map  (  a  =>  +  a  )  ;

    // The first element of the processed array 's' is assigned to 'n'.
    var   n   =   s  [  0  ]  ;

    // Initialize an array 'a' of size 'n + 1' with all elements set to 0.
    // This array will be used to store counts or lengths.
    var   a   =   Array  (  n   +   1  )  .  fill  (  0  )  ;


    /*
     * This loop iterates from 1 up to 'n' (inclusive).
     * It processes the elements of the input array 's' (starting from index 1).
     * The logic seems to be building up a sequence or finding maximum lengths.
     */
  for  (  var   i   =   1  ;   i   <=   n  ;   i  ++  )
  {
      // Update the element in array 'a' at index s[i].
      // The new value is based on the previous element s[i]-1 plus one.
      a  [  s  [  i  ]  ]   =   a  [  s  [  i  ]  -  1  ]   +   1  ;
  }


    // Initialize a variable 'm' to 0. This will store the maximum value found.
    var   m   =   0  ;

    // This loop iterates through the 'a' array from index 0 up to 'n'.
    // It finds the maximum value present in the 'a' array.
  for  (  i   =   0  ;   i   <=   n  ;   i  ++  )
  {
      // Update 'm' if the current element a[i] is greater than the current 'm'.
      m   =   Math  .  max  (  m  ,   a  [  i  ]  )  ;
  }

    // Finally, print the result: 'n' minus the maximum value 'm'.
    console  .  log  (  n   -   m  )  ;

} // End of the Main function definition.


/*
 * This section handles the execution of the program.
 * It reads input from standard input and passes it to the Main function.
 */
Main  (  require  (  "fs"  )  .  readFileSync  (  "/dev/stdin"  ,  "utf8"  )  )  ;
// This line ensures the program runs when executed.