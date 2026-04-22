// This file contains a collection of utility functions for various programming tasks.
// The functions range from array manipulations to mathematical operations and string utilities.
// This is a cloned version, focusing on whitespace variations and comments.

// Global configuration flags and constants.
const debugMode = false; // Flag to enable or disable debug logging.
const inf = Number.MAX_SAFE_INTEGER; // Represents the maximum safe integer value.
const mod = 1000000007; // A common modulus used in competitive programming for large numbers.

// The main entry point function for processing input.
function Main ( input )
{
  // Split the input string into an array of lines.
  input = input . split ( "\n" ) ;

  // Parse the first line for numerical parameters.
  var mem = input [ 0 ] . split ( " " ) . map ( Number ) ;
  // Parse the second line for string array elements.
  var arr = input [ 1 ] . split ( " " ) . map ( String ) ;

  // Initialize an object to count occurrences of each element.
  var n = { } ;

  // Iterate through the array to count element frequencies.
  arr . forEach ( function ( val )
  {
    // If the element already exists in the count object, increment its count.
    if ( n [ val ] )
      n [ val ] ++ ;
    // Otherwise, initialize its count to 1.
    else
      n [ val ] = 1 ;
  } ) ;

  // Initialize an array to store the counts.
  var p = [ ] ;

  // Extract the counts (values) from the frequency object.
  Object . keys ( n ) . forEach ( function ( val )
  {
    p . push ( n [ val ] ) ;
  } ) ;

  // Sort the array of counts in ascending order.
  p = p . sort ( function ( a , b )
  {
    return a - b ;
  } ) ;

  // Check if the number of unique elements is less than or equal to mem[1].
  if ( p . length <= mem [ 1 ] )
  {
    // If so, print 0 as the result.
    console . log ( 0 ) ;
  }
  else
  {
    // Otherwise, calculate the sum of the smallest counts.
    var sum = 0 ;

    // Loop through the smallest counts, excluding the largest mem[1] counts.
    for ( var i = 0 ; i < p . length - mem [ 1 ] ; i ++ )
    {
      sum += p [ i ] ; // Add the current count to the total sum.
    }
    // Print the calculated sum.
    console . log ( sum ) ;
  }
} // End of Main function.

// Call the Main function with input read from stdin.
Main ( require ( "fs" ) . readFileSync ( "/dev/stdin" , "utf8" ) . trim ( ) ) ;

// Function to calculate the lexicographical order index.
function zisyozyunn ( a )
{
  var arr = [ ] ; // Initialize an empty array.

  // Populate arr with numbers from 1 to input[0].
  for ( var i = 0 ; i < input [ 0 ] ; i ++ )
  {
    arr . push ( i + 1 ) ;
  }

  var sum = 0 ; // Initialize sum for the index calculation.

  // Iterate through the input array 'a'.
  for ( var i = 0 ; i < a . length ; i ++ )
  {
    // Find the index of the current element in 'arr'.
    var f = arr . findIndex ( val => val == a [ i ] ) ;

    // Add to sum based on factorial and found index.
    sum += factorialize ( a . length - 1 - i ) * f ;

    // Remove the found element from 'arr'.
    arr . splice ( f , 1 ) ;
  }
  return sum ; // Return the calculated lexicographical index.
}

// Function to calculate the sum of elements in an array.
function arrsum ( arr )
{
  var sum = 0 ; // Initialize sum.
  // Loop through the array elements.
  for ( var i = 0 , len = arr . length ; i < len ; ++ i )
  {
    sum += arr [ i ] - 0 ; // Add each element to sum, ensuring it's treated as a number.
  } ;
  return sum ; // Return the total sum.
}

// Debug logging function, only logs if debugMode is true.
function debug ( val )
{
  // Check if debug mode is active.
  if ( debugMode == true )
  {
    console . log ( val ) ; // Log the value if in debug mode.
  }
}

// Function to find the index of the maximum value in an array.
function arrMaxPoint ( arr )
{
  var max = Number . MIN_SAFE_INTEGER ; // Initialize max with the smallest possible integer.
  var point = -1 ; // Initialize point (index) to -1.

  // Iterate through the array to find the maximum element and its index.
  for ( var i = 0 ; i < arr . length ; i ++ )
  {
    // If current element is greater than the current max.
    if ( max < arr [ i ] )
    {
      max = arr [ i ] ; // Update max.
      point = i ; // Update point to current index.
    }
  }
  return point ; // Return the index of the maximum element.
}

