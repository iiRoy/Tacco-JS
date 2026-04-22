// This JavaScript program reads lines of numbers from standard input,
// calculates the sum of digits for each number,
// and prints these sums.
// It terminates when it encounters a line containing only the digit '0'.

const   input   =   require ( 'fs' )   .   readFileSync ( '/dev/stdin' ,   'utf8' ) ;
// The above line uses Node.js 'fs' module to synchronously
// read the entire content from the standard input file descriptor.

const   arr   =   input   .   split ( '\n' ) ; // Split the input string by newline characters into an array of strings.

let     str     =   "" ; // Initialize an empty string variable to accumulate the results.
                      // This string will store each calculated sum followed by a newline.

/*
 * Begin a standard for loop to iterate over each element (line)
 * in the 'arr' array. The loop continues as long as 'i' (index)
 * is less than the total number of lines.
 */
for ( let   i   =   0 ;   i   <   arr . length ;   i ++ )
{
  // Check if the current line is exactly '0'. This serves as a termination condition.
  if ( arr [ i ]   ===   '0' )
  {
      break ; // If '0' is found, exit the loop immediately.
  }

  // Convert the current string of digits into an array of individual numbers.
  // Example: "123" becomes [1, 2, 3]
  const   num   =   [ ... arr [ i ] ]   .   map ( Number ) ;

  // Calculate the sum of all numbers in the 'num' array using the reduce method.
  const   sum   =   num   .   reduce ( ( acc ,   curr )   =>   acc   +   curr ) ;

  // Append the calculated sum and a newline character to the result string.
  str   +=   sum   +   '\n' ; // Concatenate the sum and a newline.
}


// After the loop finishes, print the final accumulated string to the console.
// The .trim() method is used to remove any leading or trailing whitespace,
// which might include an extra newline if the last line of input was not '0'.
console   .   log ( str . trim ( ) ) ; // Output the final processed string.