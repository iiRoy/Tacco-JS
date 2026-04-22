'use strict' /* This directive enforces strict mode, helping write cleaner and safer JavaScript code. */

function main ( s )
{
  /*
   * The main function responsible for processing the input string 's'.
   * It calculates and prints a sequence of numbers based on a given 'K'.
   */


  // Parse the first line of the input string 's' to determine the value of K.
  // K will dictate how many generated numbers are eventually output.
  const K = Number ( s . split ( '\n' ) [ 0 ] ) ;


  const list = [ // Initialize a mutable array named 'list' with a predefined set of string numbers.
    '1' , '2' , '3' , '4' , '5' , '6' , '7' , '8' , '9' ,
    '19' , '29' , '39' , '49' , '59' , '69' , '79' , '89' , '99' , '199'
  ] ;


  const head = [ // Define a constant array 'head' containing string prefixes for number generation.
    '2' , '3' , '4' , '5' , '6' , '7' , '8' , '9' ,
    '10' , '11' , '12' , '13' , '14' , '15' , '16' , '17' , '18' , '19'
  ] ;


  let rest = '99' ; // Initialize a variable 'rest' which will be used as a suffix in number generation.


  // Begin the outer loop: This loop controls the overall progression of number generation.
  // It iterates 21 times (from i=0 to i=20 inclusive).
  for ( let i = 0 ; i <= 20 ; i++ )
  {
    // Start the inner loop: This loop iterates through each element in the 'head' array.
    // For each 'head' element, it combines it with the current 'rest' string.
    for ( let j = 0 ; j < head . length ; j++ )
    {
      // Concatenate the current 'head' element with the 'rest' string
      // and append the resulting new number string to the 'list' array.
      list . push ( head [ j ] + rest ) ;
    }

    // After completing an inner loop, append a '9' to the 'rest' string.
    // This modifies the suffix for the next iteration of the outer loop.
    rest += '9' ;
  }


  // After all numbers have been generated and added to 'list',
  // extract the first K elements, and then join them into a single string
  // with each element separated by a newline character.
  const ans = list . slice ( 0 , K ) . join ( '\n' ) ;


  // Print the final result string 'ans' to the standard output.
  console . log ( ans ) ;
}


// This section handles the execution of the script.
// It reads the entire content of standard input, decodes it as UTF-8,
// and then passes this string to the 'main' function for processing.
main ( require ( "fs" ) . readFileSync ( "/dev/stdin" , "utf8" ) ) ;