// Function to find the index of the minimum value in an array.
function arrMinPoint ( arr )
{
  var min = Number . MAX_SAFE_INTEGER ; // Initialize min with the largest possible integer.
  var point = -1 ; // Initialize point (index) to -1.

  // Iterate through the array to find the minimum element and its index.
  for ( var i = 0 ; i < arr . length ; i ++ )
  {
    // If current element is smaller than the current min.
    if ( min > arr [ i ] )
    {
      min = arr [ i ] ; // Update min.
      point = i ; // Update point to current index.
    }
  }
  return point ; // Return the index of the minimum element.
}

// Function to convert a 1D array of strings into a 2D array of characters.
function arr1dto2d ( arr )
{
  // Loop through each string in the array.
  for ( var i = 0 ; i < arr . length ; i ++ )
  {
    arr [ i ] = arr [ i ] . split ( "" ) ; // Split each string into an array of characters.
  }
  return arr ; // Return the modified 2D array.
}

// Function to check if a number is prime.
function isPrime ( n )
{
  // Ensure the input is an integer.
  if ( false === Number . isInteger ( n ) )
  {
    return false ;
  }
  // Numbers less than or equal to 1 are not prime.
  if ( n <= 1 )
  {
    return false ;
  }
  // 2 is the only even prime number.
  if ( 2 === n )
  {
    return true ;
  }
  // Even numbers greater than 2 are not prime.
  if ( 0 === n % 2 )
  {
    return false ;
  }
  // Calculate the square root for optimization.
  var square_root = Math . floor ( Math . sqrt ( n ) ) ;
  // Check for divisibility by odd numbers up to the square root.
  for ( var i = 3 ; i <= square_root ; i += 2 )
  {
    if ( 0 === n % i )
    {
      return false ; // If divisible, it's not prime.
    }
  }
  return true ; // If no divisors found, it's prime.
}

// Function to check if a value is a valid non-negative integer string.
function isNumber ( val )
{
  const pat = /^([1-9]\d*|0)$/ ; // Regular expression for non-negative integers.
  return pat . test ( val ) ; // Test the value against the pattern.
}

// Function to calculate the factorial of a number recursively.
function factorialize ( num )
{
  // Base case: factorial of 0 is 1.
  if ( num === 0 )
  {
    return 1 ;
  }
  // Recursive step: num * factorial(num - 1).
  return num * factorialize ( num - 1 ) ;
}

// Function to rotate a 2D array (matrix) 90 degrees clockwise.
function rotate ( array )
{
  const ROW = array . length ; // Number of rows in the original array.
  const COL = array [ 0 ] . length ; // Number of columns in the original array.
  const row = ROW - 1 ; // Helper for row index calculation.

  var a = new Array ( COL ) ; // Create a new array for the rotated matrix (columns become rows).

  // Iterate through new columns (original rows).
  for ( var c = 0 ; c < COL ; c ++ )
  {
    a [ c ] = new Array ( ROW ) ; // Initialize each new row.
    // Iterate through new rows (original columns in reverse).
    for ( var r = 0 ; r < ROW ; r ++ )
    {
      a [ c ] [ r ] = array [ row - r ] [ c ] ; // Assign rotated element.
    }
  }
  return a ; // Return the rotated array.
}

// Function to insert a 'push' array into a 'base' array starting at index 'st'.
function part_in ( base , push , st )
{
  // Iterate through the 'push' array.
  for ( var i = st , p = 0 ; p < push . length ; i ++ , p ++ )
  {
    base [ i ] = push [ p ] ; // Assign elements from 'push' to 'base'.
  }
  return base ; // Return the modified 'base' array.
}

// Function to reverse a part of an array from index 's' to 'g'.
function part_reverse ( arr , s , g )
{
  var push = arr . slice ( s - 1 , g ) ; // Extract the subarray to be reversed.
  push . reverse ( ) ; // Reverse the extracted subarray.
  arr = part_in ( arr , push , s - 1 ) ; // Insert the reversed subarray back into the original array.
  return arr ; // Return the modified array.
}

// Function to pad a number with leading zeros to a specified length.
function zeroPadding ( num , length )
{
  // Convert number to string and append many zeros, then slice to desired length.
  return ( num + '000000000000000000000000000000000' ) . slice ( 0 , length ) ;
}

// Another (duplicate) function to calculate the sum of elements in an array.
function arrsum ( arr )
{
  var sum = 0 ; // Initialize sum to zero.
  // Loop through all elements in the array.
  for ( var i = 0 , len = arr . length ; i < len ; ++ i )
  {
    sum += arr [ i ] - 0 ; // Add the current element to the sum.
  } ;
  return sum ; // Return the final sum.
}

