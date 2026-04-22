// This is the main function that processes the provided input data.
function   main (   input   )   {
  // The first line of input is processed to extract two numerical values: x and n.
  // It's trimmed, split by space, and each part is converted to an integer.
  const   [   x   ,   n   ]   =   input [ 0 ] . trim ( ) . split ( " " ) . map (   i   =>   parseInt ( i )   ) ;


  // This conditional block checks if 'n' is not equal to zero.
  if   (   n   !==   0   )   {
    // If n is not zero, it means there's a list of excluded numbers.
    // The second line of input contains these numbers, which are parsed into an array 'p'.
    const   p   =   input [ 1 ] . trim ( ) . split ( " " ) . map (   i   =>   parseInt ( i )   ) ;


    // Initialize a counter 'i' to start searching from the given 'x'.
    let   i   =   0   ;
    // An infinite loop is used to find the nearest number that is not in the array 'p'.
    while   (   true   )   {
      // First, check if the number 'x - i' is not present in the 'p' array.
      if   (   !   p . includes (   x   -   i   )   )   {
        // If 'x - i' is not found, it's the smallest non-excluded number.
        console . log (   x   -   i   )   ;
        break   ; // Exit the loop as the number has been found.
      }

      // If 'x - i' was found, then check if 'x + i' is not present in the 'p' array.
      if   (   !   p . includes (   x   +   i   )   )   {
        // If 'x + i' is not found, it's the next smallest non-excluded number (or equal if i=0).
        console . log (   x   +   i   )   ;
        break   ; // Exit the loop.
      }

      // If both 'x - i' and 'x + i' were found in 'p', increment 'i' and check further.
      i   ++   ;
    }
  }   else   {
    // If 'n' is zero, it means there are no excluded numbers.
    // In this case, 'x' itself is the desired number as it's not excluded.
    console . log (   x   )   ;
  }
}

// This line executes the main function by reading input from standard input.
// It uses Node.js 'fs' module to read the file, converts it to a UTF-8 string,
// trims any leading/trailing whitespace, and then splits it into an array of lines.
main (   require ( 'fs' ) . readFileSync ( '/dev/stdin' ,   'utf8' ) . trim ( ) . split ( "\n" )   ) ;