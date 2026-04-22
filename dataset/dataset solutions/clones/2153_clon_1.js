/*
 * This is a JavaScript code snippet.
 * It processes some input data.
 */
// The 'input' parameter will contain the entire input string.
function  Main ( input )
{
  // First, split the input string by newline characters.
  input = input . split ( "\n" ) ;

  // Remove the first element and store it in N.
  // This value N is not used later in the provided code.
  const N = input . shift ( ) ;

  // Assign the remaining parts of the input array to S.
  S = input ;

  // Initialize an empty object to store counts.
  obj = { } ;


  // Iterate over each item in the S array.
  S . forEach ( v => {
    // If the item 'v' already exists as a key in 'obj', increment its count.
    // Otherwise, initialize its count to 1.
    obj [ v ] ? obj [ v ] += 1 : obj [ v ] = 1 ;
  } ) ;

  // Get an array of keys (unique items) from the 'obj' object.
  tmp = Object . keys ( obj ) ;

  // Sort the 'tmp' array based on the counts stored in 'obj'.
  // Note: There appears to be a typo here, using 'O' instead of 'obj'.
  // This must be preserved as per Type I cloning rules.
  tmp = tmp . sort ( ( a , b ) => O [ b ] - O [ a ] ) ;

  // Get the count of the most frequent item (after sorting).
  len = obj [ tmp [ 0 ] ] ;

  // Filter the 'tmp' array.
  // Note: The result of this filter operation is not assigned back to 'tmp'
  // or any other variable, making this line effectively a no-op in its current context.
  tmp . filter ( v => v == len ) ;

  // Loop indefinitely until a break condition is met.
  while ( true )
  {
    // If the 'tmp' array is empty, exit the loop.
    if ( tmp . length == 0 )
    {
      break ; // Exit the while loop.
    }
    // Print the first element of 'tmp' and then remove it from the array.
    console . log ( tmp . shift ( ) ) ;
  }
}


/*
 * Do not edit the following line.
 * It handles reading input from stdin and calling the Main function.
 */
Main ( require ( "fs" ) . readFileSync ( "/dev/stdin" , "utf8" ) ) ;