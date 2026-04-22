/*
 * This script processes input data from standard input.
 * It reads multiple lines, parses them into numbers,
 * sorts the resulting lists, and then performs a specific
 * set of nested calculations to arrive at a final sum.
 * The algorithm is designed to efficiently count combinations
 * based on sorted numerical sequences.
 */

// Import the 'fs' (file system) module to read input.
var input = require ( "fs" ) . readFileSync ( "/dev/stdin" , "utf8" ) ;


// Split the entire input string by newline characters into an array of strings.
var lines = input . split ( '\n' ) ;
// The first line contains the integer N. Convert it from string to number.
var N = Number ( lines [ 0 ] ) ;

// The subsequent lines contain space-separated numbers for arrays An, Bn, Cn.
// Split these lines by spaces to get arrays of string numbers.
var An = lines [ 1 ] . split ( ' ' ) ;
var Bn = lines [ 2 ] . split ( ' ' ) ;
var Cn = lines [ 3 ] . split ( ' ' ) ;


// Initialize three empty arrays that will hold the numeric values.
var listA = [ ] ;
var listB = [ ] ;
var listC = [ ] ;

// Loop N times to populate listA, listB, and listC.
// In each iteration, convert the string numbers to actual numbers and push them.
for ( var i = 0 ; i < N ; i ++ )
{
  listA . push ( Number ( An [ i ] ) ) ; // Add converted number to listA.
  listB . push ( Number ( Bn [ i ] ) ) ; // Add converted number to listB.
  listC . push ( Number ( Cn [ i ] ) ) ; // Add converted number to listC.
}

/**
 * A comparison function for sorting numbers in ascending order.
 * This function is passed to the Array.prototype.sort method.
 * @param {number} a - The first number for comparison.
 * @param {number} b - The second number for comparison.
 * @returns {number} - A negative value if a < b, zero if a == b, a positive value if a > b.
 */
function asc ( a , b )
{
  return a - b ; // Standard way to sort numbers in ascending order.
}

// Sort all three lists (listA, listB, listC) using the 'asc' comparison function.
// Sorting is crucial for the efficiency of the subsequent loops.
listA . sort ( asc ) ;
listB . sort ( asc ) ;
listC . sort ( asc ) ;


// Initialize variables used in the main calculation block.
var sum = 0 ;       // This variable will accumulate the final result.
var iA = 0 ;        // An index pointer for listA, used to optimize inner loop.
var iC = 0 ;        // An index pointer for listC, used to optimize inner loop.
var countA = 0 ;    // Stores the count of elements in listA satisfying a condition.
var countC = 0 ;    // Stores the count of elements in listC satisfying a condition.

// The main loop iterates through each element 'b' in listB.
for ( var iB = 0 ; iB < N ; iB ++ )
{
  var b = listB [ iB ] ; // Get the current element from listB.

  // First inner loop: Find how many elements in listA are less than or equal to 'b'.
  // It starts from 'iA' to avoid re-scanning parts of listA.
  for ( var i = iA ; i < N ; i ++ )
  {
    var a = listA [ i ] ; // Get the current element from listA.

    if ( b <= a )
    {
      // Since listA is sorted, if 'b' is less than or equal to 'a',
      // all subsequent elements will also be greater than or equal to 'b'.
      // So, we can break this loop.
      break ;
    }
    else
    {
      // If 'b' is greater than 'a', this 'a' satisfies the condition.
      // Update 'iA' to the current index and 'countA' to include this element.
      iA = i ;
      countA = i + 1 ; // 'i + 1' gives the count of elements from index 0 to 'i'.
    }
  }

  // Second inner loop: Find how many elements in listC are less than 'b'.
  // It starts from 'iC' to avoid re-scanning parts of listC.
  for ( var i = iC ; i < N ; i ++ )
  {
    var c = listC [ i ] ; // Get the current element from listC.

    if ( b < c )
    {
      // Since listC is sorted, if 'b' is less than 'c',
      // all subsequent elements will also be greater than 'b'.
      // So, we can break this loop.
      break ;
    }
    else
    {
      // If 'b' is greater than or equal to 'c', this 'c' satisfies the condition.
      // Update 'iC' to the current index and 'countC' to include this element.
      iC = i ;
      countC = i + 1 ; // 'i + 1' gives the count of elements from index 0 to 'i'.
    }
  }

  // Accumulate the sum based on the counts found.
  // The logic implies a combination of elements where 'a < b < c'.
  // 'countA' are elements 'a' such that 'a < b'.
  // '(N - countC)' are elements 'c' such that 'c > b'.
  sum += countA * ( N - countC ) ;
}

// Finally, print the calculated total sum to the console.
console . log ( sum ) ;