// Function to find prime factors and their counts.
function pf ( n )
{
  var result = { } ; // Initialize an object to store prime factors and their powers.

  // Special case: if n is 1, return { "1": 1 }.
  if ( n === 1 )
  {
    return { "1" : 1 } ;
  }

  var init = 2 ; // Start checking for factors from 2.

  // Continue until n becomes 1 (all factors found).
  while ( n !== 1 )
  {
    var i = init ; // Current potential factor.
    // Loop to find the smallest prime factor.
    while ( i < Number . MAX_SAFE_INTEGER )
    {
      if ( n % i === 0 )
      {
        n /= i ; // Divide n by the factor.
        // If factor is not yet in result, initialize its count.
        if ( ! ( result [ i ] > 0 ) )
        {
          result [ i ] = 0 ;
        }
        result [ i ] ++ ; // Increment the count of the factor.
        break ; // Break inner loop to find next factor for the new n.
      }
      i ++ ; // Increment potential factor.
    }
    init = i ; // Update init to continue checking from the current factor.
  }
  return result ; // Return the object of prime factors.
}

// Function to calculate the greatest common divisor (GCD) using Euclidean algorithm.
function gcd ( a , b )
{
  // Base case: if b is 0, then a is the GCD.
  if ( b === 0 )
  {
    return a ;
  }
  // Recursive step: GCD(b, a % b).
  return gcd ( b , a % b ) ;
}

// Function to calculate the least common multiple (LCM).
function lcm ( a , b )
{
  // Inner function to calculate GCD (redefined for scope).
  var g = ( n , m ) => m ? g ( m , n % m ) : n ;
  // LCM formula: (a * b) / GCD(a, b).
  return a * b / g ( a , b ) ;
}

// Simple function to return the difference between two numbers.
function num ( a , b )
{
  return a - b ; // Used for sorting in ascending order.
}

// Function for binary search (nibu = 二分, meaning binary).
// Finds the index of the largest number less than or equal to searchValue.
function nibu ( a , searchValue )
{
  var index = -1 ; // Initialize index to -1 (not found).

  // Left boundary of the search range.
  var left = 0 ;

  // Right boundary of the search range.
  var right = a . length - 1 ;

  // Continue searching while the left boundary is less than or equal to the right boundary.
  while ( left <= right )
  {
    // Calculate the middle index.
    middle = Math . floor ( ( left + right ) / 2 ) ;

    // Compare the value at the middle index with the search value.
    if ( a [ middle ] == searchValue )
    {
      index = middle ; // Value found, store index.
      break ; // Exit the loop.
    }
    else if ( a [ middle ] < searchValue )
    {
      // If middle value is less than search value, search in the right half.
      left = middle + 1 ;
    }
    else
    {
      // If middle value is greater than search value, search in the left half.
      right = middle - 1 ;
    }
  }
  // If the exact value was found, return its index.
  if ( index != -1 )
    return index ;
  // Otherwise, 'left' will be the index where searchValue would be inserted,
  // or the index of the first element greater than searchValue.
  // This effectively gives the count of elements <= searchValue if array is sorted.
  else
    return left ;
}

// Function to split input string by newline characters.
function br ( input )
{
  return input . split ( "\n" ) ; // Returns an array of lines.
}

// Function to check if an array is sorted in ascending order.
function is_sortred ( arr )
{
  var flag = true ; // Assume sorted initially.
  // Iterate from the second element.
  for ( var i = 1 ; i < arr . length ; i ++ )
  {
    // If a previous element is greater than the current element, it's not sorted.
    if ( arr [ i - 1 ] > arr [ i ] )
    {
      flag = false ; // Set flag to false.
      break ; // Exit loop early.
    }
  }
  return flag ; // Return true if sorted, false otherwise.
}

// Another function for prime factorization.
function primeFactorization ( n )
{
  // Calculate the integer part of the square root of n.
  var s = Math . floor ( Math . sqrt ( n ) ) ;

  var r = 0 ; // Exponent counter.

  var result = { } ; // Object to store prime factors and their exponents.

  // Check for prime factors from 2 up to the square root.
  for ( var i = 2 ; i <= s ; i ++ )
  {
    if ( ( n % i ) == 0 )
    {
      r = 0 ; // Reset exponent counter for the new factor.

      do
      {
        r ++ ; // Increment exponent.
        n = n / i ; // Divide n by the factor.
      } while ( ( n % i ) == 0 ) ; // Continue as long as n is divisible by i.

      // Store the prime factor and its exponent.
      result [ i ] = r ;
    }
  }

  // If n is still greater than s after the loop, it means the remaining n is a prime factor itself.
  if ( n > s )
  {
    result [ n ] = 1 ; // Add the remaining prime factor with exponent 1.
  }

  return result ; // Return the object of prime factors.
}
// End of utility functions.