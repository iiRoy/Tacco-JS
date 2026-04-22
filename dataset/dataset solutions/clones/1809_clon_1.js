/*
 * This JavaScript code is a Type I clone.
 * It is structurally and logically identical to the original code.
 * The only modifications made are to whitespace and comments,
 * ensuring all identifiers, operators, and expressions remain unchanged.
 */
var   input   =   "3\n101 9901 999999000001" ; // Initial input string containing numbers

// Define the main function to process the input.
function   main
(
  input
)
{
  // Split the input string by newline and take the second element,
  // which contains the space-separated numbers.
  var   list
    =
    input . split ( "\n" ) [ 1 ] ;

  // Further split the string of numbers by space to get an array of number strings.
  list
    =
    list . split ( " " ) ;

  // Initialize 'seki' (product in Japanese) with the first number from the list.
  // It's still a string at this point.
  var   seki
    =
    list [ 0 ] ;

  // Loop through the remaining numbers in the list, starting from the second one.
  for
  (
    var   i   =   1 ;
    i   <   list . length ;
    i ++
  )
  {
    // Convert the current 'seki' and the next number to BigInt before multiplication.
    // This is crucial for handling very large numbers that exceed standard JavaScript number limits.
    seki
      =
      ( BigInt ( seki )   *   BigInt ( list [ i ] ) ) ;
  }

  // Check if the final product 'seki' exceeds 10^18.
  // Math.pow(10, 18) correctly calculates 10 to the power of 18.
  if
  (
    seki   >   Math . pow ( 10 , 18 )
  )
  {
    // If the product is too large, print -1 as specified by the problem.
    console . log ( -1 ) ;
  }
  else
  {
    // Otherwise, print the calculated product.
    console . log ( seki ) ;
  }
}

// Invoke the main function with the predefined input to start execution.
main ( input ) ; // Function call to run the program.