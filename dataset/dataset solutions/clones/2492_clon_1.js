function    myin  (  )   {
  return   require (  "fs"  ) .  readFileSync  (  "/dev/stdin"  ,  "utf8"  ) .  trim  (  )  ;
}

/**
 *  Outputs the given value to the console.
 *  This serves as the standard output function for the script.
 *  @param {any} t - The value to be printed.
 */
function   myout (  t  )
{
  console .  log (  t  )  ;
}

/*
 *  myconv transformation parameters:
 *  0: Do nothing, return input as is.
 *  1: Convert to integer using parseInt.
 *  2: Split by half-width space into a string array.
 *  3: Split by newline character into a string array.
 *  4: Split by half-width space, then convert each element to a number.
 *  5: Split by newline character, then convert each element to a number.
 *  6: Split into an array of single characters.
 *  7: Split into an array of single characters, then convert each to a number.
 */
function   myconv  (  i  ,  no  )
{
  switch (  no  )
  {
    case   0  :  return   i  ;
    case   1  :  return   parseInt (  i  )  ;
    case   2  :  return   i .  split (  " "  )  ;
    case   3  :  return   i .  split (  "\n"  )  ;
    case   4  :  return   i .  split (  " "  ) .  map (  (  a  )   =>   Number (  a  )  )  ;
    case   5  :  return   i .  split (  "\n"  ) .  map (  (  a  )   =>   Number (  a  )  )  ;
    case   6  :  return   i .  split (  ""  )  ;
    case   7  :  return   i .  split (  ""  ) .  map (  (  a  )   =>   Number (  a  )  )  ;
  }
}

/**
 * The main entry point of the program.
 * Processes the input and computes the final output.
 * @param {string} input - The raw input string read from stdin.
 */
function   Main (  input  )
{
  // First, convert the entire input string by splitting it by newlines.
  input   =   myconv (  input  ,  3  )  ;

  // Extract the number of elements (N) from the first line of input.
  var   N   =   myconv (  input [  0  ]  ,  1  )  ;

  // Extract the list of numbers from the second line of input.
  // These numbers are space-separated.
  var   list   =   myconv (  input [  1  ]  ,  4  )  ;

  // Initialize the output accumulator to zero.
  var   output   =   0  ;

  // Iterate through all unique pairs of elements in the list.
  // The outer loop goes from the first element up to the second-to-last.
  for   (  var   i   =   0  ;   i   <   N   -   1  ;   i  ++  )
  {
    // The inner loop starts from the element *after* 'i' to avoid duplicate pairs
    // and multiplying an element by itself.
    for   (  var   j   =   i   +   1  ;   j   <   N  ;   j  ++  )
    {
      // Add the product of the current pair of elements to the total output.
      output   +=   list [  i  ]   *   list [  j  ]  ;
    }
  }

  // Output the final calculated sum.
  myout (  output  )  ;
}

// Execute the Main function with the input obtained from myin().
Main (  myin (  )  )  ;