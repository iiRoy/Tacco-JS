/*
 * This file contains several utility functions for
 * performing arithmetic operations on numbers represented as strings,
 * and a main function to solve a specific problem.
 *
 * All functions maintain the exact same logic and variable names as the original,
 * only whitespace and comments have been altered.
 */

// Function to multiply two numbers, handling large numbers by processing digit by digit.
function times ( num1 , num2 )
{
  // Convert numbers to strings, split into digits, and reverse for easier processing from least significant digit.
  var num1str = ( num1 + "" ) . split ( "" ) . reverse ( );
  var num2str = ( num2 + "" ) . split ( "" ) . reverse ( );

  // Get lengths of the digit arrays.
  var L1 = num1str . length ;
  var L2 = num2str . length ;

  // Initialize an array to store the result digits.
  var newNumStr = [ ] ;

  /*
   * Perform digit-by-digit multiplication.
   * The product of a digit from num1 and a digit from num2 at index i and j
   * contributes to the (i+j)-th position in the result.
   */
  for ( var i = 0 ; i < L1 ; i++ )
  {
    for ( var j = 0 ; j < L2 ; j++ )
    {
      // If the current position in the result array is undefined, initialize it to 0.
      if ( newNumStr [ i + j ] === undefined )
        newNumStr [ i + j ] = 0 ;

      // Add the product of the current digits to the corresponding result position.
      newNumStr [ i + j ] += parseInt ( num1str [ i ] ) * parseInt ( num2str [ j ] ) ;
    }
  }

  // Ensure enough space for potential carries and final digits.
  // The maximum possible length of the product is L1 + L2.
  // We double it to be safe and handle all carries.
  for ( var k = 0 ; k < 2 * ( L1 + L2 ) ; k++ )
  {
    if ( newNumStr [ k ] === undefined )
    { newNumStr [ k ] = 0 ; }
  }

  // This loop is a duplicate in the original code, but must be preserved for Type I clone.
  // It effectively re-initializes undefined positions to 0, which is redundant here.
  for ( var k = 0 ; k < 2 * ( L1 + L2 ) ; k++ )
  {
    if ( newNumStr [ k ] === undefined )
    {
      newNumStr [ k ] = 0 ;
    }
  }

  // Process carries from right to left (least significant to most significant digit).
  var l = 0 ;
  while ( newNumStr [ l ] || newNumStr [ l ] === 0 )
  {
    // Calculate carry and add to the next digit.
    newNumStr [ l + 1 ] += ( newNumStr [ l ] - ( newNumStr [ l ] % 10 ) ) / 10 ;
    // Update the current digit to its unit place value.
    newNumStr [ l ] = ( newNumStr [ l ] % 10 ) . toString ( 10 ) ;
    l++ ; // Move to the next digit.
  }

  // Reverse the array to get the digits in correct order (most significant first).
  newNumStr = newNumStr . reverse ( ) ;

  // Remove leading zeros.
  while ( isNaN ( newNumStr [ 0 ] ) || newNumStr [ 0 ] === "0" )
  {
    newNumStr . splice ( 0 , 1 ) ;
  }

  // Join the digits to form the final result string.
  newNumStr = newNumStr . join ( "" ) ;

  // Return the product.
  return ( newNumStr ) ;
}


// Function to add two numbers, handling large numbers as strings.
function adds ( num1 , num2 )
{
  // Convert numbers to strings, split into digits, and reverse for processing.
  var num1str = ( num1 + "" ) . split ( "" ) . reverse ( ) ;
  var num2str = ( num2 + "" ) . split ( "" ) . reverse ( ) ;

  // Get lengths of the digit arrays.
  var L1 = num1str . length ;
  var L2 = num2str . length ;

  // Initialize an array for the result.
  var newNumStr = [ ] ;

  // Ensure both numbers have the same "length" by padding with zeros for addition.
  for ( var i = 0 ; i < Math . max ( L1 , L2 ) ; i++ )
  {
    if ( num1str [ i ] === undefined )
    {
      num1str [ i ] = 0 ;
    }
    if ( num2str [ i ] === undefined )
    {
      num2str [ i ] = 0 ;
    }
  }

  // Add corresponding digits.
  for ( var i = 0 ; i < Math . max ( L1 , L2 ) ; i++ )
  {
    newNumStr [ i ] = parseInt ( num1str [ i ] ) + parseInt ( num2str [ i ] ) ;
  }

  // Process carries from right to left.
  var l = 0 ;
  while ( newNumStr [ l ] || newNumStr [ l ] === 0 )
  {
    // Calculate carry and add to the next digit.
    newNumStr [ l + 1 ] += ( newNumStr [ l ] - ( newNumStr [ l ] % 10 ) ) / 10 ;
    // Update the current digit to its unit place value.
    newNumStr [ l ] = ( newNumStr [ l ] % 10 + "" ) ;
    l++ ; // Move to the next digit.
  }

  // Reverse the array to get the digits in correct order.
  newNumStr = newNumStr . reverse ( ) ;

  // Remove leading zeros.
  while ( isNaN ( newNumStr [ 0 ] ) || newNumStr [ 0 ] === "0" )
  {
    newNumStr . splice ( 0 , 1 ) ;
  }

  // Join the digits to form the final result string.
  newNumStr = newNumStr . join ( "" ) ;

  // Return the sum.
  return ( newNumStr ) ;
}


