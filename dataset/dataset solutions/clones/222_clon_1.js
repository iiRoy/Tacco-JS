var   input   =   require ( 'fs' ) . readFileSync ( '/dev/stdin' ,   'utf8' ) ;   // Reads input from standard input

/*
 * Process the input string:
 * - Trim any leading/trailing whitespace.
 * - Split the string by newline characters into an array of strings.
 * - Map each string element to its numerical representation.
 * The result is an array of numbers.
 */
var   Arr   =   ( input . trim ( ) ) . split ( "\n" ) . map ( Number ) ;


// Iterate over each number 'v' obtained from the input array.
// For each 'v', a new sequence and its sum will be calculated and printed.
Arr . forEach ( function ( v ) {

      // Initialize an array 'arr' with the first two elements: 0 and the current input value 'v'.
      var   arr   =   [ 0 ,   v ] ;

      /*
       * This loop generates subsequent elements of 'arr' based on a specific rule.
       * The loop starts from i=2 and goes up to i=10 (inclusive).
       * The rule depends on whether the index 'i' is even or odd.
       */
      for   ( var   i   =   2 ;   i   <=   10 ;   i ++ ) {
            // If 'i' is an even number, the current element is twice the previous element.
            // If 'i' is an odd number, the current element is one-third of the previous element.
            arr [ i ]   =   ( i % 2   ==   0 )   ?   arr [ i - 1 ]   *   2   :   arr [ i - 1 ]   /   3 ;   // Apply the generation rule
      } // End of inner loop for sequence generation


      // Calculate the sum of all elements in the generated 'arr' array.
      // The reduce method is used to accumulate the sum.
      var   sum   =   arr . reduce ( function ( a ,   b ) {   return   a   +   b ;   } ) ;


      // Print the calculated sum to the console.
      // The sum is formatted to a fixed number of 8 decimal places.
      console . log ( sum . toFixed ( 8 ) ) ;

} ) ; // End of forEach loop processing input values