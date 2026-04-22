/* This is a Type I clone of the original JavaScript code.
 * It preserves all identifiers, operators, and expressions.
 * Only whitespace and comments have been altered extensively.
 */
function   Main (s) {
  // First, split the input string by newline characters
  s   =   s.split ( "\n" ) ;

  // Parse the second line of input into an array of numbers
  var   x = s [ 1 ] . split ( " " ) . map ( a   =>   +a ) ;

  // The first line contains the number of elements, convert to a number
  const   n   =   +s [ 0 ] ;

  // Create a sorted copy of the array 'x' named 'y'
  var   y   =   [ ...x ] . sort ( ( a , b ) =>   a - b ) ;


  // Determine the two median elements based on the sorted array 'y'
  // Note: For even 'n', n/2-1 and n/2 are the indices for the two middle elements.
  var   a = y [ n / 2 - 1 ] ,   b   =   y [ n / 2 ] ;

  // Iterate through the original array 'x'
  for   ( var   i = 0 ;   i   <   n ;   i ++ ) {
    // For each element in 'x', print 'b' if the element is less than or equal to 'a',
    // otherwise print 'a'. This logic is specific to the problem context.
    console.log ( x [ i ]   <=   a   ?   b   :   a ) ;
  }
}

// Call the Main function with input read from stdin.
// This line remains functionally identical, only spacing is changed.
Main (   require ( "fs" ) . readFileSync ( "/dev/stdin" , "utf8" )   ) ;