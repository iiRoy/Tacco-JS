/*
 * This JavaScript code processes input data from standard input.
 * It reads lines, parses numbers, and performs calculations.
 * The main goal is to format and display numerical data.
 */
var   input  = require ( 'fs' ) . readFileSync ( '/dev/stdin' ,  'utf8' ) ; // Read all input as a UTF-8 string

// Process the raw input string: trim leading/trailing whitespace and split into lines.
var Arr = ( input . trim ( ) ) . split ( "\n" ) ;

var data = [ ] ; // This array will store arrays of processed numbers.

var N ; // N will store the number of columns expected for the current data block.

/*
 * Iterate through each line of the input array.
 * Each line could either define a new block of data (if it has one number)
 * or be a row of data for the current block (if it has multiple numbers).
 */
for ( var i = 0 ; i < Arr . length ; i ++ ) {

   // Parse the current line: split by space, then convert each part to a number.
   var arr = Arr [ i ] . split ( " " ) . map ( Number ) ;

   /*
    * Check the length of the parsed array.
    * If it's 1, it signifies a control line (either setting N or terminating a block).
    * If it's more than 1, it's a data row.
    */
   if ( arr . length == 1 ) {

      // If this is the very first line of input and it has one element,
      // it sets the initial value of N.
      if ( i == 0 ) {
         N = arr [ 0 ] ; // Assign the single number to N.
         continue ;      // Skip to the next iteration of the loop.
      }

      // If we reach here, it means a block of data has just finished,
      // or a new block is being initialized.
      var DATA = [ ] ; // This array will store the column sums for the current block.

      // Initialize DATA array with zeros, based on N + 1 (for the sum column).
      for ( var j = 0 ; j < N + 1 ; j ++ ) {
         DATA . push ( 0 ) ;
      }

      // Iterate over each row of data collected in the 'data' array for the current block.
      data . forEach ( function ( v ) {
         // Accumulate column sums.
         for ( var k = 0 ; k < N + 1 ; k ++ ) {
            DATA [ k ] += v [ k ] ;
         }

         // Format each number in the row 'v' to be right-aligned in a 5-character width.
         v = v . map ( function ( val ) {
            return ( "     " + val ) . slice ( -5 ) ;
         } ) ;

         // Print the formatted row.
         console . log ( v . join ( "" ) ) ;
      } ) ;

      // After processing all rows, format the accumulated column sums.
      DATA = DATA . map ( function ( val ) {
         return ( "     " + val ) . slice ( -5 ) ;
      } ) ;

      // Print the formatted sums row.
      console . log ( DATA . join ( "" ) ) ;

      // If the single number on the control line is 0, it signals the end of input processing.
      if ( arr [ 0 ] == 0 ) {
         break ;
      }

      // Reset the 'data' array for the next block.
      data = [ ] ;

      // Set N for the next block of data.
      N = arr [ 0 ] ;

   } else {
      // This block handles lines that are actual data rows (more than one number).

      // Calculate the sum of all numbers in the current row.
      var sum = arr . reduce ( function ( a , b ) {
         return a + b ;
      } ) ;

      // Add the calculated sum as the last element of the current row.
      arr . push ( sum ) ;

      // Add the modified row (with sum) to the 'data' array for the current block.
      data . push ( arr ) ;
   }
}
// End of file.