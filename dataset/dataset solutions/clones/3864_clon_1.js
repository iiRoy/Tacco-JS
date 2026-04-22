"use strict"; /* This directive enforces stricter parsing and error handling in the code. */

// The main function that processes the input argument.
const main = ( arg ) => {

  // Step 1: Pre-process the input string.
  // It trims any leading/trailing whitespace and then splits the string into an array of lines.
  arg = arg . trim() . split ( "\n" ) ;

  // Step 2: Extract the first number from the input.
  // This number 'N' typically represents the count of items to follow.
  const N = parseInt ( arg [ 0 ] ) ;

  // Step 3: Parse the second line of input into an array of numbers.
  // It splits the string by spaces and then converts each part to a number.
  const nums = arg [ 1 ] . split ( " " ) . map ( x => x * 1 ) ;

  // Step 4: Initialize an array to store cumulative sums (prefix sums).
  // Note: The array is initialized with 'N' elements, and JavaScript's dynamic array resizing
  // handles assignments to indices beyond the initial length.
  const totalSum = new Array ( N ) . fill ( 0 ) ;

  // Step 5: Calculate the cumulative sums.
  // totalSum[0] will be 0 (from fill), totalSum[1] will be nums[0],
  // totalSum[2] will be nums[0] + nums[1], and so on.
  // This loop iterates through 'nums' and calculates totalSum[i+1].
  nums . forEach ( ( num , i ) => {
    totalSum [ i + 1 ] = totalSum [ i ] + num ;
  } ) ;

  // Step 6: Count the occurrences of each cumulative sum.
  // An object (hash map) is used to store these counts, where keys are sums and values are their frequencies.
  let accumObj = { } ;

  totalSum . forEach ( ( num ) => {
    if ( ! accumObj [ num ] ) {
      // If this cumulative sum is encountered for the first time, initialize its count to 1.
      accumObj [ num ] = 1 ;
    } else {
      // If it has been seen before, increment its existing count.
      accumObj [ num ] ++ ;
    }
  } ) ;

  // Step 7: Calculate the final answer.
  // The problem often involves finding pairs (i, j) such that totalSum[j] - totalSum[i] = 0,
  // which simplifies to finding pairs of identical cumulative sums.
  // For each sum that appears 'k' times, the number of ways to choose 2 of them is k * (k-1) / 2.
  let ans = 0 ;

  Object . keys ( accumObj ) . forEach ( ( x ) => {
    ans += accumObj [ x ] * ( accumObj [ x ] - 1 ) / 2 ;
  } ) ;

  // Step 8: Print the calculated answer to the console.
  console . log ( ans ) ;
} ;

/*
 * This is the entry point of the script.
 * It reads the entire content of '/dev/stdin' as a UTF-8 string,
 * then passes this string to the 'main' function for processing.
 * This is a common pattern for competitive programming in Node.js.
 */
main ( require ( 'fs' ) . readFileSync ( '/dev/stdin' , 'utf8' ) ) ;