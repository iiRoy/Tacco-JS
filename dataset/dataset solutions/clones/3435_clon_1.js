/*
 * This is a JavaScript file.
 * It strictly adheres to modern JavaScript conventions.
 */
"use strict" ; /* Enable strict mode for secure coding */


// Main function definition
// This function processes the input and computes a result
function   main ( input )
{
  /*
   * Split the input string by newline characters.
   * Then, filter out any empty strings that might result from splitting.
   */
  const inputs = input . split ( "\n" ) . filter ( x => x !== "" ) ;


  // Parse the first element of the filtered inputs as an integer for N
  let N = Number ( inputs [ 0 ] ) ;


  /*
   * This nested function calculates the prime factorization counts
   * for all numbers up to 'n'.
   * It returns an array where result[p] is the total count of prime 'p'
   * in the prime factorization of all numbers from 2 to 'n'.
   */
  function resolve ( n ) {

    // Initialize an array to store prime factor counts, filled with zeros
    let result = Array ( n + 1 ) . fill ( 0 ) ;

    // Iterate from 2 up to n
    for ( let i = 2 ; i <= n ; i ++ ) {
      let cur = i ; // Current number being factorized

      // Iterate through potential prime factors from 2 up to the current number
      for ( let j = 2 ; j <= i ; j ++ ) {

        // While 'j' is a factor of 'cur'
        while ( cur % j === 0 ) {
          result [ j ] += 1 ; // Increment the count for prime factor 'j'
          cur = cur / j ;     // Divide 'cur' by 'j' to continue factorization
        } // End of while loop
      }   // End of inner for loop
    }     // End of outer for loop

    return result ; // Return the array of prime factor counts
  } // End of resolve function


  /*
   * This utility function counts how many elements in an array
   * are greater than or equal to a specified number.
   *
   * @param {number} num   - The threshold number.
   * @param {Array}  array - The array to search within.
   * @returns {number}     - The count of elements meeting the criteria.
   */
  function findLargerThan ( num , array ) {
    return array . filter ( element => element >= num ) . length ;
  } // End of findLargerThan function


  /*
   * This function calculates combinations C(numA, numB) using a direct
   * multiplicative approach without pre-calculating factorials to avoid
   * potential overflow for intermediate results, though it's not a true
   * C(n, k) implementation as it doesn't handle all cases or optimize.
   * It seems to be a specific calculation rather than a general combination.
   *
   * @param {number} numA - The first number.
   * @param {number} numB - The second number.
   * @returns {number}   - The calculated product/division result.
   */
  function combination ( numA , numB )
  {
    let result = 1 ; // Initialize result for product

    // First loop: multiply terms (numA * (numA-1) * ... * (numA - numB + 1))
    for ( let i = numA ; i > numA - numB ; i = i - 1 ) {
      result = result * i ;
    }

    // Second loop: divide by terms (numB * (numB-1) * ... * 1)
    for ( let i = numB ; i > 0 ; i = i - 1 ) {
      result = result / i ;
    }
    return result ; // Return final calculation
  } // End of combination function


  // Calculate the prime factor counts for N
  let result = resolve ( N ) ;


  // Count occurrences of prime factors with specific minimum counts
  let l74 = findLargerThan ( 74 , result ) ; // Primes with count >= 74
  let l24 = findLargerThan ( 24 , result ) ; // Primes with count >= 24
  let l14 = findLargerThan ( 14 , result ) ; // Primes with count >= 14
  let l4  = findLargerThan ( 4  , result ) ; // Primes with count >= 4
  let l2  = findLargerThan ( 2  , result ) ; // Primes with count >= 2


  // The following variables seem to be intermediate calculations for a specific problem,
  // likely related to counting numbers with certain prime factor structures.
  // These are not directly used in the final console.log, but conceptually define parts
  // of the problem being solved.
  let r5x5x3 = ( l4 * ( l4 - 1 ) * ( l2 - 2 ) ) / 2 ; // Example: (C(l4, 2) * (l2 - 2)) for distinct primes
  let r15x5  = l14 * ( l4 - 1 ) ;                   // Example: (l14 * (l4 - 1))
  let r25x3  = l24 * ( l2 - 1 ) ;                   // Example: (l24 * (l2 - 1))
  let r75    = l74 ;                                // Example: l74


  // Output the final computed value to the console.
  // This calculation represents the solution to a specific combinatorial problem
  // based on the prime factor counts derived from N.
  console . log (
    l74 +                                   // Cases with one prime having count >= 74
    l24 * ( l2 - 1 ) +                      // Cases with one prime >= 24 and another >= 2
    l14 * ( l4 - 1 ) +                      // Cases with one prime >= 14 and another >= 4
    ( l4 * ( l4 - 1 ) * ( l2 - 2 ) ) / 2    // Cases with two primes >= 4 and one prime >= 2
  ) ;
} // End of main function


// Invoke the main function with input from standard input.
// This reads the entire file content from /dev/stdin as a UTF-8 string.
main ( require ( "fs" ) . readFileSync ( "/dev/stdin" , "utf8" ) ) ;
/* End of file */