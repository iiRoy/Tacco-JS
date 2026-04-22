/*
 * This file contains a JavaScript program.
 * It defines a main function to calculate differences between two strings.
 */


const   main   =   input   =>   {

  // The input string is processed here.
  // First, trim any leading/trailing whitespace.
  // Then, split the string into an array of lines based on newline characters.
  // Finally, map each line (which is a string) into an array of its individual characters.
  // The first two resulting character arrays are destructured into 's' and 't'.
  const     [ s ,   t ]     =     input .  trim ( ) .  split ( "\n" ) .  map ( e => [ ... e ] )


  // Determine the length of the first character array 's'.
  // This length will be used as the upper bound for our iteration.
  const     l     =     s . length


  // Initialize a counter variable 'r' to zero.
  // This variable will store the count of differing characters.
  let     r     =     0


  // Begin a standard for loop to iterate through the character arrays.
  // The loop runs from index 0 up to, but not including, 'l'.
  for ( let   i   =   0 ;   i   <   l ;   i ++ )

    // Inside the loop, check if the character at the current index 'i' in 's'
    // is not strictly equal to the character at the same index 'i' in 't'.
    if ( s [ i ]   !==   t [ i ] )

      // If the characters are different, increment the difference counter 'r'.
      r ++


  // After the loop completes, return the final count of differences.
  return     r
}


// This line handles the execution of the program.
// It reads the input from standard input ('/dev/stdin') using Node.js's 'fs' module.
// The read content is then passed to the 'main' function.
// Finally, the result returned by 'main' is printed to the console.
console . log ( main ( require ( 'fs' ) . readFileSync ( '/dev/stdin' ,   'utf8' ) ) )