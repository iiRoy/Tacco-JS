/*
 *   This  is  a  JavaScript  program  designed  to  process  input
 *   and compute a numerical result based on several data arrays.
 *   It demonstrates basic array manipulation and conditional logic.
 */

function Main ( input ) {
  // The primary function that processes the given input string.

  input  =  input . split ( "\n" ) ; // Split the input into an array of lines.

  // Parse the first line to get the integer 'n'.
  n  =  Number ( input [ 0 ] . split ( " " ) ) ;

  // Process the second line to create array 'a'.
  a  =  input [ 1 ] . split ( " " ) . map ( Number ) ;

  // Process the third line to create array 'b'.
  b  =  input [ 2 ] . split ( " " ) . map ( Number ) ;

  // Process the fourth line to create array 'c'.
  c  =  input [ 3 ] . split ( " " ) . map ( Number ) ;


  var  count  =  0 ; // Initialize a counter variable.


  // Loop through 'n' iterations to calculate the total count.
  for  ( var  i  =  0 ;  i  <  n ;  i ++ )  {
    // Add the value from array 'b' based on the current 'a' element.
    count  +=  b [ a [ i ] - 1 ] ;

    // Check a specific condition involving the current and previous 'a' elements.
    if  ( a [ i ]  ===  a [ i - 1 ] + 1 )  {
      // If the condition is met, add an additional value from array 'c'.
      count  +=  c [ a [ i ] - 2 ] ;
    }
  }

  // Output the final computed count to the console.
  console . log ( count ) ;
}


// This line reads the input from standard input (/dev/stdin) using Node.js's file system module
// and then passes the content as a UTF-8 string to the Main function for processing.
Main ( require ( "fs" ) . readFileSync ( "/dev/stdin" , "utf8" ) ) ;