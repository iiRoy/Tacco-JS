/*
 * This is a Type I clone of the original JavaScript code.
 * It maintains exact structural and lexical identity,
 * only varying in whitespace and comments.
 */

// Define the main function to process input
function   Main ( inp  )  {
  // Split the input string by newline characters
  inp  =  inp . split (  "\n"  ) ;


  // Convert the first line to a number, representing 'n'
  let   n   =   +inp [ 0 ] ;

  // Split the second line by spaces to get an array 'a'
  let   a   =   inp [ 1 ] . split (  " "  ) ;

  // Initialize a dictionary (object) to store sum frequencies.
  // Start with sum 0 having a frequency of 1, as an empty prefix has sum 0.
  let   sums   =   {  0 : 1  } ;

  // Initialize the running sum
  let   sum   =   0 ;

  /*
   * Iterate through the array 'a' to calculate prefix sums
   * and store their frequencies in the 'sums' object.
   */
  for  ( let   i   =   0 ;   i   <   n ;   i ++  )  {
    // Add the current element (converted to number) to the running sum
    sum   +=   +a [ i ] ;

    // Check if the current sum already exists in 'sums'
    // If it does, increment its count; otherwise, initialize it to 1.
    if  ( sums [ sum ]  )  {
      sums [ sum ] ++ ;
    }  else  {
      sums [ sum ]   =   1 ;
    }
  }

  // Initialize the answer variable and a temporary variable 'j'
  let   ans   =   0 ,   j ;

  // Iterate over the keys (sums) in the 'sums' object
  for  ( let   i   in   sums  )  {
    // If a sum 'i' has a frequency 'j' (which means j > 0)
    if  ( j   =   sums [ i ]  )  {
      // Add the number of pairs for this sum to the total answer.
      // The formula n*(n-1)/2 calculates combinations of 2 items from n.
      ans   +=   j   *   ( j   -   1 )   /   2 ;
    }
  }

  // Output the final calculated answer to the console.
  console . log (  ans  ) ;
} // End of Main function


/*
 * This section reads input from standard input,
 * and then calls the Main function with that input.
 */
Main (  require (  "fs"  ) . readFileSync (  "/dev/stdin" ,   "utf8"  )  ) ;

// End of file