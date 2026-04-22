/*
 * This JavaScript code reads input from standard input,
 * processes it to simulate a Josephus problem variation,
 * and then prints the result to standard output.
 *
 * It's designed to solve a problem where:
 * - N is the number of people (from 1 to N)
 * - M is the step count for elimination
 * - The process continues until only one person remains.
 *
 * Input format:
 * Each line contains two integers, N and M, separated by a space.
 * The input terminates when N and M are both 0.
 *
 * Output format:
 * For each N and M pair, print the number of the last remaining person.
 */

//  Require the 'fs' module for file system operations.
var   input   =   require ( 'fs' ) . readFileSync (   '/dev/stdin'   ,   'utf8'   ) . trim ( ) ;

//  Split the entire input string into an array of lines, based on the newline character.
var   lines   =   input . split (   '\n'   ) ;


// Declare a variable 'line' to hold each line read from the input.
var   line   ;


//  Loop through each line of the input until no more lines are available.
//  The 'shift()' method removes the first element from the 'lines' array and returns it.
while   (   line   =   lines . shift ( )   )
{
  //  Split the current line into an array of strings, using space as a delimiter.
  var   nums   =   line . split (   ' '   ) ;

  //  Convert the first number string to an integer and store it in 'n'.
  //  The unary plus operator '+' is used for type conversion.
  var   n   =   +   nums [   0   ]   ;

  //  Convert the second number string to an integer and store it in 'm'.
  var   m   =   +   nums [   1   ]   ;


  //  Check if both n and m are zero, which signals the end of input.
  if   (   n   +   m   ==   0   )
  {
    //  If it's the termination condition, break out of the while loop.
    break   ;
  }


  //  Initialize an empty array 'p' which will represent the circle of people.
  var   p   =   [   ]   ;

  //  Populate the array 'p' with numbers from 1 to n, representing people.
  for   (   var   i   =   0   ;   i   <   n   ;   i   ++   )
  {
    //  Add the current person's number to the end of the array.
    p . push (   i   +   1   )   ;
  }


  //  Continue the elimination process as long as there is more than one person left.
  while   (   p . length   >   1   )
  {
    //  Simulate counting 'm-1' people and moving them to the end of the line.
    for   (   var   i   =   0   ;   i   <   m   -   1   ;   i   ++   )
    {
      //  Remove the first person and add them to the end.
      p . push (   p . shift ( )   )   ;
    }

    //  After counting, eliminate the 'm-th' person (which is now at the front).
    p . shift ( )   ;
  }

  //  Print the number of the last remaining person to the console.
  console . log (   p [   0   ]   )   ;
}