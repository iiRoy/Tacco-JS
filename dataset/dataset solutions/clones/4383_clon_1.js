/*
 * This script reads input from stdin, processes an array of numbers,
 * and calculates the maximum frequency of a number plus its immediate neighbors.
 * It uses Node.js 'fs' module for file system operations.
 */
var fs = require ( "fs" ) ; // Import the 'fs' module for file system operations.

// Immediately invoke the main processing function with content read from standard input.
Main ( fs . readFileSync ( "/dev/stdin" , "utf-8" ) ) ;


/**
 * The primary function responsible for processing the input data and calculating the result.
 * It takes the raw input string, parses it, and then computes a specific statistic.
 *
 * @param {string} input - The raw input string read from standard input.
 */
function Main ( input )
{

  // Step 1: Split the input string by newline characters to separate lines.
  input = input . split ( "\n" ) ;

  // Step 2: Parse the first line as an integer. This 'N' value is often
  //         the count of elements, though it might not be explicitly used
  //         in all parts of the subsequent logic.
  N = parseInt ( input [ 0 ] , 10 ) ;

  // Step 3: Take the second line of input, which is expected to contain space-separated numbers,
  //         and split it into an array of string numbers.
  input = input [ 1 ] . split ( " " ) ;

  // Step 4: Convert each string number in the array to an actual integer.
  //         The 'map' function applies the 'parseInt' transformation to each element.
  input = input . map ( function ( value ) {
    return parseInt ( value , 10 ) ;
  } ) ;

  // Initialize the 'ans' variable which will store the maximum calculated frequency.
  var ans = 0 ;

  // Iterate over each number in the processed 'input' array.
  // The 'for...in' loop iterates over the indices of the array.
  for ( var i in input )
  {
    // For each number 'input[i]', calculate the sum of counts for three values:
    // 1. 'input[i] - 1' (the number immediately preceding it)
    // 2. 'input[i]' (the number itself)
    // 3. 'input[i] + 1' (the number immediately succeeding it)
    // This 'tmp' variable holds the combined frequency for this "group" of numbers.
    var tmp = count ( input , input [ i ] - 1 ) + count ( input , input [ i ] ) + count ( input , input [ i ] + 1 ) ;

    // If the currently calculated 'tmp' value is greater than the stored 'ans',
    // update 'ans' to this new maximum value.
    if ( ans < tmp )
    {
      ans = tmp ;
    }
  }

  // Finally, print the maximum calculated frequency to the console.
  console . log ( ans ) ;
}


/**
 * A helper function to count the occurrences of a specific number within an array.
 * This function iterates through the given array and tallies how many times
 * the target number appears.
 *
 * @param {Array<number>} input - The array of numbers to be searched.
 * @param {number} num - The specific number whose occurrences are to be counted.
 * @returns {number} The total count of 'num' found in the 'input' array.
 */
function count ( input , num )
{
  var count_num = 0 ; // Initialize a counter for the target number.

  // Loop through the input array using a traditional 'for' loop for index-based access.
  for ( var j = 0 ; j < input . length ; j ++ )
  {
    // Check if the current element of the array matches the target number.
    if ( input [ j ] == num )
    {
      count_num ++ ; // If it matches, increment the counter.
    }
  }

  return count_num ; // Return the final count.
}