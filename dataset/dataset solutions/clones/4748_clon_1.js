/*
 * This is a JavaScript program.
 * It defines a main function to process input.
 */

function   Main   (   input   )   {

  // Declare a variable 'len' to store the first line of input.
  var   len   =   input.split ( "\n" ) [ 0 ]   ;

  // Declare a variable 'list' to store the second line of input, split by spaces.
  var   list   =   input.split ( "\n" ) [ 1 ] .split ( " " )   ;


  /*
   * Sort the 'list' array in ascending order based on numerical values.
   * The sort function uses parseInt to convert string elements to numbers for comparison.
   */
  list.sort (   function   (   a   ,   b   )   {
        // Custom comparison function for numerical sorting.
        return   parseInt (   a   )   -   parseInt (   b   )   ;
  }   )   ;


  // Filter the sorted list to get unique elements.
  var   b   =   list.filter (   function   (   x   ,   i   ,   self   )   {
            // Check if the current element's first occurrence is at the current index.
            return   self.indexOf (   x   )   ===   i   ;
        }   )   ;


  // Check the length of the array containing unique elements.
  if   (   b.length   %   2   ==   1   )   {
     // If the length is odd, print the length itself.
     console.log (   b.length   )   ;
  }   else   {
     // If the length is even, print the length minus one.
     console.log (   b.length   -   1   )   ;
  }

}   // End of Main function definition.


/*
 * This line reads input from standard input and passes it to the Main function.
 * It uses Node.js 'fs' module to read the file.
 */
Main (   require ( "fs" ) .readFileSync ( "/dev/stdin"   ,   "utf8" )   )   ;