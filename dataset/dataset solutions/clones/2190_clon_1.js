/*
 * This is an example of a JavaScript program.
 * It processes input from standard input and prints a result.
 */
function   Main ( input )   {
   // The input string is initially split by newline characters.
   input = input . split ( "\n" ) ;

   // Check if the last element is an empty string, which happens if the input ends with a newline.
   if ( input [ input . length - 1 ] === '' )
   {
      // If it's an empty string, remove it from the array.
      input . pop ( ) ;
   }


   // Extract the value for H from the first line of input.
   // The '-0' converts the string to a number, ensuring numerical comparison later.
   const   H   =   input [ 0 ] . split ( ' ' ) [ 0 ]   -   0 ;

   // Extract the value for N from the first line of input.
   // This value N is read but not used in the current logic, typical in competitive programming.
   const   N   =   input [ 0 ] . split ( ' ' ) [ 1 ]   -   0 ;


   // Process the second line of input to get array A.
   // Each element is split by space and then converted to a number using the map function.
   const   A   =   input [ 1 ] . split ( ' ' ) . map (   e   =>   {
      return   e   -   0 ;   // Convert string element 'e' to a number.
   } ) ;


   // Calculate the sum of elements in array A using the reduce method.
   // Then, compare the calculated sum with the value of H.
   // If the sum is greater than or equal to H, print 'Yes'; otherwise, print 'No'.
   console . log ( A . reduce ( ( acc , cur )   =>   {   return   acc + cur ;   } )   >=   H   ?   'Yes'   :   'No' ) ;

}   // End of Main function definition.



/*
 * DO NOT EDIT BELOW THIS LINE.
 * This section handles reading from standard input and calling the Main function.
 * It ensures the program can be run directly from a standard environment,
 * typically used in online judges or similar platforms.
 */
Main ( require ( "fs" ) . readFileSync ( "/dev/stdin" ,   "utf8" ) ) ;