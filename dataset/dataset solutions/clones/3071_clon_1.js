/*
 * This is the primary function that processes the input.
 * It takes a single string 'input' as its argument.
 */
function  Main (  input  )
{
  // The input string is expected to contain multiple lines.
  // We split the input string by the newline character.
  // The resulting array 'tmp' will hold each line as a string element.
  tmp  =  input .split ( "\n" ) ;


  // After splitting, each element in 'tmp' is still a string.
  // We then use the 'map' method to convert every string element
  // in the 'tmp' array into its numerical representation.
  tmp  =  tmp .map ( Number ) ;


  // The first element of the numerical array 'tmp' is assigned to 'N'.
  N  =  tmp [ 0 ] ;


  // We calculate the minimum value among the elements from index 1 to 5.
  // This minimum value is then stored in the variable 'm'.
  m  =  Math .min ( tmp [ 1 ] ,  tmp [ 2 ] ,  tmp [ 3 ] ,  tmp [ 4 ] ,  tmp [ 5 ] ) ;


  // The final 'answer' is computed based on 'N' and 'm'.
  // It involves dividing 'N' by 'm', taking the ceiling of that result,
  // and then adding 4 to it.
  answer  =  4  +  Math .ceil ( N  /  m ) ;


  // The calculated 'answer' is then printed to the console.
  console .log ( answer ) ;

} // End of the Main function definition.


/*
 *  ----------------------------------------------------------------------
 *  DO NOT MODIFY THE CODE BELOW THIS LINE.
 *  This section is responsible for reading standard input and
 *  invoking the 'Main' function with the collected input.
 *  ----------------------------------------------------------------------
 */
Main ( require ( "fs" ) .readFileSync ( "/dev/stdin" ,  "utf8" ) ) ;