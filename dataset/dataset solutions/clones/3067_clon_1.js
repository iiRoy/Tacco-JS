function   main (   i   )
{
  /*
   * This function processes a multi-line string input.
   * It calculates a specific sum based on numerical values derived from the input.
   */

  // First, the input string 'i' is split into an array of individual lines.
  // Each line is expected to contain a number.
  i   =   i .   split (   '\n'   ) ;


  // Declaring an array 'a'. This variable is not utilized in the subsequent logic.
  const   a   =   [ ] ;


  // The 'map' method is applied to the array 'i'.
  // For each element 'n' (which is a string representing a number):
  //   - It's converted to a number.
  //   - If the number is a multiple of 10 (i.e., its remainder when divided by 10 is 0),
  //     it forms a pair: [original_number, 10].
  //   - Otherwise, it forms a pair: [original_number, last_digit (number % 10)].
  // The resulting array of pairs is assigned to the variable 'f'.
  f   =   i .   map (   n   =>
  {
    if   (   Number (   n   )   %   10   ===   0   )
    {
      return   [   Number (   n   ) ,   10   ] ;
    }
    return   [   Number (   n   ) ,   Number (   n   )   %   10   ] ;
  } ) ;


  // The array 'f' is then sorted.
  // The sorting criterion is based on the second element (index 1) of each pair.
  // It sorts in ascending order of these second elements.
  f .   sort (   (   a ,   b   )   =>   a [   1   ]   -   b [   1   ]   ) ;


  // A variable 'answer' is initialized to zero.
  // This variable will accumulate the final calculated sum.
  var   answer   =   0 ;


  // The 'forEach' method iterates over each 'item' (pair) in the sorted array 'f'.
  // The 'index' of the current item is also provided.
  f .   forEach (   (   item ,   index   )   =>
  {
    // Conditional logic based on the item's position in the array.
    if   (   index   ===   0   )
    {
      // If it's the very first item (index 0), its first element (original number)
      // is added directly to the 'answer'.
      answer   +=   item [   0   ] ;
    }
    else
    {
      // For all subsequent items (index > 0):
      //   - The first element of the item is divided by 10.
      //   - The ceiling of this result is taken (rounded up to the nearest whole number).
      //   - This ceiling value is then multiplied by 10.
      //   - The final product is added to the 'answer'.
      answer   +=   Math .   ceil (   item [   0   ]   /   10   )   *   10 ;
    }
  } ) ;


  // Finally, the calculated 'answer' is printed to the console.
  console .   log (   answer   ) ;
}


/*
 * This is the main execution call for the script.
 * It reads content from '/dev/stdin' synchronously using Node.js's 'fs' module.
 * The content is read as a UTF-8 string and then passed as an argument to the 'main' function.
 */
main (   require (   'fs'   ) .   readFileSync (   '/dev/stdin' ,   'utf8'   )   ) ;