// Function to subtract two numbers, handling large numbers as strings.
// This assumes num1 >= num2 for non-negative results, or handles negative intermediate digits.
function subtracts ( num1 , num2 )
{
  // Convert numbers to strings, split into digits, and reverse for processing.
  var num1str = ( num1 + "" ) . split ( "" ) . reverse ( ) ;
  var num2str = ( num2 + "" ) . split ( "" ) . reverse ( ) ;

  // Get lengths of the digit arrays.
  var L1 = num1str . length ;
  var L2 = num2str . length ;

  // Initialize an array for the result.
  var newNumStr = [ ] ;

  // Ensure both numbers have the same "length" by padding with zeros for subtraction.
  for ( var i = 0 ; i < Math . max ( L1 , L2 ) ; i++ )
  {
    if ( num1str [ i ] === undefined )
    {
      num1str [ i ] = 0 ;
    }
    if ( num2str [ i ] === undefined )
    {
      num2str [ i ] = 0 ;
    }
  }

  // Subtract corresponding digits.
  for ( var i = 0 ; i < Math . max ( L1 , L2 ) ; i++ )
  {
    newNumStr [ i ] = parseInt ( num1str [ i ] ) - parseInt ( num2str [ i ] ) ;
  }

  // Process borrows from right to left.
  var l = 0 ;
  while ( newNumStr [ l ] || newNumStr [ l ] === 0 )
  {
    // If a digit is negative, perform a borrow.
    if ( newNumStr [ l ] < 0 )
    {
      newNumStr [ l + 1 ]-- ; // Borrow from the next digit.
      newNumStr [ l ] += 10 ; // Add 10 to the current digit.
    }
    l++ ; // Move to the next digit.
  }

  // Reverse the array to get the digits in correct order.
  newNumStr = newNumStr . reverse ( ) ;

  // Remove leading zeros.
  while ( isNaN ( newNumStr [ 0 ] ) || newNumStr [ 0 ] === "0" )
  {
    newNumStr . splice ( 0 , 1 ) ;
  }

  // Join the digits to form the final result string.
  newNumStr = newNumStr . join ( "" ) ;

  // Return the difference.
  return ( newNumStr ) ;
}


// Main function to solve the problem logic.
function Main ( input )
{
    // Remove newline character and split the input string by space.
    input = input . replace ( "\n" , "" ) ;
    input = input . split ( ' ' ) ;

    // Parse input values as integers.
    var K = parseInt ( input [ 0 ] ) ;
    var A = parseInt ( input [ 1 ] ) ;
    var B = parseInt ( input [ 2 ] ) ;

    // Calculate differences.
    var D = B - A ;
    var E = K - A ;

    // Initialize biscuit count.
    var biscuit = 0 ;

    /*
     * The original code contained a commented-out block for biscuit calculation.
     * This block is preserved as a comment to adhere to Type I clone definition.
     *
     * var biscuit=((E<2)||(D<3))?(K+1):(E%2===0)?(A+E*D/2+1):(A+(E+1)*D/2);
     * console.log(biscuit);
     */

    // Conditional logic to calculate the number of biscuits based on K, A, B.
    if ( ( E < 2 ) || ( D < 3 ) )
    {
        // If E is less than 2 or D is less than 3, simply add 1 to K.
        biscuit = adds ( K , 1 ) ;
    }
    else if ( E % 2 === 0 )
    {
        // If E is even, calculate as A + (E/2)*D + 1.
        biscuit = adds ( adds ( times ( E / 2 , D ) , A ) , 1 ) ;
    }
    else
    {
        // If E is odd, calculate as A + ((E+1)/2)*D.
        biscuit = adds ( times ( ( E + 1 ) / 2 , D ) , A ) ;
    }

    // Output the final biscuit count.
    console . log ( biscuit ) ;
}

// Read input from stdin and pass it to the Main function.
Main ( require ( "fs" ) . readFileSync ( "/dev/stdin" , "utf8" ) ) ;