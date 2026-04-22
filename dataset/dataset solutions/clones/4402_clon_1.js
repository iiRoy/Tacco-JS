// This is the primary function definition for the application.
function   main   (   input   )
{
  // Initialize 'max1' to store the largest number found so far.
  var   max1   =   0   ;
  // Initialize 'max2' to store the second largest number found.
  var   max2   =   0   ;
  // 'once' array will keep track of elements that have appeared an odd number of times.
  var   once   =   [ ]   ;


  // Split the input string by newline characters.
  var   tmp   =   input .   split   (   '\n'   )   ;
  // The actual data array 'A' is extracted from the second line of the input.
  var   A   =   tmp   [   1   ] .   split   (   ' '   )   ;

  // Declare a variable 'key' to store the index of an element within 'once'.
  var   key   ;
  // Iterate through each element of the array 'A'.
  for   (   var   i   =   0   ;   i   <   A .   length   ;   i   ++   )
  {
    // Use the custom 'index' method to check if A[i] exists in 'once'.
    key   =   once .   index   (   A   [   i   ]   )   ;
    // If 'key' is -1, the element is not in 'once', meaning it's a first occurrence.
    if   (   key   ===   -1   )
    {
      // Add the element to 'once'.
      once .   push   (   A   [   i   ]   )   ;
    }
    // If 'key' is not -1, the element is already in 'once', meaning it's a duplicate.
    else
    {
      // Remove the duplicate from 'once'.
      once .   splice   (   key   ,   1   )   ;
      // Convert the string element to a number for comparison.
      // Check if the current number is greater than 'max2'.
      if   (   max2   <   Number   (   A   [   i   ]   )   )
      {
        // If it's also greater than 'max1', update both 'max1' and 'max2'.
        if   (   max1   <   Number   (   A   [   i   ]   )   )
        {
          max2   =   max1   ;
          max1   =   Number   (   A   [   i   ]   )   ;
        }
        // Otherwise, update only 'max2' as it's between 'max1' and the current number.
        else
        {
          max2   =   Number   (   A   [   i   ]   )   ;
        }
      }
    }
  }
  // After processing all elements, log the product of 'max2' and 'max1'.
  console .   log   (   max2   *   max1   )   ;
  // These console.log statements were commented out in the original code.
  // console.log(A);
  // console.log(once);
  // console.log(max1, max2);
}

/*
 * This self-executing anonymous function extends the Array.prototype
 * by adding a custom 'index' method, which behaves similarly to indexOf.
 */
Array .   prototype .   index   =   (   function   (   undefined   )
{
  // A local variable 'f' used to store the effective starting index for the search.
  var   f   ;

  // The function that will be assigned to Array.prototype.index.
  return   function   (   val   ,   from   )
  {
    // Check if a starting index 'from' was provided by the caller.
    if   (   from   !==   undefined   )
    {
      // If 'from' is negative, calculate the effective index from the end of the array.
      if   (   from   <   0   )
      {
        f   =   from   +   this .   length   ;

        // If the calculated index is still negative, the search range is invalid.
        if   (   f   <   0   )
          return   -1   ;
      }
      // If 'from' is non-negative, use it directly as the starting index.
      else
      {
        f   =   from   ;
      }
    }
    // If 'from' was not provided, default to starting the search from the beginning.
    else
    {
      f   =   0   ;
    }

    // Loop through the array elements starting from the determined index 'f'.
    for   (   var   i   =   f   ;   i   <   this .   length   ;   i   ++   )
    {
      // If the current element matches the 'val', return its index.
      if   (   this   [   i   ]   ===   val   )
        return   i   ;
    }

    // If the loop completes without finding the 'val', return -1.
    return   -1   ;
  }
}   )   ( )   ;

// Call the main function, reading input from standard input using Node.js 'fs' module.
main   (   require   (   "fs"   ) .   readFileSync   (   "/dev/stdin"   ,   "utf8"   )   )   ;