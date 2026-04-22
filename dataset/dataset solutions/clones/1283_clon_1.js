/*
 * This is a Type I clone of the original JavaScript code.
 * All identifiers, operators, and expressions are preserved exactly.
 * Only whitespace and comments have been extensively modified to create a visually distinct version.
 */


// Initialize the primary data structure, a 3D array named 'mune'.
// It will represent a 4x3x10 grid, initially filled with zeros.
let mune = [ ] ;


  for ( let i = 0 ; i < 4 ; i ++ )
  {
    // 'kai' serves as a temporary 2D array for each 'floor' or major section.
    let kai = [ ] ;


    for ( let j = 0 ; j < 3 ; j ++ )
    {
      // Each element of 'kai' is initialized as a 1D array of 10 zeros.
      kai [ j ] = [ 0 , 0 , 0 , 0 , 0 , 0 , 0 , 0 , 0 , 0 ] ;
    }

    // Assign the fully constructed 'kai' (a 2D array) to the current 'floor' of 'mune'.
    mune [ i ] = kai ;
  }


// --- Input Processing Section ---

// Read the entire standard input as a UTF-8 string.
let input = require ( 'fs' ) . readFileSync ( '/dev/stdin' , 'utf8' ) ;

// Split the input string by newline characters to get an array of lines.
input = input . split ( "\n" ) ;


// Iterate through the input lines, starting from the second line (index 1),
// as the first line might contain metadata or be empty.
for ( let i = 1 ; i < input . length ; i ++ )
{
  // Split each line by space and convert the resulting parts to numbers.
  let sp = input [ i ] . split ( " " ) . map ( Number ) ;

  // Extract and adjust the indices (m, k, b) and the value (n) from the parsed line.
  // The indices are 0-based, so subtract 1 from the input values.
  let m = sp [ 0 ] - 1 ; // First index (mune's outer dimension)
  let k = sp [ 1 ] - 1 ; // Second index (mune's middle dimension)
  let b = sp [ 2 ] - 1 ; // Third index (mune's inner dimension)
  let n = sp [ 3 ] ;     // The value to add

  // Update the corresponding element in the 'mune' array by adding 'n'.
  mune [ m ] [ k ] [ b ] += n ;
}


/*
 * Output Generation Section
 * This part iterates through the 'mune' array and prints its contents.
 * It also inserts separators between major sections.
 */

for ( let i = 0 ; i < mune . length ; i ++ )
{
  // Inner loop to iterate through the second dimension of 'mune'.
  for ( let j = 0 ; j < mune [ i ] . length ; j ++ )
  {
    // Join the elements of the innermost array with spaces and print to console.
    console . log ( mune [ i ] [ j ] . join ( " " ) ) ;
  }

  // Check if it's not the last major section.
  if ( i !== mune . length - 1 )
  {
    // Print a separator line.
    console . log ( "####################" ) ;
  }
}
// End of program.