/*
 * This is the primary function responsible for processing the given input.
 * It expects a single string argument, which contains all necessary data.
 */
function   Main   (   input   )
{
  // First, the entire input string is split into individual lines
  // using the newline character as a delimiter. This creates an array of strings.
  input   =   input.split (   "\n"   )   ;

  // The second line of input (at index 1) is further processed.
  // It is split by spaces to extract multiple string components.
  tmp   =   input   [   1   ] . split   (   " "   )   ;

  /*
   * For converting string representations of numbers to their integer equivalents,
   * parseInt() is employed. It's good practice to specify the radix (base),
   * which is 10 for decimal numbers in this context.
   */
  var   a   =   parseInt   (   input [   0   ]   ,   10   )   ;
  var   b   =   parseInt   (   tmp   [   0   ]   ,   10   )   ;
  var   c   =   parseInt   (   tmp   [   1   ]   ,   10   )   ;

  // The third line of input (at index 2) is a string and is assigned directly.
  var   s   =   input   [   2   ]   ;

  // --- Output Generation ---
  // The final computed result is printed to the standard output.
  // It consists of the sum of 'a', 'b', and 'c', followed by the string 's'.
  console . log   (   '%d %s'   ,   a   +   b   +   c   ,   s   )   ;

} // --- End of the Main function definition ---


/*
 * !!! IMPORTANT NOTE: Please DO NOT modify any code from this line downwards. !!!
 * This segment is responsible for handling the standard input/output operations.
 * It reads all input data from /dev/stdin at once, using UTF-8 encoding,
 * and then invokes the 'Main' function with the collected input string.
 */
Main   (   require   (   "fs"   ) . readFileSync   (   "/dev/stdin"   ,   "utf8"   )   )   ;