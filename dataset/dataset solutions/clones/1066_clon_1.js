/*
 * This is a Type I clone of the original JavaScript code.
 * The purpose of this clone is to demonstrate strict adherence to the
 * Type I definition, meaning only whitespace and comments are altered.
 * No changes to identifiers, variable names, function names, operators,
 * or expressions are permitted.
 *
 * The original code implements a counting sort algorithm.
 * It reads numerical data from standard input, sorts it, and
 * outputs the sorted data to standard output.
 */

(  function   main  (   )
{

  //  Initialize a constant 'lines' by reading the entire content
  //  of standard input, decoding it as UTF-8, removing leading/trailing
  //  whitespace, and then splitting it into an array of strings by newline characters.
  const   lines   =   require ( 'fs' ) . readFileSync ( '/dev/stdin' , 'utf8' ) . trim ( ) . split ( '\n' ) ;


  //  Extract the first line from the 'lines' array.
  //  This line is expected to contain the count of elements, 'n'.
  //  Convert this string to a number and store it in the constant 'n'.
  const   n   =   Number ( lines . shift ( ) ) ;


  //  Extract the next line from the 'lines' array.
  //  This line is expected to contain the space-separated array elements.
  //  Split this string by spaces, and then map each resulting string
  //  to its numerical equivalent, storing the result in 'arr'.
  const   arr   =   lines . shift ( ) . split ( ' ' ) . map ( Number ) ;


  //  Define a constant 'k' representing the maximum possible value
  //  (plus one) that can be present in the input array 'arr'.
  //  This value determines the size of the counting array.
  const   k   =   10000 ;


  //  Declare a mutable variable 'cnt_arr' to serve as the counting array.
  //  It will store the frequency of each number.
  let   cnt_arr   =   [ ] ;


  //  Initialize all elements of the 'cnt_arr' to zero.
  //  This loop ensures that each count starts from a clean slate.
  for   (   let   i   =   0 ;   i   <   k ;   i ++   )
  {
    cnt_arr [ i ]   =   0 ;
  }


  //  Iterate through the input array 'arr' to populate 'cnt_arr'.
  //  For each number found in 'arr', increment its corresponding count
  //  in 'cnt_arr'.
  for   (   let   i   =   0 ;   i   <   n ;   i ++   )
  {
    cnt_arr [ arr [ i ] ] ++ ;
  }


  //  Transform 'cnt_arr' into a cumulative count array.
  //  After this loop, 'cnt_arr[i]' will store the number of elements
  //  in the original 'arr' that are less than or equal to 'i'.
  for   (   let   i   =   1 ;   i   <   k ;   i ++   )
  {
    cnt_arr [ i ]   +=   cnt_arr [ i   -   1 ] ;
  }


  //  Declare a mutable variable 'out_arr' which will hold the sorted output.
  out_arr   =   [ ] ;


  /*
   *  This is the final step of the counting sort: building the sorted array.
   *  The loop iterates backwards from 'n' down to '0'.
   *  For each element 'arr[i]' in the input array:
   *  1. It uses 'cnt_arr[arr[i]]' to find the correct 1-based position
   *     for 'arr[i]' in the sorted output.
   *  2. It places 'arr[i]' into 'out_arr' at that position.
   *  3. The post-decrement operator '--' reduces 'cnt_arr[arr[i]]' by one,
   *     to correctly handle duplicate elements and place them in preceding positions.
   *
   *  Note: The loop condition `i = n` and array access `arr[i]` for `i=n`
   *  are preserved exactly as in the original code, respecting Type I constraints.
   */
  for   (   let   i   =   n ;   i   >=   0 ;   i --   )
  {
    out_arr [ cnt_arr [ arr [ i ] ] -- ]   =   arr [ i ] ;
  }


  //  Join all elements of the 'out_arr' with a single space between them.
  //  Write the resulting string to standard output using 'process.stdout.write'.
  process . stdout . write ( out_arr . join ( ' ' ) ) ;


} ) ( ) ;