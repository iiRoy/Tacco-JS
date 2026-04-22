/*
 * This JavaScript function processes an array of numbers based on specific conditions.
 * It aims to transform the array 'a' by applying additions,
 * and records the operations in array 'b'.
 */
function Main( input )
{
  // Split the input string by newline characters to get individual lines.
  input = input . split ( "\n" ) ;

  // Parse the first number from the first line, which represents 'n'.
  var n = parseInt ( input [ 0 ] . split ( " " ) [ 0 ] ) ;

  // Split the second line of input to get the raw string array for 'a'.
  tmp = input [ 1 ] . split ( " " ) ;

  // Initialize array 'a' with 'n' elements, all set to 0 initially.
  a = new Array ( n ) . fill ( 0 ) ;

  // Initialize an empty array 'b' to store operation details.
  b = new Array ( ) ;

  // Initialize 'max' with a very small number (negative 10^6).
  var max = - Math . pow ( 10 , 6 ) ;

  // Initialize 'min' with a very large number (positive 10^6).
  var min = Math . pow ( 10 , 6 ) ;


  /*
   * Loop through the input numbers to populate array 'a'
   * and find the initial maximum and minimum values.
   */
  for ( i = 0 ; i < n ; i ++ )
  {
    a [ i ] = parseInt ( tmp [ i ] ) ; // Convert string to integer and assign to a[i].
    max = Math . max ( a [ i ] , max ) ; // Update maximum value if current element is greater.
    min = Math . min ( a [ i ] , min ) ; // Update minimum value if current element is smaller.
  }

  // --- Conditional Logic for Array Transformation ---

  // Scenario 1: All numbers are non-negative.
  if ( min >= 0 )
  {
    for ( i = 0 ; i < n ; i ++ )
    {
      // If a number is smaller than its predecessor, adjust it.
      if ( i > 0 && a [ i ] < a [ i - 1 ] )
      {
        bsub = [ i , i + 1 ] ; // Record the operation indices.
        b . push ( bsub ) ; // Add the operation to 'b'.
        a [ i ] = a [ i - 1 ] + a [ i ] ; // Add the predecessor to the current element.
      }
    }
  }
  // Scenario 2: All numbers are negative.
  else if ( max < 0 )
  {
    // Iterate from the end of the array.
    for ( i = n - 1 ; i >= 0 ; i -- )
    {
      // If a number is greater than its successor, adjust it.
      if ( i < n - 1 && a [ i ] > a [ i + 1 ] )
      {
        bsub = [ i + 1 , i ] ; // Record the operation indices.
        b . push ( bsub ) ; // Add the operation to 'b'.
        a [ i ] = a [ i + 1 ] + a [ i ] ; // Add the successor to the current element.
      }
    }
  }
  // Scenario 3: Mixed signs, and the positive maximum is dominant.
  else if ( max > Math . abs ( min ) )
  {
    // First pass: Add the maximum value to all other elements.
    for ( i = 0 ; i < n ; i ++ )
    {
      // Skip if the current element is already the maximum.
      if ( a . indexOf ( max ) != i )
      {
        bsub = [ a . indexOf ( max ) , i ] ; // Record the indices of max and current element.
        b . push ( bsub ) ; // Add the operation.
        a [ i ] = a [ i ] + max ; // Add max to the current element.
      }
    }

    // Second pass: Ensure non-decreasing order from start.
    for ( i = 0 ; i < n ; i ++ )
    {
      if ( i > 0 && a [ i ] < a [ i - 1 ] )
      {
        bsub = [ i , i + 1 ] ; // Record the operation.
        b . push ( bsub ) ; // Add to 'b'.
        a [ i ] = a [ i - 1 ] + a [ i ] ; // Adjust current element.
      }
    }
  }
  // Scenario 4: Mixed signs, and the absolute value of the negative minimum is dominant.
  else if ( Math . abs ( min ) > max )
  {
    // First pass: Add the minimum value to all other elements.
    for ( i = 0 ; i < n ; i ++ )
    {
      // Skip if the current element is already the minimum.
      if ( a . indexOf ( min ) != i )
      {
        bsub = [ a . indexOf ( min ) , i ] ; // Record the indices of min and current element.
        b . push ( bsub ) ; // Add the operation.
        a [ i ] = a [ i ] + min ; // Add min to the current element.
      }
    }

    // Second pass: Ensure non-increasing order from end.
    for ( i = n - 1 ; i >= 0 ; i -- )
    {
      if ( i < n - 1 && a [ i ] > a [ i + 1 ] )
      {
        bsub = [ i + 1 , i ] ; // Record the operation.
        b . push ( bsub ) ; // Add to 'b'.
        a [ i ] = a [ i + 1 ] + a [ i ] ; // Adjust current element.
      }
    }
  }

  // Prepare the final answer string.
  var ans = b . length ; // Start with the total number of operations.

  // Append each operation (pair of indices) to the answer string.
  for ( i = 0 ; i < b . length ; i ++ )
  {
    ans += "\n" + b [ i ] [ 0 ] + " " + b [ i ] [ 1 ] ; // Format as "index1 index2".
  }

  // Output the final result to the console.
  console . log ( '%s' , ans ) ;
}

// Read input from standard input and pass it to the Main function.
Main ( require ( "fs" ) . readFileSync ( "/dev/stdin" , "utf8" ) ) ;