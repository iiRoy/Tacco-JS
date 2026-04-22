/* This is a Type I clone of an original JavaScript program.
 * All identifiers, operators, and expressions are kept exactly
 * the same as in the source code.
 * Only whitespace (spaces, tabs, newlines) and comments have been
 * altered to create a visually distinct but logically identical version.
 */

// The primary function that encapsulates the entire logic of the application.
function   main   (   input   )
{

  // First, we parse the raw input string.
  // It's expected to be a multi-line string, so we split it by newline characters.
  const   args   =   input . split ( '\n' ) ;


  // The first line of the input (args[0]) contains two space-separated integers: N and K.
  // We split this line by spaces to get an array of these two string representations.
  const   ary1   =   args [ 0 ] . split ( ' ' ) ;


  // N represents the total number of elements (though not directly used in the sum logic here).
  // We parse the first element of 'ary1' into an integer, specifying base 10.
  const   N   =   parseInt ( ary1 [ 0 ] ,   10 ) ;


  // K represents the number of largest elements we need to sum.
  // We parse the second element of 'ary1' into an integer, base 10.
  const   K   =   parseInt ( ary1 [ 1 ] ,   10 ) ;


  // The second line of the input (args[1]) contains a list of numbers, also space-separated.
  // We perform a series of operations:
  // 1. Split the string by spaces to get an array of number strings.
  // 2. Use 'map' to convert each number string into an actual integer.
  // 3. Use 'sort' to arrange these integers in descending order (largest to smallest).
  const   ary2   =   args [ 1 ] . split ( ' ' ) . map (   n   =>   parseInt ( n )   ) . sort (   (   a   ,   b   )   =>   {

      return   b   -   a

  }   ) ;


  // Initialize our accumulator variable 'ans' to zero.
  // This variable will hold the sum of the top K elements.
  let   ans   =   0 ;


  // We iterate 'K' times to sum the 'K' largest numbers.
  // Since 'ary2' is sorted in descending order, the first 'K' elements are the largest.
  for   (   let   i   =   0   ;   i   <   K   ;   i ++   )
  {
      // Add the current largest element from 'ary2' to our 'ans' variable.
      ans   +=   ary2 [ i ] ;
  }


  // Finally, we print the calculated sum to the standard output.
  console . log ( ans ) ;

} // End of the main function definition.


// This section handles the execution of the main function.
// It reads the input from '/dev/stdin' (standard input on Unix-like systems)
// as a UTF-8 encoded string and passes it to the 'main' function.
main (   require ( 'fs' ) . readFileSync (   '/dev/stdin'   ,   'utf8'   )   ) ;