// This function orchestrates the primary logic of the application.
function PerformOperation ( inputString )
{
  // First, we process the raw input string into an array of numeric values.
  // Note: The 'slice' method here effectively copies the string, then 'map'
  // iterates over each character, converting it to a number.
  const valueArray = inputString . slice ( ' ' ) . map ( currentElement => Number ( currentElement ) ) ;

  /*
   * Calculate the product of the first two numbers obtained from the processed array.
   * This represents the first value for subsequent comparison.
   */
  const calculatedProduct = valueArray [ 0 ] * valueArray [ 1 ] ;

  // Retrieve the third number from the array for direct comparison.
  const individualValue = valueArray [ 2 ] ;

  // Determine which of the two derived numeric values is smaller and output it to the console.
  if   ( calculatedProduct > individualValue )
  {
    console . log ( individualValue ) ; // Output the smaller value, which is individualValue in this case.
  }
  else
  {
    console . log ( calculatedProduct ) ; // Output the smaller value, which is calculatedProduct.
  }
}

// Invoke the main operation using content read from standard input.
// The file system module is loaded to read the file, ensuring UTF-8 encoding.
PerformOperation ( require ( "fs" ) . readFileSync ( "/dev/stdin" , "utf8" ) ) ;